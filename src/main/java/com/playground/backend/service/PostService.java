package com.playground.backend.service;

import com.playground.backend.dto.PostDetailDto;
import com.playground.backend.dto.PostSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    public List<PostSummaryDto> getPosts() {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/contents/posts",
                username, contentRepo
        );

        List<Map<String, Object>> files = gitHubApiClient.get(
                url,
                new ParameterizedTypeReference<>() {}
        );

        return files.stream()
                .filter(file -> ((String) file.get("name")).endsWith(".md"))
                .map(file -> {
                    String filename = (String) file.get("name");
                    Map<String, String> frontmatter = fetchFrontmatter(filename);
                    return PostSummaryDto.builder()
                            .title(frontmatter.getOrDefault("title", filename))
                            .date(frontmatter.getOrDefault("date", ""))
                            .description(frontmatter.getOrDefault("description", ""))
                            .category(frontmatter.getOrDefault("category", "기타"))  // 카테고리 추가
                            .filename(filename)
                            .build();
                })
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
    }

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

    private Map<String, String> fetchFrontmatter(String filename) {
        return parseFrontmatter(fetchDecodedContent(filename));
    }

    private Map<String, String> parseFrontmatter(String content) {
        if (!content.startsWith("---")) {
            return Map.of();
        }
        int end = content.indexOf("---", 3);
        if (end == -1) {
            return Map.of();
        }
        String frontmatter = content.substring(3, end).trim();
        return frontmatter.lines()
                .filter(line -> line.contains(":"))
                .collect(Collectors.toMap(
                        line -> line.substring(0, line.indexOf(":")).trim(),
                        line -> line.substring(line.indexOf(":") + 1).trim()
                                .replace("\"", ""),
                        (a, b) -> a
                ));
    }

    private String removeFrontmatter(String content) {
        if (!content.startsWith("---")) {
            return content;
        }
        int end = content.indexOf("---", 3);
        if (end == -1) {
            return content;
        }
        return content.substring(end + 3).trim();
    }
}







/* 리펙토링 전 코드
package com.playground.backend.service;

import com.playground.backend.dto.PostDetailDto;
import com.playground.backend.dto.PostSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    @Value("${github.token}")
    private String token;

    @Value("${github.username}")
    private String username;

    @Value("${github.content-repo}")
    private String contentRepo;

    private final RestTemplate restTemplate;

    // GitHub API 호출할 때 항상 필요한 헤더
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.set("Accept", "application/vnd.github.v3+json");
        return headers;
    }

    // 글 목록 가져오기
    public List<PostSummaryDto> getPosts() {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/contents/posts",
                username, contentRepo
        );

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody().stream()
                .filter(file -> ((String) file.get("name")).endsWith(".md"))
                .map(file -> {
                    String fileName = (String) file.get("name");
                    Map<String, String> frontmatter = fetchFrontmatter(fileName);
                    return PostSummaryDto.builder()
                            .title(frontmatter.getOrDefault("title", fileName))
                            .date(frontmatter.getOrDefault("date", ""))
                            .description(frontmatter.getOrDefault("description", ""))
                            .fileName(fileName)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 글 상세 가져오기
    public PostDetailDto getPost(String fileName) {
        String decoded = fetchDecodedContent(fileName);
        Map<String, String> frontmatter = parseFrontmatter(decoded);
        String content = removeFrontmatter(decoded);

        return PostDetailDto.builder()
                .title(frontmatter.getOrDefault("title", fileName))
                .date(frontmatter.getOrDefault("date", ""))
                .description(frontmatter.getOrDefault("description", ""))
                .content(content)
                .fileName(fileName)
                .build();
    }

    // 파일 내용 가져와서 Base64 디코딩
    private String fetchDecodedContent(String fileName) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/contents/posts/%s",
                username, contentRepo, fileName
        );

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        String encoded = (String) response.getBody().get("content");
        return new String(
                Base64.getMimeDecoder().decode(encoded),
                StandardCharsets.UTF_8
        );
    }

    // Frontmatter만 따로 필요할 때 (목록 조회용)
    private Map<String, String> fetchFrontmatter(String fileName) {
        return parseFrontmatter(fetchDecodedContent(fileName));
    }

    // Frontmatter 파싱 (title, date, description 추출)
    private Map<String, String> parseFrontmatter(String content) {
        if (!content.startsWith("---")) {
            return Map.of();
        }
        int end = content.indexOf("---", 3);
        if (end == -1) {
            return Map.of();
        }
        String frontmatter = content.substring(3, end).trim();
        return frontmatter.lines()
                .filter(line -> line.contains(":"))
                .collect(Collectors.toMap(
                        line -> line.substring(0, line.indexOf(":")).trim(),
                        line -> line.substring(line.indexOf(":") + 1).trim()
                                .replace("\"", ""),
                        (a, b) -> a
                ));
    }

    // Frontmatter 제거하고 본문만 반환
    private String removeFrontmatter(String content) {
        if (!content.startsWith("---")) {
            return content;
        }
        int end = content.indexOf("---", 3);
        if (end == -1) {
            return content;
        }
        return content.substring(end + 3).trim();
    }
}
*/
