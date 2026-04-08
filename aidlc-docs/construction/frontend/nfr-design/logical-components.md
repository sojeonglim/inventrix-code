# Frontend Logical Components

> NFR 패턴을 구현하는 논리적 컴포넌트/모듈 구조

---

## 1. Core Infrastructure

### QueryProvider (`lib/query-client.ts`)
- React Query 글로벌 설정
- 기본 staleTime, gcTime, retry 정책
- 글로벌 에러 핸들러 (onError)

### ApiClient (`lib/api-client.ts`)
- fetch wrapper
- 토큰 자동 첨부
- 401 → refresh → retry 로직 (mutex)
- 에러 응답 파싱 (ErrorResponse 타입)

### Validators (`lib/validators.ts`)
- Zod 스키마 모음
- 폼별 검증 스키마 export

---

## 2. Context Providers

### AuthProvider (`contexts/AuthContext.tsx`)
- 상태: user, token, isAuthenticated
- 메서드: login, register, logout, refreshToken
- 토큰 만료 감지 + 자동 refresh

### ThemeProvider (`contexts/ThemeContext.tsx`)
- 상태: mode (light/dark/system), resolved (light/dark)
- 메서드: setTheme, toggleTheme
- 초기화: localStorage → system preference
- html.dark 클래스 동기화

### ToastProvider (`contexts/ToastContext.tsx`)
- 상태: toasts 배열 (최대 3개)
- 메서드: addToast, removeToast
- Radix Toast.Provider 래핑

---

## 3. SSE Manager (`hooks/use-sse.ts`)

- EventSource 연결 관리
- 이벤트 타입별 핸들러 등록
- Exponential backoff 재연결
- 인증 상태 연동 (로그인 시 연결, 로그아웃 시 해제)
- React Query cache 직접 업데이트

---

## 4. Layout Components

### PublicLayout
- 최소 헤더 (로고 + Login/Register)
- 인증 페이지용

### CustomerLayout
- Header (Store, My Orders, 알림 벨, 다크 모드, 사용자 메뉴)
- Main content area
- 모바일: 햄버거 메뉴

### AdminLayout
- Header + 고정 Sidebar (7개 메뉴)
- Main content area
- 모바일: 사이드바 오버레이

### StaffLayout
- Header + 축소 Sidebar (2개 메뉴)
- Main content area

---

## 5. Error Handling Layer

### GlobalErrorBoundary
- 최상위 에러 캐치
- 에러 페이지 렌더링
- console.error 로깅

### PageErrorBoundary
- 페이지 단위 에러 격리
- 재시도 버튼 제공
- 다른 페이지 네비게이션 유지

### API Error Handler (ApiClient 내장)
- HTTP 상태별 분기 처리
- 401 → refresh 시도
- 4xx → 에러 메시지 추출
- 5xx → 일반 에러 메시지

---

## 6. 컴포넌트 의존성 흐름

```
App
├── QueryClientProvider (React Query)
│   ├── AuthProvider
│   │   ├── ThemeProvider
│   │   │   ├── ToastProvider
│   │   │   │   ├── GlobalErrorBoundary
│   │   │   │   │   ├── RouterProvider
│   │   │   │   │   │   ├── SSE Hook (인증 시 활성화)
│   │   │   │   │   │   ├── PublicLayout / CustomerLayout / AdminLayout / StaffLayout
│   │   │   │   │   │   │   ├── PageErrorBoundary
│   │   │   │   │   │   │   │   └── Page (lazy loaded)
│   │   │   │   ├── ToastContainer (포탈)
```

---

## 7. 번들 Chunk 매핑

| Logical Component | Chunk |
|---|---|
| React, ReactDOM, React Router | `vendor-react` |
| React Query | `vendor-query` |
| Radix UI primitives | `vendor-ui` |
| Recharts | `vendor-charts` (lazy) |
| Auth pages | `pages-auth` (lazy) |
| Customer pages | `pages-customer` (lazy) |
| Admin pages | `pages-admin` (lazy) |
| Staff pages | `pages-staff` (lazy) |
| Core (ApiClient, Contexts, Hooks) | `main` bundle |
