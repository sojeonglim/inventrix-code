# Cross-Unit Contracts

> 이 문서는 Unit 간 병렬 개발을 위한 공유 계약입니다.
> 각 담당자는 이 계약을 기준으로 독립적으로 개발을 진행합니다.

---

## 1. Shared Types (공유 타입)

### Enums

```typescript
type Role = 'admin' | 'staff' | 'customer'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

type RefundStatus = 'pending_refund' | 'refunded'

type ReservationStatus = 'active' | 'confirmed' | 'expired' | 'released'

type NotificationType =
  | 'order_created'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'stock_low'
  | 'stock_depleted'
  | 'role_changed'
  | 'security_alert'
```

### Core Models (API 응답 형식)

```typescript
interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string  // ISO 8601
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number           // 실제 재고
  availableStock: number  // 가용 재고 (실제 - 예약)
  imageUrl: string | null
  createdAt: string
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  gst: number
  total: number
  status: OrderStatus
  createdAt: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Refund {
  id: string
  orderId: string
  amount: number
  status: RefundStatus
  processedBy: string | null
  processedAt: string | null
  createdAt: string
}

interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null  // 관련 엔티티 참조 (orderId 등)
  read: boolean
  createdAt: string
}

interface StockInfo {
  productId: string
  productName: string
  stock: number           // 실제 재고
  availableStock: number  // 가용 재고
  reservedStock: number   // 예약된 수량
}
```

### Pagination

```typescript
interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 요청 시 query params
// ?page=1&pageSize=20
```

### Error Response (통일 형식)

```typescript
interface ErrorResponse {
  error: {
    code: string        // 머신 리더블 (예: 'VALIDATION_ERROR', 'INSUFFICIENT_STOCK')
    message: string     // 사용자 표시용
    details?: unknown   // 추가 정보 (검증 에러 시 필드별 에러 등)
  }
}

// HTTP 상태 코드 규칙:
// 400 - 입력 검증 실패
// 401 - 인증 실패 (토큰 없음/만료)
// 403 - 권한 없음 (역할 부족)
// 404 - 리소스 없음
// 409 - 충돌 (재고 부족, 잘못된 상태 전이)
// 429 - Rate limit 초과
// 500 - 서버 내부 에러
```

---

## 2. REST API Contract

### 인증 헤더
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### JWT Payload
```typescript
interface JWTPayload {
  userId: string
  email: string
  role: Role
  iat: number
  exp: number
}
```

---

### Auth API (`/api/auth`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | ❌ | — | `RegisterInput` | `AuthResult` |
| POST | `/api/auth/login` | ❌ | — | `LoginInput` | `AuthResult` |
| POST | `/api/auth/refresh` | ✅ | any | — | `AuthResult` |
| POST | `/api/auth/logout` | ✅ | any | — | 204 |

```typescript
interface RegisterInput {
  email: string
  password: string   // 비밀번호 정책: 최소 8자, 대소문자+숫자+특수문자
  name: string
}

interface LoginInput {
  email: string
  password: string
}

interface AuthResult {
  token: string
  user: User
}
```

---

### Products API (`/api/products`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/products` | ❌ | — | query: `ProductFilters` | `PaginatedResult<Product>` |
| GET | `/api/products/:id` | ❌ | — | — | `Product` |
| POST | `/api/products` | ✅ | admin | `CreateProductInput` | `Product` (201) |
| PUT | `/api/products/:id` | ✅ | admin | `UpdateProductInput` | `Product` |
| DELETE | `/api/products/:id` | ✅ | admin | — | 204 |
| POST | `/api/products/generate-image` | ✅ | admin | `GenerateImageInput` | `{ imageUrl: string }` |

```typescript
interface ProductFilters {
  search?: string      // 이름/설명 검색
  page?: number
  pageSize?: number
}

interface CreateProductInput {
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
}

interface UpdateProductInput {
  name?: string
  description?: string
  price?: number
  stock?: number
  imageUrl?: string
}

interface GenerateImageInput {
  productName: string
  description: string
}
```

---

### Orders API (`/api/orders`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/orders` | ✅ | admin, staff: 전체 / customer: 본인 | query: `OrderFilters` | `PaginatedResult<Order>` |
| GET | `/api/orders/:id` | ✅ | admin, staff: 전체 / customer: 본인만 | — | `Order` |
| POST | `/api/orders` | ✅ | customer | `CreateOrderInput` | `Order` (201) |
| PATCH | `/api/orders/:id/status` | ✅ | 역할별 허용 전이 다름 | `UpdateStatusInput` | `Order` |
| POST | `/api/orders/:id/cancel` | ✅ | admin: processing까지 / customer: pending만 | — | `Order` |

```typescript
interface OrderFilters {
  status?: OrderStatus
  page?: number
  pageSize?: number
}

interface CreateOrderInput {
  items: Array<{
    productId: string
    quantity: number
  }>
}

interface UpdateStatusInput {
  status: OrderStatus
}
```

**주문 상태 전이 규칙 (역할별):**

| 현재 상태 | → 가능한 전이 | 허용 역할 |
|---|---|---|
| pending | → processing | admin |
| pending | → cancelled | admin, customer(본인) |
| processing | → shipped | admin, staff |
| processing | → cancelled | admin |
| shipped | → delivered | admin, staff |
| delivered | — (변경 불가) | — |
| cancelled | — (변경 불가) | — |

---

### Refunds API (`/api/refunds`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/refunds` | ✅ | admin | query: `RefundFilters` | `PaginatedResult<Refund>` |
| PATCH | `/api/refunds/:id` | ✅ | admin | `{ status: RefundStatus }` | `Refund` |

```typescript
interface RefundFilters {
  status?: RefundStatus
  page?: number
  pageSize?: number
}
```

---

### Inventory API (`/api/inventory`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/inventory` | ✅ | admin, staff | query: `StockFilters` | `PaginatedResult<StockInfo>` |
| PATCH | `/api/inventory/:productId` | ✅ | admin, staff | `{ stock: number }` | `StockInfo` |

```typescript
interface StockFilters {
  lowStock?: boolean   // 부족 재고만 필터
  page?: number
  pageSize?: number
}
```

---

### Users API (`/api/users`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/users` | ✅ | admin | — | `User[]` |
| PATCH | `/api/users/:id/role` | ✅ | admin | `{ role: Role }` | `User` |

---

### Analytics API (`/api/analytics`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/analytics/dashboard` | ✅ | admin | — | `DashboardKPIs` |
| GET | `/api/analytics/revenue` | ✅ | admin | query: `DateRange` | `RevenueStats` |
| GET | `/api/analytics/orders` | ✅ | admin | query: `DateRange` | `OrderStats` |
| GET | `/api/analytics/inventory` | ✅ | admin | — | `InventoryStats` |

```typescript
interface DashboardKPIs {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  lowStockCount: number
  recentOrders: Order[]
  topProducts: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>
  ordersByStatus: Record<OrderStatus, number>
}

interface DateRange {
  from?: string  // ISO 8601
  to?: string    // ISO 8601
}

interface RevenueStats {
  total: number
  byPeriod: Array<{ date: string; revenue: number }>
}

interface OrderStats {
  total: number
  byStatus: Record<OrderStatus, number>
  byPeriod: Array<{ date: string; count: number }>
}

interface InventoryStats {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  items: StockInfo[]
}
```

---

### Notifications API (`/api/notifications`)

| Method | Path | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/notifications` | ✅ | any (본인) | — | `Notification[]` |
| GET | `/api/notifications/unread-count` | ✅ | any (본인) | — | `{ count: number }` |
| PATCH | `/api/notifications/:id/read` | ✅ | any (본인) | — | 204 |

---

### SSE Endpoint (`/api/sse`)

| Method | Path | Auth | Role | Response |
|---|---|---|---|---|
| GET | `/api/sse/connect` | ✅ | any | SSE stream |

---

## 3. SSE Event Schema

### 연결 프로토콜
```
GET /api/sse/connect
Authorization: Bearer <JWT_TOKEN>
Accept: text/event-stream

// 서버 응답
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

// Heartbeat (30초 간격)
: heartbeat

// 이벤트 형식
event: <event_type>
data: <JSON payload>
```

### 이벤트 타입 및 Payload

```typescript
// 모든 SSE 이벤트의 공통 구조
interface SSEEvent {
  type: string
  payload: unknown
  timestamp: string  // ISO 8601
}
```

| 이벤트 | 대상 | Payload |
|---|---|---|
| `notification` | 해당 사용자 | `Notification` |
| `dashboard_update` | admin | `DashboardKPIs` |
| `order_status_changed` | 해당 고객 | `{ orderId: string, oldStatus: OrderStatus, newStatus: OrderStatus }` |
| `stock_alert` | admin | `{ productId: string, productName: string, currentStock: number, type: 'low' \| 'depleted' }` |

### Frontend SSE 처리 규칙
1. 연결 시 JWT 토큰을 query param 또는 헤더로 전달
2. 연결 끊김 시 exponential backoff로 재연결 (1s, 2s, 4s, 8s, max 30s)
3. `notification` 이벤트 수신 시 토스트 표시 + 알림 벨 카운트 증가
4. `dashboard_update` 이벤트 수신 시 대시보드 KPI 갱신

---

## 4. Infrastructure Contract

### 환경 변수 목록

| 변수명 | 설명 | Unit | 예시 |
|---|---|---|---|
| `DATABASE_URL` | DB 연결 문자열 | Backend, Infra | `postgresql://user:pass@host:5432/inventrix` |
| `JWT_SECRET` | JWT 서명 키 | Backend, Infra | (시크릿 매니저에서 로드) |
| `JWT_EXPIRES_IN` | 토큰 만료 시간 | Backend | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | 리프레시 토큰 만료 | Backend | `7d` |
| `PORT` | API 서버 포트 | Backend, Infra | `3000` |
| `NODE_ENV` | 실행 환경 | Backend, Infra | `production` |
| `CORS_ORIGIN` | 허용 Origin | Backend, Infra | `https://inventrix.example.com` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit 윈도우 | Backend | `900000` (15분) |
| `RATE_LIMIT_MAX` | 윈도우당 최대 요청 | Backend | `100` |
| `AWS_REGION` | AWS 리전 | Backend, Infra | `ap-northeast-2` |
| `SES_FROM_EMAIL` | 발신 이메일 주소 | Backend, Infra | `noreply@inventrix.example.com` |
| `RESERVATION_TIMEOUT_MS` | 재고 예약 타임아웃 | Backend | `900000` (15분) |
| `LOW_STOCK_THRESHOLD` | 부족 재고 임계값 | Backend | `10` |
| `LOG_LEVEL` | 로그 레벨 | Backend, Infra | `info` |

### DB 요구사항 (Infra 담당자 참고)
- 프로덕션급 RDBMS (구체적 선택은 Backend 담당자 결정)
- TLS 암호화 (in-transit)
- 저장 암호화 (at-rest)
- 커넥션 풀링 지원
- 마이그레이션 도구 호환

### 외부 서비스 요구사항
- **AWS Bedrock** (기존): Nova Canvas v1 — AI 이미지 생성
- **AWS SES** (신규): 이메일 알림 발송 — 도메인 인증, 발신 주소 설정 필요

---

## 5. 보안 계약 (Security Baseline)

모든 Unit에 공통 적용:

| 항목 | Backend | Frontend | Infra |
|---|---|---|---|
| HTTPS only | — | — | ✅ SSL/TLS 설정 |
| 보안 헤더 (CSP, HSTS 등) | ✅ 미들웨어 | — | ✅ Nginx 헤더 |
| 입력 검증 (Zod) | ✅ 모든 API | ✅ 폼 검증 | — |
| JWT 시크릿 외부화 | ✅ 환경 변수 | — | ✅ 시크릿 매니저 |
| Rate limiting | ✅ 미들웨어 | — | — |
| CORS 제한 | ✅ 허용 Origin만 | — | — |
| 감사 로그 | ✅ 주요 액션 기록 | — | ✅ 로그 수집 |
| 에러 메시지 (정보 노출 방지) | ✅ 일반 메시지만 | ✅ 일반 메시지만 | — |
