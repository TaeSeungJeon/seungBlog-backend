package com.playground.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommentResponseDto {
    private Long id;
    private String author;
    private String avatarUrl;
    private String content;
    private String createdAt;
    private ReplyDto reply;
}
