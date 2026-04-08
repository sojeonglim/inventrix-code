# Frontend NFR Design Patterns

> NFR Requirements를 구현하기 위한 설계 패턴

---

## 1. 성능 패턴

### 코드 스플리팅 (Route-based Lazy Loading)
```typescript
// React.lazy + Suspense로 라우트별 분리
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'))
// Suspense fallback으로 Skeleton 표시
```
- 적용 대상: 모든 페이지 컴포넌트
- 효과: 초기 번들 사이즈 감소, LCP < 3초 달성

### 서버 상태 캐싱 (Stale-While-Revalidate)
- React Query의 staleTime/gcTime으로 구현
- 정적 데이터(상품): staleTime 5분 — 네트워크 요청 최소화
- 동적 데이터(주문/재고): staleTime 30초 — 적절한 신선도 유지
- SSE 연동 데이터(대시보드/알림): staleTime 0 — SSE로 직접 cache 업데이트

### 낙관적 업데이트 (Optimistic Update)
- 알림 읽음 처리: 즉시 UI 반영 → 실패 시 rollback
- 적용 기준: 실패 시 사용자 영향이 적은 작업만

### 이미지 Lazy Loading
```html
<img loading="lazy" src={url} alt={name} />
```
- 모든 상품 이미지에 적용
- 뷰포트 진입 시 로드

---

## 2. 안정성 패턴

### Error Boundary (계층적 에러 격리)
```
App
├── GlobalErrorBoundary          — 최상위 (앱 크래시 방지)
│   ├── Layout
│   │   ├── PageErrorBoundary    — 페이지 단위 격리
│   │   │   └── Page Content
```
- GlobalErrorBoundary: "문제가 발생했습니다" + 홈 이동 버튼
- PageErrorBoundary: "이 페이지를 로드할 수 없습니다" + 재시도 버튼
- 에러 정보는 console.error만 (사용자에게 내부 정보 노출 금지)

### SSE 재연결 (Exponential Backoff)
```
연결 끊김 → 1s 대기 → 재연결 시도
실패 → 2s → 4s → 8s → 16s → 30s (max)
성공 → backoff 리셋
로그아웃 → 재연결 중단
```

### React Query Retry
- 네트워크 에러: 3회 retry (exponential backoff)
- 4xx 에러: retry 안 함 (클라이언트 에러)
- 5xx 에러: 2회 retry

---

## 3. 보안 패턴

### 인증 토큰 관리
```
API 호출 → 401 수신
  → refresh token 시도
    → 성공: 새 토큰 저장 + 원래 요청 재시도
    → 실패: logout + /login 리다이렉트
```
- 동시 다발 401 시 refresh 요청 1회만 (mutex)

### Route Guard (선언적 접근 제어)
```typescript
// 라우트 정의에서 선언적으로 권한 지정
<Route element={<RouteGuard requireAuth allowedRoles={['admin']} />}>
  <Route path="/admin/*" element={<AdminLayout />} />
</Route>
```
- 미인증 → `/login` 리다이렉트
- 권한 없음 → `/` 리다이렉트

### 입력 검증 (Defense in Depth)
- 1차: React Hook Form + Zod (클라이언트)
- 2차: Backend API 검증 (서버) — 클라이언트 검증은 UX용, 보안은 서버 의존

---

## 4. UX 패턴

### 스켈레톤 로딩
- React Query `isLoading` 상태에서 Skeleton 컴포넌트 표시
- 페이지별 전용 Skeleton (레이아웃 유지)
- Suspense fallback으로도 활용

### 토스트 알림 (Radix Toast)
- 우측 상단 고정
- 자동 닫힘 5초, 최대 3개 스택
- 타입별 색상: success/error/warning/info
- SSE 이벤트 → 자동 토스트 생성

### 다크 모드 (Tailwind Class Strategy)
```
초기화: localStorage → system preference → light (기본)
전환: html.dark 클래스 토글 → Tailwind dark: 변형 적용
저장: localStorage('theme-mode')
```

### 반응형 레이아웃
- 모바일: 단일 컬럼, 햄버거 메뉴, 사이드바 오버레이
- 태블릿: 2컬럼 그리드, 축소된 사이드바
- 데스크톱: 풀 레이아웃, 고정 사이드바

---

## 5. 데이터 흐름 패턴

### 단방향 데이터 흐름
```
User Action → React Hook Form → Zod Validation
  → React Query Mutation → API Call
    → 성공: Cache Invalidation → UI 자동 갱신
    → 실패: Error Toast + Form 에러 표시
```

### SSE → Cache 직접 업데이트
```
SSE Event 수신 → 이벤트 타입 분기
  → dashboard_update: queryClient.setQueryData(['dashboard'], newData)
  → notification: queryClient.invalidateQueries(['notifications'])
  → order_status_changed: queryClient.invalidateQueries(['orders'])
  → stock_alert: Toast 표시
```
