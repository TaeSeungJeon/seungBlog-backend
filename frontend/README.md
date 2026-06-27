# React + TypeScript + Vite
---
## Tech Stack

### IDE
- IntelliJ 25.3.2

### Frontend
- React
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Markdown

### Authentication
- GitHub OAuth
- JWT(LocalStorage 저장)

### Build / Deploy
- npm
- gh-pages

---

개인 기술 블로그이자 포트폴리오 사이트의 프론트엔드 프로젝트입니다.  
React + TypeScript + Vite 기반으로 구현했으며, 게시글 조회, 상세 포스트 렌더링,  
GitHub OAuth 로그인, 방명록 작성 기능을 포함하고 있습니다.

백엔드 서버와 연동하여 Markdown 기반 게시글을 불러오고, JWT 인증을 통해 사용자 로그인 및 방명록 기능을 처리합니다.

---

## Project Overview

이 프로젝트는 단순한 정적 소개 페이지가 아니라,  
**기술 블로그 + 포트폴리오 + 사용자 상호작용 기능**을 함께 담은 웹 애플리케이션입니다.

주요 목적은 다음과 같습니다.

- 개인 기술 블로그 운영
- 포트폴리오 프로젝트 소개
- GitHub OAuth 기반 로그인 처리
- 인증 사용자의 방명록 작성/삭제 기능 제공
- Markdown 게시글 렌더링 및 코드 하이라이팅 지원

---

## Main Features

### 1) Home
- 최근 게시글 목록 조회
- 최근 프로젝트 소개
- 타이핑 애니메이션 적용
- 스크롤 진입 시 fade-in 애니메이션 처리

### 2) Posts
- 전체 게시글 목록 조회
- 카테고리별 필터링
- 게시글 제목 / 설명 / 날짜 표시

### 3) Post Detail
- 선택한 게시글 상세 조회
- Markdown 렌더링
- 코드 블록 문법 하이라이팅

### 4) About
- 자기소개
- 기술 스택
- 개발 경험 / 교육 / 기타 이력 정리

### 5) Guestbook
- 방명록 목록 조회
- 로그인 사용자 방명록 작성
- 작성자 본인 또는 권한 기준 삭제 기능 연동 가능 구조

### 6) Playground
- 실험용 페이지
- 프로젝트 카드/소개성 UI 구성

### 7) GitHub Login
- GitHub OAuth 인가 코드 수신
- 백엔드에 code 전달
- JWT 발급 후 LocalStorage 저장
- 로그인 상태 UI 반영

---

## 4. Directory Structure

```bash
src
├── api
│   ├── authApi.ts
│   ├── axiosInstance.ts
│   ├── guestbookApi.ts
│   └── postApi.ts
├── components
│   ├── Footer.tsx
│   └── Header.tsx
├── hooks
│   └── useScrollFadeIn.ts
├── pages
│   ├── AboutPage.tsx
│   ├── CallbackPage.tsx
│   ├── GuestbookPage.tsx
│   ├── HomePage.tsx
│   ├── PlaygroundPage.tsx
│   ├── PostDetailPage.tsx
│   └── PostsPage.tsx
├── styles
│   └── index.css
├── types
│   └── index.ts
├── App.tsx
└── main.tsx
