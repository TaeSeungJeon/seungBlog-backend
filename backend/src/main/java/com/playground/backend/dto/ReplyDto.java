package com.playground.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReplyDto {
    private String content;
    private String createdAt;
    private String avatarUrl;
}
