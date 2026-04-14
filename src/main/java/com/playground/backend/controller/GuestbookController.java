package com.playground.backend.controller;

import com.playground.backend.dto.GuestbookRequestDto;
import com.playground.backend.dto.GuestbookResponseDto;
import com.playground.backend.service.GuestbookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
@RequiredArgsConstructor
public class GuestbookController {

    private final GuestbookService guestbookService;

    @GetMapping
    public ResponseEntity<List<GuestbookResponseDto>> getGuestbook() {
        return ResponseEntity.ok(guestbookService.getGuestbook());
    }

    @PostMapping
    public ResponseEntity<GuestbookResponseDto> createGuestbook(
            @RequestBody GuestbookRequestDto req,
            @AuthenticationPrincipal String username
    ) {
        return ResponseEntity.ok(guestbookService.createGuestbook(req, username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuestbook(
            @PathVariable Long id,
            @AuthenticationPrincipal String username
    ) {
        guestbookService.deleteGuestbook(id, username);
        return ResponseEntity.noContent().build();
    }
}