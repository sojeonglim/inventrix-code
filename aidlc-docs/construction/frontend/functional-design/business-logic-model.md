# Frontend Business Logic Model

> API Client, 인증, RBAC, SSE, 알림, 다크 모드, 폼 검증 등 핵심 비즈니스 로직

---

## 1. API Client (React Query 기반)

### 구조

```
src/lib/api-client.ts       — fetch wrapper (토큰 자동 첨부, 에러 핸들링, refresh)
src/hooks/use-auth.ts       — 인증 관련 mutations
src/hooks/use-products.ts   — 상품 queries/mutations
src/hooks/use-orders.ts     — 주문 queries/mutations
src/hooks/use-inventory.ts  — 재고 queries/mutations
src/hooks/use-users.ts      — 사용자 관리 queries/mutations
src/hooks/use-analytics.ts  — 분석 queries
src/hooks/use-notifications.ts — 알림 queries/mutations
src/hooks/use-refunds.ts    — 환불 queries/mutations
```

### API Client Core (`api-client.ts`)

```typescript
// Base fetch wrapper
async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T>
  // 1. localStorage에서 token 읽기
  // 2. Authorization 헤더 자동 첨부
  // 3. 응답 처리:
  //    - 401: token refresh 시도 → 실패 시 logout
  //    - 4xx/5xx: ErrorResponse 파싱 후 throw
  //    - 200: JSON 파싱 후 반환
```

### React Query 캐싱 전략 (하이브리드)

| 데이터 | staleTime | gcTime | refetchOnWindowFocus |
|---|---|---|---|
| 상품 목록 | 5분 | 10분 | true |
| 상품 상세 | 5분 | 10분 | true |
| 주문 목록 | 30초 | 5분 | true |
| 재고 정보 | 30초 | 5분 | true |
| 대시보드 KPI | 0 (SSE로 갱신) | 5분 | true |
| 알림 | 0 (SSE로 갱신) | 5분 | true |
| 사용자 목록 | 2분 | 10분 | true |
| 분석 데이터 | 1분 | 5분 | true |

### API ↔ Endpoint 매핑 (cross-unit-contracts 기반)

| Hook | Method | Endpoint | Auth | Role |
|---|---|---|---|---|
| `useProducts` | GET | `/api/products` | ❌ | — |
| `useProduct` | GET | `/api/products/:id` | ❌ | — |
| `useCreateProduct` | POST | `/api/products` | ✅ | admin |
| `useUpdateProduct` | PUT | `/api/products/:id` | ✅ | admin |
| `useDeleteProduct` | DELETE | `/api/products/:id` | ✅ | admin |
| `useGenerateImage` | POST | `/api/products/generate-image` | ✅ | admin |
| `useOrders` | GET | `/api/orders` | ✅ | 역할별 필터 |
| `useOrder` | GET | `/api/orders/:id` | ✅ | 역할별 |
| `useCreateOrder` | POST | `/api/orders` | ✅ | customer |
| `useUpdateOrderStatus` | PATCH | `/api/orders/:id/status` | ✅ | 역할별 |
| `useCancelOrder` | POST | `/api/orders/:id/cancel` | ✅ | 역할별 |
| `useRefunds` | GET | `/api/refunds` | ✅ | admin |
| `useUpdateRefund` | PATCH | `/api/refunds/:id` | ✅ | admin |
| `useInventory` | GET | `/api/inventory` | ✅ | admin, staff |
| `useUpdateStock` | PATCH | `/api/inventory/:productId` | ✅ | admin, staff |
| `useUsers` | GET | `/api/users` | ✅ | admin |
| `useUpdateUserRole` | PATCH | `/api/users/:id/role` | ✅ | admin |
| `useDashboard` | GET | `/api/analytics/dashboard` | ✅ | admin |
| `useRevenue` | GET | `/api/analytics/revenue` | ✅ | admin |
| `useOrderStats` | GET | `/api/analytics/orders` | ✅ | admin |
| `useInventoryStats` | GET | `/api/analytics/inventory` | ✅ | admin |
| `useNotifications` | GET | `/api/notifications` | ✅ | any |
| `useUnreadCount` | GET | `/api/notifications/unread-count` | ✅ | any |
| `useMarkAsRead` | PATCH | `/api/notifications/:id/read` | ✅ | any |

### Mutation 후 Cache Invalidation

| Mutation | Invalidate |
|---|---|
| createProduct | `['products']` |
| updateProduct | `['products']`, `['product', id]` |
| deleteProduct | `['products']` |
| createOrder | `['orders']`, `['products']` (재고 변동) |
| updateOrderStatus | `['orders']`, `['order', id]`, `['dashboard']` |
| cancelOrder | `['orders']`, `['order', id]`, `['products']`, `['dashboard']` |
| updateStock | `['inventory']`, `['products']` |
| updateUserRole | `['users']` |
| updateRefund | `['refunds']` |
| markAsRead | `['notifications']`, `['unread-count']` |

---

## 2. 인증 흐름

### 로그인
1. `POST /api/auth/login` → `AuthResult` 수신
2. `token`을 localStorage에 저장
3. `user` 정보를 React Query cache에 저장
4. 역할에 따라 리다이렉트: admin → `/admin`, staff → `/`, customer → `/`

### 회원가입
1. `POST /api/auth/register` → `AuthResult` 수신
2. 로그인과 동일한 토큰/사용자 저장 흐름
3. 기본 역할: customer → `/` 리다이렉트

### 토큰 갱신
1. API 호출 시 401 수신
2. `POST /api/auth/refresh` 시도
3. 성공: 새 토큰 저장 후 원래 요청 재시도
4. 실패: logout 처리 → `/login` 리다이렉트

### 로그아웃
1. `POST /api/auth/logout`
2. localStorage에서 token 제거
3. React Query cache 전체 clear
4. SSE 연결 종료
5. `/login` 리다이렉트

---

## 3. RBAC 라우팅

### 라우트 구조 (중첩 라우팅)

```
/                          — PublicLayout
├── /login                 — 비인증 전용
├── /register              — 비인증 전용
├── /                      — CustomerLayout (인증 선택)
│   ├── / (index)          — Storefront (모든 사용자)
│   ├── /products/:id      — ProductDetail (모든 사용자)
│   └── /orders            — Orders (인증 필수, customer: 본인만)
├── /admin                 — AdminLayout (admin 전용)
│   ├── / (index)          — Dashboard
│   ├── /products          — Products CRUD
│   ├── /orders            — Orders 관리
│   ├── /inventory         — Inventory 관리
│   ├── /users             — User Roles 관리
│   ├── /refunds           — Refund 관리
│   └── /analytics         — Analytics
└── /staff                 — StaffLayout (staff 전용)
    ├── /orders            — Orders 조회 + 배송 상태 변경
    └── /inventory         — Inventory 조회/수정
```

### Route Guard 로직
1. `requireAuth` 체크 → 미인증 시 `/login` 리다이렉트
2. `allowedRoles` 체크 → 권한 없으면 `/` 리다이렉트
3. 비인증 전용 라우트 (`/login`, `/register`) → 인증 시 `/` 리다이렉트

---

## 4. SSE 연결 관리

### 연결 흐름
1. 인증된 사용자 로그인 시 SSE 연결 시작
2. `GET /api/sse/connect` + `Authorization: Bearer <token>`
3. 이벤트 수신 시 타입별 처리:
   - `notification` → 토스트 표시 + 알림 카운트 증가 + notifications cache invalidate
   - `dashboard_update` → dashboard query cache 직접 업데이트
   - `order_status_changed` → orders cache invalidate + 토스트
   - `stock_alert` → 토스트 (admin만)

### 재연결 (Exponential Backoff)
- 연결 끊김 감지 시: 1s → 2s → 4s → 8s → 16s → 30s (max)
- 재연결 성공 시 backoff 리셋
- 로그아웃 시 재연결 중단

---

## 5. 알림 시스템

### 토스트 (실시간)
- 위치: 우측 상단
- 자동 닫힘: 5초
- 최대 스택: 3개 (초과 시 가장 오래된 것 제거)
- 타입별 스타일: success(초록), error(빨강), warning(노랑), info(파랑)

### 알림 벨
- 헤더에 벨 아이콘 + 읽지 않은 알림 수 badge
- 클릭 시 알림 드롭다운 표시
- 알림 클릭 시 `PATCH /api/notifications/:id/read` → 읽음 처리

---

## 6. 다크 모드

### 구현
- Tailwind `darkMode: 'class'` 설정
- `<html>` 태그에 `dark` 클래스 토글
- 3가지 모드: light / dark / system
- system 모드: `window.matchMedia('(prefers-color-scheme: dark)')` 감지
- 설정값 localStorage에 저장 (`theme-mode`)

### 초기화 순서
1. localStorage에서 `theme-mode` 읽기
2. 없으면 `system` 기본값
3. system이면 media query로 resolved 값 결정
4. `<html>`에 `dark` 클래스 적용/제거

---

## 7. 폼 검증 (React Hook Form + Zod)

### 검증 스키마 (cross-unit-contracts 기반)

| 폼 | 검증 규칙 |
|---|---|
| 로그인 | email: 이메일 형식, password: 필수 |
| 회원가입 | email: 이메일 형식, password: 8자+, 대소문자+숫자+특수문자, name: 필수 |
| 상품 생성/수정 | name: 필수, price: 양수, stock: 0 이상 정수 |
| 주문 생성 | items: 1개 이상, quantity: 1 이상 정수 |
| 재고 수정 | stock: 0 이상 정수 |
| 역할 변경 | role: Role enum 값 |
