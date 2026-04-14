package com.playground.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    // 우리가 직접 던지는 예외 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException e) {
        return ResponseEntity
                .status(e.getStatus())
                .body(ErrorResponse.builder()
                        .status(e.getStatus().value())
                        .message(e.getMessage())
                        .build());
    }

    // GitHub API 호출 실패 처리
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<ErrorResponse> handleHttpClientErrorException(
            HttpClientErrorException e
    ) {
        return ResponseEntity
                .status(e.getStatusCode())
                .body(ErrorResponse.builder()
                        .status(e.getStatusCode().value())
                        .message("GitHub API 호출 실패: " + e.getMessage())
                        .build());
    }

    // 예상치 못한 에러 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("예상치 못한 에러 발생: {}", e.getMessage(), e); // 이 줄 추가
        return ResponseEntity
                .internalServerError()
                .body(ErrorResponse.builder()
                        .status(500)
                        .message("서버 내부 오류가 발생했습니다.")
                        .build());
    }
}
