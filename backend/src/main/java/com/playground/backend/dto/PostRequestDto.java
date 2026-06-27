package com.playground.backend.dto;

/**
 * 글 생성/수정 요청용 DTO
 * content 는 마크다운 본문, 나머지는 frontmatter 로 저장된다.
 */

import lombok.Getter;

@Getter
public class PostRequestDto {
    private String filename;     // 선택 — 없으면 title 로 생성
    private String title;
    private String date;         // 선택 — 없으면 오늘 날짜
    private String description;
    private String category;     // 선택 — 없으면 "기타"
    private String content;      // 마크다운 본문
}
