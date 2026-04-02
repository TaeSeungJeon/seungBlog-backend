package com.playground.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GuestbookResponseDto {
    private Long id;
    private String title;
    private String content;
    private String author;
    private String avatarUrl;
    private String createdAt;
}
