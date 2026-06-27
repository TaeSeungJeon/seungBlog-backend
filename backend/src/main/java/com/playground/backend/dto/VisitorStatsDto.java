package com.playground.backend.dto;


import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class VisitorStatsDto {
    private long totalViews;
    private long todayViews;
    private long weekViews;
    private Map<String, Map<String, Long>> dailyCounts;
}
