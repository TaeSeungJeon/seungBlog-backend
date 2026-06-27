package com.playground.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthTokenDto {
    private String accessToken;
    private String username;
    private String avatarUrl;
}
// 로그인 성공 후 프론트에 돌려줄 데이터
