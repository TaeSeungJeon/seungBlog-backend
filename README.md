# SeungBlog

Spring Boot(백엔드) + React(프론트엔드) 모노레포.

## 구조

```
seungBlog-backend/
├── backend/    # Spring Boot (Java 21, Maven)
│   ├── src/
│   ├── pom.xml
│   └── mvnw
├── frontend/   # React (Vite + TypeScript)
│   ├── src/
│   └── package.json
└── .github/    # CI (backend 배포)
```

## 로컬 실행

### 백엔드
```bash
cd backend
./mvnw spring-boot:run
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

## 배포
- **백엔드**: `backend/**` 변경 시 `.github/workflows/deploy.yml` 가 서버로 JAR 배포.
- **프론트엔드**: `frontend/` 에서 `npm run deploy` (gh-pages).
