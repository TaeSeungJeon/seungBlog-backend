package com.playground.backend.service;

import com.playground.backend.dto.GuestbookRequestDto;
import com.playground.backend.dto.GuestbookResponseDto;
import com.playground.backend.dto.ReplyDto;
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

    private static final Pattern META_PATTERN =
            Pattern.compile("^<!-- guestbook-author: (\\S+) avatar: (\\S+) -->\\n?");

    public List<GuestbookResponseDto> getGuestbook() {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues?state=open&labels=guestbook",
                username, contentRepo
        );
        List<Map<String, Object>> issues = gitHubApiClient.get(url, new ParameterizedTypeReference<>() {});
        return issues.stream()
                .map(this::mapToGuestbookResponse)
                .collect(Collectors.toList());
    }

    public GuestbookResponseDto createGuestbook(GuestbookRequestDto req, String author) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues", username, contentRepo
        );
        String avatarUrl = "https://github.com/" + author + ".png";
        String bodyWithMeta = "<!-- guestbook-author: " + author
                + " avatar: " + avatarUrl + " -->\n"
                + req.getContent();

        Map<String, Object> body = Map.of(
                "title", req.getTitle(),
                "body", bodyWithMeta,
                "labels", List.of("guestbook")
        );
        Map<String, Object> issue = gitHubApiClient.post(url, body, new ParameterizedTypeReference<>() {});
        return mapToGuestbookResponse(issue);
    }

    // 신규 — 오너만 답글
    public GuestbookResponseDto createGuestbookReply(Long issueNumber, String content, String requestingUser) {
        if (!requestingUser.equals(username)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "방명록 답글은 관리자만 작성할 수 있습니다.");
        }
        String replyUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d/comments",
                username, contentRepo, issueNumber
        );
        gitHubApiClient.post(replyUrl, Map.of("body", content), new ParameterizedTypeReference<>() {});

        String issueUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d",
                username, contentRepo, issueNumber
        );
        Map<String, Object> issue = gitHubApiClient.get(issueUrl, new ParameterizedTypeReference<>() {});
        return mapToGuestbookResponse(issue);
    }

    // 기존 그대로 — 변경 없음
    public void deleteGuestbook(Long id, String requestingUser) {
        String issueUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d",
                username, contentRepo, id
        );
        Map<String, Object> issue = gitHubApiClient.get(issueUrl, new ParameterizedTypeReference<>() {});
        String rawBody = (String) issue.get("body");
        String author = parseAuthor(rawBody);

        if (!requestingUser.equals(author) && !requestingUser.equals(username)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "자신의 방명록만 삭제할 수 있습니다.");
        }

        gitHubApiClient.patchWithPost(issueUrl, Map.of("state", "closed"));
    }

    @SuppressWarnings("unchecked")
    private GuestbookResponseDto mapToGuestbookResponse(Map<String, Object> issue) {
        String rawBody = (String) issue.get("body");
        String author = parseAuthor(rawBody);
        String avatarUrl = parseAvatarUrl(rawBody);
        String content = stripMeta(rawBody);

        if (author == null) {
            Map<String, Object> user = (Map<String, Object>) issue.get("user");
            author = (String) user.get("login");
            avatarUrl = (String) user.get("avatar_url");
            content = rawBody;
        }

        Long issueNumber = ((Number) issue.get("number")).longValue();
        return GuestbookResponseDto.builder()
                .id(issueNumber)
                .title((String) issue.get("title"))
                .content(content)
                .author(author)
                .avatarUrl(avatarUrl)
                .createdAt((String) issue.get("created_at"))
                .reply(fetchReply(issueNumber))   // 추가
                .build();
    }

    // 신규
    @SuppressWarnings("unchecked")
    private ReplyDto fetchReply(Long issueNumber) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d/comments",
                username, contentRepo, issueNumber
        );
        List<Map<String, Object>> comments = gitHubApiClient.get(url, new ParameterizedTypeReference<>() {});
        if (comments == null || comments.isEmpty()) return null;

        Map<String, Object> first = comments.get(0);
        Map<String, Object> user = (Map<String, Object>) first.get("user");
        if (!username.equalsIgnoreCase((String) user.get("login"))) return null;

        return ReplyDto.builder()
                .avatarUrl((String) user.get("avatar_url"))
                .content((String) first.get("body"))
                .createdAt((String) first.get("created_at"))
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

    @SuppressWarnings("unchecked")
    public void deleteGuestbookReply(Long issueNumber, String requestingUser) {
        if (!requestingUser.equalsIgnoreCase(username)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "답글은 관리자만 삭제할 수 있습니다.");
        }
        String commentsUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d/comments",
                username, contentRepo, issueNumber
        );
        List<Map<String, Object>> comments = gitHubApiClient.get(commentsUrl, new ParameterizedTypeReference<>() {});
        if (comments == null || comments.isEmpty()) return;

        comments.stream()
                .filter(c -> {
                    Map<String, Object> user = (Map<String, Object>) c.get("user");
                    return username.equalsIgnoreCase((String) user.get("login"));
                })
                .findFirst()
                .ifPresent(c -> {
                    Long commentId = ((Number) c.get("id")).longValue();
                    String deleteUrl = String.format(
                            "https://api.github.com/repos/%s/%s/issues/comments/%d",
                            username, contentRepo, commentId
                    );
                    gitHubApiClient.delete(deleteUrl);
                });
    }

}
