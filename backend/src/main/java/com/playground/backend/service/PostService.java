package com.playground.backend.service;

import com.playground.backend.dto.PostDetailDto;
import com.playground.backend.dto.PostSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
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