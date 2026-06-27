package com.playground.backend.controller;

import com.playground.backend.dto.AuthTokenDto;
import com.playground.backend.exception.CustomException;
import com.playground.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/github")
    public ResponseEntity<AuthTokenDto> githubLogin(@RequestParam String code) {
        return ResponseEntity.ok(authService.githubLogin(code));
    }

    @GetMapping("/me")
    public ResponseEntity<String> me(@AuthenticationPrincipal String username) {
        if (username == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return ResponseEntity.ok(username);
    }
}
