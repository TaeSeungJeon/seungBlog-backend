package com.playground.backend.service;

import com.playground.backend.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GitHubApiClient {

    @Value("${github.token}")
    private String token;

    private final RestTemplate restTemplate;

    // DELETE(body 포함) 전용 — 기본 HttpURLConnection 은 body 있는 DELETE 를 지원하지 않아 JDK HttpClient 사용.
    // GET/POST/PUT 은 기존 RestTemplate 그대로 두어 검증된 동작을 유지한다.
    private final HttpClient jdkHttpClient = HttpClient.newHttpClient();

    public void delete(String url) {
        restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(createHeaders()), Void.class);
    }

    // DELETE 요청 (body 포함) — GitHub Contents API 파일 삭제는 sha 를 body 로 요구함
    // body 는 문자열 값으로 이루어진 Map 을 기대한다 (예: message, sha)
    public void delete(String url, Object body) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(url).build().encode(StandardCharsets.UTF_8).toUri();
            String json = toJson(body);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/vnd.github.v3+json")
                    .header("Content-Type", "application/json")
                    .method("DELETE", HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> response = jdkHttpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new CustomException(HttpStatus.valueOf(response.statusCode()),
                        "GitHub 파일 삭제 실패: " + response.body());
            }
        } catch (IOException e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "GitHub 파일 삭제 중 오류: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "GitHub 파일 삭제가 중단되었습니다.");
        }
    }
    // 공통 헤더 생성
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.set("Accept", "application/vnd.github.v3+json");
        return headers;
    }

    // GET 요청
    public <T> T get(String url, ParameterizedTypeReference<T> responseType) {
        ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                responseType
        );
        return response.getBody();
    }

    // POST 요청
    public <T> T post(String url, Object body, ParameterizedTypeReference<T> responseType) {
        HttpHeaders headers = createHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                responseType
        );
        return response.getBody();
    }

    // PUT 요청 — GitHub Contents API 파일 생성/수정
    public <T> T put(String url, Object body, ParameterizedTypeReference<T> responseType) {
        HttpHeaders headers = createHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.PUT,
                new HttpEntity<>(body, headers),
                responseType
        );
        return response.getBody();
    }

    public void patchWithPost(String url, Object body) {
        HttpHeaders headers = createHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-HTTP-Method-Override", "PATCH");

        restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );
    }

    public void patch(String url, Object body) {
        HttpHeaders headers = createHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        restTemplate.exchange(
                url,
                HttpMethod.PATCH,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );
    }

    // 문자열 값 Map → JSON (DELETE body 용 최소 직렬화, Jackson 직접 의존 회피)
    private String toJson(Object body) {
        if (!(body instanceof Map<?, ?> map)) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "DELETE body 는 Map 이어야 합니다.");
        }
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<?, ?> e : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append('"').append(escapeJson(String.valueOf(e.getKey()))).append("\":")
                    .append('"').append(escapeJson(String.valueOf(e.getValue()))).append('"');
        }
        return sb.append("}").toString();
    }

    private String escapeJson(String s) {
        StringBuilder b = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> b.append("\\\"");
                case '\\' -> b.append("\\\\");
                case '\n' -> b.append("\\n");
                case '\r' -> b.append("\\r");
                case '\t' -> b.append("\\t");
                default -> {
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
                }
            }
        }
        return b.toString();
    }

}
