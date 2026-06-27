package com.playground.backend.service;

import com.playground.backend.dto.PostDetailDto;
import com.playground.backend.dto.PostRequestDto;
import com.playground.backend.dto.PostSummaryDto;
import com.playground.backend.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    @Value("${github.username}")
    private String username;

    @Value("${github.content-repo}")
    private String contentRepo;

    private final GitHubApiClient gitHubApiClient;

    // [변경] @Cacheable("posts") 추가
    // 이 메서드의 반환값을 "posts"라는 이름의 캐시에 저장
    // 두 번째 요청부터는 이 메서드 안 코드가 아예 실행되지 않고 캐시에서 즉시 반환
    @Cacheable("posts")
    public List<PostSummaryDto> getPosts() {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/contents/posts",
                username, contentRepo
        );

        List<Map<String, Object>> files = gitHubApiClient.get(
                url,
                new ParameterizedTypeReference<>() {}
        );

        // [변경] .stream() → .parallelStream()
        // 기존: 파일 N개를 순서대로 하나씩 GitHub API 호출 (직렬)
        // 변경: 파일 N개를 동시에 GitHub API 호출 (병렬)
        // 파일이 10개면 10개 요청이 한꺼번에 날아가서 가장 느린 1개 응답 시간만 기다리면 됨
        return files.parallelStream()
                .filter(file -> ((String) file.get("name")).endsWith(".md"))
                .map(file -> {
                    String filename = (String) file.get("name");
                    Map<String, String> frontmatter = fetchFrontmatter(filename);
                    return PostSummaryDto.builder()
                            .title(frontmatter.getOrDefault("title", filename))
                            .date(frontmatter.getOrDefault("date", ""))
                            .description(frontmatter.getOrDefault("description", ""))
                            .category(frontmatter.getOrDefault("category", "기타"))
                            .filename(filename)
                            .build();
                })
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
    }

    // [변경] @Cacheable(value = "postDetail", key = "#filename") 추가
    // 글 상세는 파일마다 내용이 다르기 때문에 key = "#filename"으로 파일명별로 각각 캐싱
    // ex) post-a.md 캐시, post-b.md 캐시가 별도로 저장됨
    @Cacheable(value = "postDetail", key = "#filename")
    public PostDetailDto getPost(String filename) {
        String decoded = fetchDecodedContent(filename);
        Map<String, String> frontmatter = parseFrontmatter(decoded);
        String content = removeFrontmatter(decoded);

        return PostDetailDto.builder()
                .title(frontmatter.getOrDefault("title", filename))
                .date(frontmatter.getOrDefault("date", ""))
                .description(frontmatter.getOrDefault("description", ""))
                .content(content)
                .filename(filename)
                .build();
    }

    // [신규] 캐시 수동 초기화 메서드
    // 새 글을 올린 직후 10분 자동 만료를 기다리지 않고 즉시 반영하고 싶을 때 호출
    // @CacheEvict : "posts"와 "postDetail" 캐시에 저장된 모든 항목을 삭제
    // allEntries = true : 특정 key만 지우는 게 아니라 해당 캐시 전체를 비움
    @CacheEvict(value = {"posts", "postDetail"}, allEntries = true)
    public void clearCache() {}

    // =========================  CRUD (관리자 전용)  =========================
    // 모든 쓰기 작업은 content 레포(posts/*.md)에 직접 커밋되며, 완료 후 캐시를 초기화한다.

    // [신규] 글 작성 — content 레포에 새 .md 파일 생성
    @CacheEvict(value = {"posts", "postDetail"}, allEntries = true)
    public PostDetailDto createPost(PostRequestDto req, String requestingUser) {
        verifyOwner(requestingUser);
        if (req.getContent() == null || req.getContent().isBlank()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "본문 내용이 필요합니다.");
        }

        String filename = resolveFilename(req);
        if (fetchSha(filename) != null) {
            throw new CustomException(HttpStatus.CONFLICT, "이미 존재하는 글입니다: " + filename);
        }

        Map<String, Object> body = Map.of(
                "message", "post: create " + filename,
                "content", encode(buildMarkdown(req))
        );
        gitHubApiClient.put(contentsUrl(filename), body, new ParameterizedTypeReference<Map<String, Object>>() {});
        return toDetail(req, filename);
    }

    // [신규] 글 수정 — 기존 파일 sha 를 받아 덮어쓰기
    @CacheEvict(value = {"posts", "postDetail"}, allEntries = true)
    public PostDetailDto updatePost(String filename, PostRequestDto req, String requestingUser) {
        verifyOwner(requestingUser);
        if (req.getContent() == null || req.getContent().isBlank()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "본문 내용이 필요합니다.");
        }

        String target = withMd(filename);
        String sha = fetchSha(target);
        if (sha == null) {
            throw new CustomException(HttpStatus.NOT_FOUND, "글을 찾을 수 없습니다: " + target);
        }

        Map<String, Object> body = Map.of(
                "message", "post: update " + target,
                "content", encode(buildMarkdown(req)),
                "sha", sha
        );
        gitHubApiClient.put(contentsUrl(target), body, new ParameterizedTypeReference<Map<String, Object>>() {});
        return toDetail(req, target);
    }

    // [신규] 글 삭제 — sha 를 받아 파일 제거
    @CacheEvict(value = {"posts", "postDetail"}, allEntries = true)
    public void deletePost(String filename, String requestingUser) {
        verifyOwner(requestingUser);

        String target = withMd(filename);
        String sha = fetchSha(target);
        if (sha == null) {
            throw new CustomException(HttpStatus.NOT_FOUND, "글을 찾을 수 없습니다: " + target);
        }

        Map<String, Object> body = Map.of(
                "message", "post: delete " + target,
                "sha", sha
        );
        gitHubApiClient.delete(contentsUrl(target), body);
    }

    // 관리자(github.username) 본인만 허용
    private void verifyOwner(String requestingUser) {
        if (requestingUser == null || !username.equalsIgnoreCase(requestingUser)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "게시글은 관리자만 작성·수정·삭제할 수 있습니다.");
        }
    }

    private String contentsUrl(String filename) {
        return String.format(
                "https://api.github.com/repos/%s/%s/contents/posts/%s",
                username, contentRepo, filename
        );
    }

    // 파일이 존재하면 sha 반환, 없으면 null (GitHub 404 → 신규 파일)
    private String fetchSha(String filename) {
        try {
            Map<String, Object> file = gitHubApiClient.get(
                    contentsUrl(filename),
                    new ParameterizedTypeReference<>() {}
            );
            return file == null ? null : (String) file.get("sha");
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        }
    }

    private String resolveFilename(PostRequestDto req) {
        String fn = req.getFilename();
        if (fn == null || fn.isBlank()) {
            if (req.getTitle() == null || req.getTitle().isBlank()) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "제목 또는 파일명이 필요합니다.");
            }
            // 제목 → 파일명 (공백은 -, 그 외 특수문자 제거, 한글은 유지)
            fn = req.getTitle().trim()
                    .replaceAll("\\s+", "-")
                    .replaceAll("[^0-9A-Za-z가-힣_-]", "");
            if (fn.isBlank()) fn = "post";
        }
        return withMd(fn.trim());
    }

    private String withMd(String filename) {
        return filename.endsWith(".md") ? filename : filename + ".md";
    }

    // frontmatter + 본문 형태의 마크다운 문자열 생성
    private String buildMarkdown(PostRequestDto req) {
        return "---\n"
                + "title: \"" + escape(req.getTitle()) + "\"\n"
                + "date: \"" + resolveDate(req.getDate()) + "\"\n"
                + "description: \"" + escape(req.getDescription()) + "\"\n"
                + "category: \"" + resolveCategory(req.getCategory()) + "\"\n"
                + "---\n\n"
                + (req.getContent() == null ? "" : req.getContent().strip()) + "\n";
    }

    private PostDetailDto toDetail(PostRequestDto req, String filename) {
        return PostDetailDto.builder()
                .title(req.getTitle())
                .date(resolveDate(req.getDate()))
                .description(req.getDescription() == null ? "" : req.getDescription())
                .content(req.getContent() == null ? "" : req.getContent().strip())
                .filename(filename)
                .build();
    }

    private String resolveDate(String date) {
        return (date == null || date.isBlank()) ? LocalDate.now().toString() : date.trim();
    }

    private String resolveCategory(String category) {
        return (category == null || category.isBlank()) ? "기타" : category.trim();
    }

    // frontmatter 값(따옴표 1줄)이 깨지지 않도록 큰따옴표/줄바꿈 정리
    private String escape(String s) {
        return s == null ? "" : s.replace("\"", "'").replace("\n", " ").trim();
    }

    private String encode(String md) {
        return Base64.getEncoder().encodeToString(md.getBytes(StandardCharsets.UTF_8));
    }

    // 이하 private 메서드들은 기존과 동일, 변경 없음

    private Map<String, String> fetchFrontmatter(String filename) {
        return parseFrontmatter(fetchDecodedContent(filename));
    }

    private String fetchDecodedContent(String filename) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/contents/posts/%s",
                username, contentRepo, filename
        );

        Map<String, Object> file = gitHubApiClient.get(
                url,
                new ParameterizedTypeReference<>() {}
        );

        String encoded = (String) file.get("content");
        return new String(
                Base64.getMimeDecoder().decode(encoded),
                StandardCharsets.UTF_8
        );
    }

    private Map<String, String> parseFrontmatter(String content) {
        if (!content.startsWith("---")) return Map.of();
        int end = content.indexOf("---", 3);
        if (end == -1) return Map.of();

        return content.substring(3, end).trim().lines()
                .filter(line -> line.contains(":"))
                .collect(Collectors.toMap(
                        line -> line.substring(0, line.indexOf(":")).trim(),
                        line -> line.substring(line.indexOf(":") + 1).trim().replace("\"", ""),
                        (a, b) -> a
                ));
    }

    private String removeFrontmatter(String content) {
        if (!content.startsWith("---")) return content;
        int end = content.indexOf("---", 3);
        if (end == -1) return content;
        return content.substring(end + 3).trim();
    }
}