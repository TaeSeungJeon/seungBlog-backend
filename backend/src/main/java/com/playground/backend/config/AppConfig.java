package com.playground.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    // GET/POST/PUT 은 기본 RestTemplate 그대로 사용 (검증된 동작 유지).
    // body 가 있는 DELETE 만 GitHubApiClient 에서 JDK HttpClient 로 별도 처리한다.
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}