package com.playground.backend.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching  // 프로젝트 전체 캐시 기능 활성화 스위치
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // ConcurrentMapCacheManager : 추가 의존성 없이 Spring에 내장된 기본 캐시
        // Caffeine보다 단순하지만 이 프로젝트 규모에서는 성능 차이 없음
        return new ConcurrentMapCacheManager("posts", "postDetail");
    }
}