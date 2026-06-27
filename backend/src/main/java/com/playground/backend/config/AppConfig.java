package com.playground.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    // JDK HttpClient 기반 팩토리 사용
    // 기본 SimpleClientHttpRequestFactory(HttpURLConnection)는 body 가 있는 DELETE 를 지원하지 않아
    // GitHub Contents API 파일 삭제(sha 를 body 로 전달)가 불가능하다. JDK HttpClient 는 이를 지원한다.
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate(new JdkClientHttpRequestFactory());
    }

}