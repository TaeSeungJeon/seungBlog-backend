package com.playground.backend.controller;

import com.playground.backend.dto.VisitorStatsDto;
import com.playground.backend.exception.CustomException;
import com.playground.backend.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;

    @Value("${github.username}")
    private String owner;

    @PostMapping
    public ResponseEntity<Void> recordVisit(@AuthenticationPrincipal String username) {
        visitorService.recordVisit(username);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<VisitorStatsDto> getStats(@AuthenticationPrincipal String username) {
        if (username == null || !owner.equalsIgnoreCase(username)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");
        }
        return ResponseEntity.ok(visitorService.getStats());
    }
}
