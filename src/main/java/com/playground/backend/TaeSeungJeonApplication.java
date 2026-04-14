package com.playground.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class TaeSeungJeonApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaeSeungJeonApplication.class, args);
    }
}

/*
서버 업데이트

1. 로컬에서 빌드
.\mvnw clean package -DskipTests

2. 서버로 전송
scp -i C:\Users\CUBE_USER\Desktop\My\ssh-key-2026-04-06.key target\TaeSeungJeon-0.0.1-SNAPSHOT.jar ubuntu@134.185.119.179:/home/ubuntu/

3. 서버 재시작
ssh -i C:\Users\CUBE_USER\Desktop\My\ssh-key-2026-04-06.key ubuntu@134.185.119.179
sudo systemctl restart seung-backend
*/
