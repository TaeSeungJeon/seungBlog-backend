# SeungBlog Backend
---

## Tech Stack

### IDE
- IntelliJ 25.3.2

### Backend
- Java 21 
- Spring Boot
- Spring Web (REST API)
- Spring Security

### Authentication
- GitHub OAuth
- JWT (Access Token 기반)

### Infra
- Oracle Cloud VM.Standard.A1.Flex (ARM, 1OCPU / 6GB)

### Domain / SSL
- DuckDNS + Let's Encrypt (Certbot)

### 리버스 프록시
- Nginx
  
---

Spring Boot 기반의 개인 기술 블로그 백엔드 서버입니다.  
게시글 조회, GitHub OAuth 로그인, JWT 인증, 방명록 기능을 제공합니다.

프론트엔드(React)와 REST API로 통신하며,  
Markdown 기반 게시글을 제공하는 블로그 플랫폼 구조로 설계되었습니다.

---

## Project Overview

이 프로젝트는 단순 CRUD 서버가 아닌  
**인증 + 콘텐츠 + 사용자 인터랙션**을 포함한 실제 서비스 형태의 프로젝트입니다.

주요 목적:
- 게시글 조회 API 제공
- GitHub OAuth 기반 로그인 구현
- JWT 인증 구조 설계
- 방명록 기능 구현
- 프론트엔드와 REST API 통신 구조 설계

