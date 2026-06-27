package com.playground.backend.dto;

/**
 * 글 상세용 DTO*/

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostDetailDto {
    private String title;
    private String date;
    private String description;
    private String content;
    private String filename;
}
