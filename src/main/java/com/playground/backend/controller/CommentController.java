package com.playground.backend.controller;

import com.playground.backend.dto.CommentRequestDto;
import com.playground.backend.dto.CommentResponseDto;
import com.playground.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{filename}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getComments(@PathVariable String filename) {
        return ResponseEntity.ok(commentService.getComments(filename));
    }

    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable String filename,
            @RequestBody CommentRequestDto req,
            @AuthenticationPrincipal String username
    ) {
        return ResponseEntity.ok(commentService.createComment(filename, req, username));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<CommentResponseDto> createReply(
            @PathVariable Long id,
            @RequestBody CommentRequestDto req,
            @AuthenticationPrincipal String username
    ) {
        return ResponseEntity.ok(commentService.createReply(id, req.getContent(), username));
    }

    @DeleteMapping("/{id}/reply")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long id,
            @AuthenticationPrincipal String username
    ) {
        commentService.deleteReply(id, username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal String username
    ) {
        commentService.deleteComment(id, username);
        return ResponseEntity.noContent().build();
    }
}
