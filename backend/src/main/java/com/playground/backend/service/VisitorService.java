package com.playground.backend.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.playground.backend.dto.VisitorStatsDto;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
@RequiredArgsConstructor
public class VisitorService {

    @Value("${github.username}")
    private String owner;

    @Value("${github.content-repo}")
    private String contentRepo;

    private final GitHubApiClient gitHubApiClient;
    private final ObjectMapper objectMapper;

    // date -> { "anonymous" or username -> count }
    private final ConcurrentHashMap<String, ConcurrentHashMap<String, Long>> dailyCounts = new ConcurrentHashMap<>();
    private final AtomicLong analyticsIssueNumber = new AtomicLong(-1);

    @PostConstruct
    public void init() {
        try {
            String url = String.format(
                    "https://api.github.com/repos/%s/%s/issues?state=open&labels=visitor-analytics&per_page=1",
                    owner, contentRepo
            );
            List<Map<String, Object>> issues = gitHubApiClient.get(url, new ParameterizedTypeReference<>() {});
            if (issues != null && !issues.isEmpty()) {
                Map<String, Object> issue = issues.get(0);
                analyticsIssueNumber.set(((Number) issue.get("number")).longValue());
                String body = (String) issue.get("body");
                if (body != null && !body.isBlank()) {
                    Map<String, Map<String, Long>> loaded = objectMapper.readValue(body, new TypeReference<>() {});
                    loaded.forEach((date, counts) ->
                            dailyCounts.put(date, new ConcurrentHashMap<>(counts))
                    );
                    log.info("방문자 통계 로드 완료: {}일치 데이터", loaded.size());
                }
            }
        } catch (Exception e) {
            log.warn("방문자 통계 로드 실패: {}", e.getMessage());
        }
    }

    public void recordVisit(String username) {
        String today = LocalDate.now().toString();
        String key = (username != null && !username.isBlank()) ? username : "anonymous";
        dailyCounts.computeIfAbsent(today, k -> new ConcurrentHashMap<>())
                .merge(key, 1L, Long::sum);
    }

    public VisitorStatsDto getStats() {
        String today = LocalDate.now().toString();
        LocalDate weekAgo = LocalDate.now().minusDays(7);

        long todayViews = dailyCounts.getOrDefault(today, new ConcurrentHashMap<>())
                .values().stream().mapToLong(Long::longValue).sum();

        long weekViews = dailyCounts.entrySet().stream()
                .filter(e -> !LocalDate.parse(e.getKey()).isBefore(weekAgo))
                .flatMap(e -> e.getValue().values().stream())
                .mapToLong(Long::longValue).sum();

        long totalViews = dailyCounts.values().stream()
                .flatMap(m -> m.values().stream())
                .mapToLong(Long::longValue).sum();

        return VisitorStatsDto.builder()
                .totalViews(totalViews)
                .todayViews(todayViews)
                .weekViews(weekViews)
                .dailyCounts(new TreeMap<>(Collections.reverseOrder()) {{ putAll(dailyCounts); }})
                .build();
    }

    // 5분마다 GitHub Issue에 저장 + 30일 초과 데이터 자동 삭제
    @Scheduled(fixedRate = 300_000)
    public void persist() {
        try {
            if (dailyCounts.isEmpty()) return;

            LocalDate cutoff = LocalDate.now().minusDays(30);
            dailyCounts.keySet().removeIf(date -> LocalDate.parse(date).isBefore(cutoff));

            String body = objectMapper.writeValueAsString(dailyCounts);

            if (analyticsIssueNumber.get() > 0) {
                String url = String.format(
                        "https://api.github.com/repos/%s/%s/issues/%d",
                        owner, contentRepo, analyticsIssueNumber.get()
                );
                gitHubApiClient.patch(url, Map.of("body", body));
            } else {
                String url = String.format(
                        "https://api.github.com/repos/%s/%s/issues",
                        owner, contentRepo
                );
                Map<String, Object> created = gitHubApiClient.post(url,
                        Map.of(
                                "title", "visitor-analytics-data",
                                "body", body,
                                "labels", List.of("visitor-analytics")
                        ),
                        new ParameterizedTypeReference<>() {}
                );
                analyticsIssueNumber.set(((Number) created.get("number")).longValue());
                log.info("방문자 통계 이슈 생성: #{}", analyticsIssueNumber.get());
            }
        } catch (Exception e) {
            log.warn("방문자 통계 저장 실패: {}", e.getMessage());
        }
    }
}
