package com.playground.backend.service;

import com.playground.backend.dto.GuestbookRequestDto;
import com.playground.backend.dto.GuestbookResponseDto;
import com.playground.backend.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuestbookService {

    @Value("${github.username}")
    private String username;

    @Value("${github.content-repo}")
    private String contentRepo;

    private final GitHubApiClient gitHubApiClient;

    // 이슈 body 맨 앞에 삽입할 메타데이터 패턴
    // 예: <!-- guestbook-author: seungA avatar: https://github.com/seungA.png -->
    private static final Pattern META_PATTERN =
            Pattern.compile("^<!-- guestbook-author: (\\S+) avatar: (\\S+) -->\\n?");

    public List<GuestbookResponseDto> getGuestbook() {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues?state=open&labels=guestbook",
                username, contentRepo
        );

        List<Map<String, Object>> issues = gitHubApiClient.get(
                url,
                new ParameterizedTypeReference<>() {}
        );

        return issues.stream()
                .map(this::mapToGuestbookResponse)
                .collect(Collectors.toList());
    }

    public GuestbookResponseDto createGuestbook(GuestbookRequestDto req, String author) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues",
                username, contentRepo
        );

        // GitHub 표준 아바타 URL 패턴 사용
        String avatarUrl = "https://github.com/" + author + ".png";

        // 이슈 body 앞에 작성자 메타데이터 삽입
        String bodyWithMeta = "<!-- guestbook-author: " + author
                + " avatar: " + avatarUrl + " -->\n"
                + req.getContent();

        Map<String, Object> body = Map.of(
                "title", req.getTitle(),
                "body", bodyWithMeta,
                "labels", List.of("guestbook")
        );

        Map<String, Object> issue = gitHubApiClient.post(
                url,
                body,
                new ParameterizedTypeReference<>() {}
        );

        return mapToGuestbookResponse(issue);
    }

    public void deleteGuestbook(Long id, String requestingUser) {
        // 1. 이슈 조회
        String issueUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d",
                username, contentRepo, id
        );
        Map<String, Object> issue = gitHubApiClient.get(
                issueUrl, new ParameterizedTypeReference<>() {}
        );

        // 2. 메타데이터에서 실제 작성자 추출 후 권한 검증
        String rawBody = (String) issue.get("body");
        String author = parseAuthor(rawBody);

        if (!requestingUser.equals(author)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "본인의 방명록만 삭제할 수 있습니다.");
        }

        // 3. 이슈 닫기 (삭제)
        gitHubApiClient.patchWithPost(issueUrl, Map.of("state", "closed"));
    }

    @SuppressWarnings("unchecked")
    private GuestbookResponseDto mapToGuestbookResponse(Map<String, Object> issue) {
        String rawBody = (String) issue.get("body");
        String author = parseAuthor(rawBody);
        String avatarUrl = parseAvatarUrl(rawBody);
        String content = stripMeta(rawBody);

        // 메타데이터가 없는 구형 이슈는 GitHub user 정보로 폴백
        if (author == null) {
            Map<String, Object> user = (Map<String, Object>) issue.get("user");
            author = (String) user.get("login");
            avatarUrl = (String) user.get("avatar_url");
            content = rawBody;
        }

        return GuestbookResponseDto.builder()
                .id(((Number) issue.get("number")).longValue())
                .title((String) issue.get("title"))
                .content(content)
                .author(author)
                .avatarUrl(avatarUrl)
                .createdAt((String) issue.get("created_at"))
                .build();
    }

    private String parseAuthor(String body) {
        if (body == null) return null;
        Matcher m = META_PATTERN.matcher(body);
        return m.find() ? m.group(1) : null;
    }

    private String parseAvatarUrl(String body) {
        if (body == null) return null;
        Matcher m = META_PATTERN.matcher(body);
        return m.find() ? m.group(2) : null;
    }

    private String stripMeta(String body) {
        if (body == null) return "";
        return META_PATTERN.matcher(body).replaceFirst("").trim();
    }
}