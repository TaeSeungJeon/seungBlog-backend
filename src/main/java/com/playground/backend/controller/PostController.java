package com.playground.backend.controller;

import com.playground.backend.dto.PostDetailDto;
import com.playground.backend.dto.PostSummaryDto;
import com.playground.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostSummaryDto>> getPosts() {
        return ResponseEntity.ok(postService.getPosts());
    }

    @GetMapping("/{filename}")
    public ResponseEntity<PostDetailDto> getPost(@PathVariable String filename) {
        return ResponseEntity.ok(postService.getPost(filename));
    }

    // 캐시 수동 초기화 엔드포인트
    // 새 글 올린 후 https://seungblog.duckdns.org/api/posts/cache/clear 호출하면 즉시 반영
    @DeleteMapping("/cache/clear")
    public ResponseEntity<Void> clearCache() {
        postService.clearCache();
        return ResponseEntity.noContent().build();
    }
}