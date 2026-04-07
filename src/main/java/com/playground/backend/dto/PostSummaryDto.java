package com.playground.backend.dto;

/**
 * 글 목록용 DTO
 * */

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostSummaryDto {
    private String title;
    private String date;
    private String description;
    private String filename;
    private String category;
}
