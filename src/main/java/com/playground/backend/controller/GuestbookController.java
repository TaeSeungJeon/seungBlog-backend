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
            //프론트에서 JSON으로 보낸 데이터를 DTO로 자동 변환
            @AuthenticationPrincipal String username
            //JwtAuthFilter가 SecurityContext에 저장한 username을 자동으로 파라미터로 받아오는 방법
    ){
        return ResponseEntity.ok(guestbookService.createGuestbook(req, username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuestbook(@PathVariable Long id) {
        guestbookService.deleteGuestbook(id);
        return ResponseEntity.noContent().build();
    }

}
