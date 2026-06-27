package com.playground.backend.service;

import com.playground.backend.dto.CommentRequestDto;
import com.playground.backend.dto.CommentResponseDto;
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
public class CommentService {

    @Value("${github.username}")
    private String ownerUsername;

    @Value("${github.content-repo}")
    private String contentRepo;

    private final GitHubApiClient gitHubApiClient;

    private static final Pattern META_PATTERN =
            Pattern.compile("^<!-- comment-post: (\\S+) author: (\\S+) avatar: (\\S+) -->\\n?");

    @SuppressWarnings("unchecked")
    public void deleteReply(Long issueNumber, String requestingUser) {
        if (!requestingUser.equalsIgnoreCase(ownerUsername)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "대댓글은 블로그 주인만 삭제할 수 있습니다.");
        }
        String commentsUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d/comments",
                ownerUsername, contentRepo, issueNumber
        );
        List<Map<String, Object>> comments = gitHubApiClient.get(commentsUrl, new ParameterizedTypeReference<>() {});
        if (comments == null || comments.isEmpty()) return;

        comments.stream()
                .filter(c -> {
                    Map<String, Object> user = (Map<String, Object>) c.get("user");
                    return ownerUsername.equalsIgnoreCase((String) user.get("login"));
                })
                .findFirst()
                .ifPresent(c -> {
                    Long commentId = ((Number) c.get("id")).longValue();
                    String deleteUrl = String.format(
                            "https://api.github.com/repos/%s/%s/issues/comments/%d",
                            ownerUsername, contentRepo, commentId
                    );
                    gitHubApiClient.delete(deleteUrl);
                });
    }

    public List<CommentResponseDto> getComments(String filename) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues?state=open&labels=post-comment&per_page=100",
                ownerUsername, contentRepo
        );
        List<Map<String, Object>> issues = gitHubApiClient.get(url, new ParameterizedTypeReference<>() {});

        return issues.stream()
                .filter(issue -> filename.equals(parseFilename((String) issue.get("body"))))
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    public CommentResponseDto createComment(String filename, CommentRequestDto req, String author) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues", ownerUsername, contentRepo
        );
        String avatarUrl = "https://github.com/" + author + ".png";
        String bodyWithMeta = "<!-- comment-post: " + filename
                + " author: " + author
                + " avatar: " + avatarUrl + " -->\n"
                + req.getContent();

        Map<String, Object> body = Map.of(
                "title", "[comment] " + filename + " by " + author,
                "body", bodyWithMeta,
                "labels", List.of("post-comment")
        );
        Map<String, Object> issue = gitHubApiClient.post(url, body, new ParameterizedTypeReference<>() {});
        return mapToCommentResponse(issue);
    }

    public CommentResponseDto createReply(Long issueNumber, String content, String requestingUser) {
        if (!requestingUser.equals(ownerUsername)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "블로그 주인장만 작성할 수 있습니다.");
        }
        String replyUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d/comments",
                ownerUsername, contentRepo, issueNumber
        );
        gitHubApiClient.post(replyUrl, Map.of("body", content), new ParameterizedTypeReference<>() {});

        String issueUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d",
                ownerUsername, contentRepo, issueNumber
        );
        Map<String, Object> issue = gitHubApiClient.get(issueUrl, new ParameterizedTypeReference<>() {});
        return mapToCommentResponse(issue);
    }

    public void deleteComment(Long issueNumber, String requestingUser) {
        String issueUrl = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d",
                ownerUsername, contentRepo, issueNumber
        );
        Map<String, Object> issue = gitHubApiClient.get(issueUrl, new ParameterizedTypeReference<>() {});
        String author = parseAuthor((String) issue.get("body"));

        if (!requestingUser.equals(author) && !requestingUser.equals(ownerUsername)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "댓글 작성자 또는 주인장만 삭제할 수 있습니다.");
        }
        gitHubApiClient.patchWithPost(issueUrl, Map.of("state", "closed"));
    }

    @SuppressWarnings("unchecked")
    private CommentResponseDto mapToCommentResponse(Map<String, Object> issue) {
        String rawBody = (String) issue.get("body");
        Long issueNumber = ((Number) issue.get("number")).longValue();
        return CommentResponseDto.builder()
                .id(issueNumber)
                .author(parseAuthor(rawBody))
                .avatarUrl(parseAvatarUrl(rawBody))
                .content(stripMeta(rawBody))
                .createdAt((String) issue.get("created_at"))
                .reply(fetchReply(issueNumber))
                .build();
    }

    @SuppressWarnings("unchecked")
    private ReplyDto fetchReply(Long issueNumber) {
        String url = String.format(
                "https://api.github.com/repos/%s/%s/issues/%d/comments",
                ownerUsername, contentRepo, issueNumber
        );
        List<Map<String, Object>> comments = gitHubApiClient.get(url, new ParameterizedTypeReference<>() {});
        if (comments == null || comments.isEmpty()) return null;

        Map<String, Object> first = comments.get(0);
        Map<String, Object> user = (Map<String, Object>) first.get("user");
        if (!ownerUsername.equalsIgnoreCase((String) user.get("login"))) return null;

        return ReplyDto.builder()
                .avatarUrl((String) user.get("avatar_url"))
                .content((String) first.get("body"))
                .createdAt((String) first.get("created_at"))
                .build();
    }

    private String parseFilename(String body) {
        if (body == null) return null;
        Matcher m = META_PATTERN.matcher(body);
        return m.find() ? m.group(1) : null;
    }

    private String parseAuthor(String body) {
        if (body == null) return null;
        Matcher m = META_PATTERN.matcher(body);
        return m.find() ? m.group(2) : null;
    }

    private String parseAvatarUrl(String body) {
        if (body == null) return null;
        Matcher m = META_PATTERN.matcher(body);
        return m.find() ? m.group(3) : null;
    }

    private String stripMeta(String body) {
        if (body == null) return "";
        return META_PATTERN.matcher(body).replaceFirst("").trim();
    }
}
