package com.playground.backend.service;

import com.playground.backend.dto.GuestbookRequestDto;
import com.playground.backend.dto.GuestbookResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuestbookService {

    @Value("${github.token}")
    private String token;

    @Value("${github.username}")
    private String username;

    @Value("${github.content-repo}")
    private String contentRepo;

    private final RestTemplate restTemplate;

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.set("Accept", "application/vnd.github.v3+json");
        return headers;
    }

    // 방명록 목록 조회
    public List<GuestbookResponseDto> getGuestbook() {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues?state=open&labels=guestbook",
                username, contentRepo
        );

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(createHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody().stream()
                .map(this::mapToGuestbookResponse)
                .collect(Collectors.toList());
    }

    // 방명록 글 작성
    public GuestbookResponseDto createGuestbook(GuestbookRequestDto req, String author) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues",
                username, contentRepo
        );

        Map<String, Object> body = Map.of(
                "title", req.getTitle(),
                "body", req.getContent(),
                "labels", List.of("guestbook")
        );

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(body, createHeaders()),
                new ParameterizedTypeReference<>() {}
        );

        return mapToGuestbookResponse(response.getBody());
    }

    // 방명록 글 삭제 (Issue close)
    public void deleteGuestbook(Long id) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d",
                username, contentRepo, id
        );

        Map<String, Object> body = Map.of("state", "closed");

        restTemplate.exchange(
                url,
                HttpMethod.PATCH,
                new HttpEntity<>(body, createHeaders()),
                new ParameterizedTypeReference<>() {}
        );
    }

    // GitHub Issue 응답을 GuestbookResponseDto로 변환
    @SuppressWarnings("unchecked")
    private GuestbookResponseDto mapToGuestbookResponse(Map<String, Object> issue) {
        Map<String, Object> user = (Map<String, Object>) issue.get("user");

        return GuestbookResponseDto.builder()
                .id(((Number) issue.get("number")).longValue())
                .title((String) issue.get("title"))
                .content((String) issue.get("body"))
                .author((String) user.get("login"))
                .avatarUrl((String) user.get("avatar_url"))
                .createdAt((String) issue.get("created_at"))
                .build();
    }
}
