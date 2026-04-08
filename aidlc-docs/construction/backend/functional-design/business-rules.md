# Backend Functional Design — Business Rules

---

## 1. 주문 상태 전이 (State Machine)

### 허용된 전이

| 현재 상태 | → 다음 상태 | 허용 역할 | 부가 효과 |
|---|---|---|---|
| pending | processing | admin | 재고 예약 확정 (confirm reservation) |
| pending | cancelled | admin, customer(본인) | 재고 예약 해제 + 환불 레코드 자동 생성 |
| processing | shipped | admin, staff | — |
| processing | cancelled | admin | 재고 복원 (confirmed → release) + 환불 레코드 자동 생성 |
| shipped | delivered | admin, staff | — |
| delivered | — | — | 변경 불가 (terminal) |
| cancelled | — | — | 변경 불가 (terminal) |

### 검증 규칙
- 유효하지 않은 전이 시도 → 409 Conflict (`INVALID_STATUS_TRANSITION`)
- customer는 본인 주문의 pending → cancelled만 가능
- staff는 processing → shipped, shipped → delivered만 가능

---

## 2. 재고 예약 시스템

### 예약 생명주기
```
주문 생성 → Reservation(active) 생성
  ├─ pending → processing 전환 시 → Reservation(confirmed), 실제 stock 차감
  ├─ pending → cancelled 전환 시 → Reservation(released), 예약 해제
  └─ 15분 타임아웃 → Reservation(expired), 예약 해제, 주문 자동 cancelled
```

### 가용 재고 계산
```
availableStock = product.stock - SUM(active reservations for product)
```

### 동시성 제어
- 예약 생성 시 Prisma `$transaction` + `SELECT ... FOR UPDATE` 패턴
- 가용 재고 < 요청 수량 시 → 400 (`INSUFFICIENT_STOCK`)

### 타임아웃 스케줄러
- `setInterval` (60초 간격)으로 만료된 예약 일괄 처리
- 만료 기준: `reservation.expiresAt < now() AND status = 'active'`
- 만료 시: reservation status → expired, 연결된 order status → cancelled
- EventBus로 `ReservationExpired` 이벤트 발행

---

## 3. 환불 처리

### 자동 생성 규칙
- 주문 cancelled 전환 시 자동으로 Refund 레코드 생성
- `amount = order.total`
- `status = pending_refund`
- 관리자가 PATCH `/api/refunds/:id`로 `refunded`로 변경

---

## 4. 인증 및 보안

### 비밀번호 정책
- 최소 8자
- 대문자 1개 이상
- 소문자 1개 이상
- 숫자 1개 이상
- 특수문자 1개 이상
- Zod regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/`

### 브루트포스 방지
- 5회 연속 로그인 실패 → 계정 15분 잠금 (`lockedUntil` 설정)
- 잠금 시 로그인 시도 → 401 (`ACCOUNT_LOCKED`)
- 성공 로그인 시 `loginAttempts = 0`, `lockedUntil = null`
- 5회 실패 시 EventBus로 `LoginFailed` 보안 이벤트 발행 → 관리자 알림

### JWT 전략
- Access Token: 15분 만료, payload: `{ userId, email, role }`
- Refresh Token: 7일 만료, DB `refresh_tokens` 테이블에 저장
- 로그아웃 시 해당 사용자의 모든 refresh token 삭제
- Refresh 요청 시 기존 token 삭제 + 새 token 발급 (rotation)

---

## 5. RBAC 규칙

### 역할별 API 접근

| 모듈 | admin | staff | customer |
|---|---|---|---|
| Products: 조회 | ✅ | ✅ | ✅ |
| Products: CUD | ✅ | ❌ | ❌ |
| Products: AI 이미지 | ✅ | ❌ | ❌ |
| Orders: 전체 조회 | ✅ | ✅ | ❌ (본인만) |
| Orders: 생성 | ❌ | ❌ | ✅ |
| Orders: 상태 변경 | ✅ (전체) | ✅ (제한적) | ❌ |
| Orders: 취소 | ✅ (processing까지) | ❌ | ✅ (pending만, 본인) |
| Inventory: 조회 | ✅ | ✅ | ❌ |
| Inventory: 수정 | ✅ | ✅ | ❌ |
| Users: 목록/역할 변경 | ✅ | ❌ | ❌ |
| Analytics: 대시보드 | ✅ | ❌ | ❌ |
| Refunds: 조회/처리 | ✅ | ❌ | ❌ |
| Notifications: 본인 | ✅ | ✅ | ✅ |
| SSE: 연결 | ✅ | ✅ | ✅ |

---

## 6. 이메일 알림 규칙

| 이벤트 | 수신자 | 이메일 내용 |
|---|---|---|
| OrderCreated | 주문한 고객 | 주문 확인 (주문번호, 금액, 상품 목록) |
| OrderStatusChanged | 주문한 고객 | 상태 변경 알림 (이전→새 상태) |
| StockLow | 모든 admin | 재고 부족 알림 (상품명, 현재 재고) |
| RoleChanged | 역할 변경된 사용자 | 역할 변경 알림 (이전→새 역할) |

---

## 7. 감사 로그 규칙

### 기록 대상 (포괄 범위)
- 주문: 생성, 상태 변경, 취소
- 상품: 생성, 수정, 삭제
- 재고: 수량 변경
- 사용자: 역할 변경
- 환불: 생성, 상태 변경
- 인증: 로그인 성공/실패, 로그아웃

### 기록 형식
```typescript
{
  userId: string       // 행위자
  action: string       // 예: 'ORDER_STATUS_CHANGED'
  resourceType: string // 예: 'Order'
  resourceId: string   // 예: 'clxyz...'
  previousValue: {}    // 변경 전 값
  newValue: {}         // 변경 후 값
  ipAddress: string
  userAgent: string
  outcome: 'success' | 'failure'
}
```

---

## 8. SSE 이벤트 라우팅 규칙

| 이벤트 | 대상 | 조건 |
|---|---|---|
| `notification` | 특정 사용자 | 해당 userId의 SSE 연결 |
| `dashboard_update` | admin 역할 | role = admin인 모든 연결 |
| `order_status_changed` | 주문 고객 | 해당 order.userId의 연결 |
| `stock_alert` | admin 역할 | role = admin인 모든 연결 |

---

## 9. 입력 검증 규칙 (Zod)

### 공통
- 모든 string: `trim()` 적용
- email: `z.string().email()`
- price: `z.number().positive()`
- quantity: `z.number().int().positive()`
- pagination: `page >= 1`, `pageSize: 1~100, default 20`

### 상품
- name: 1~200자
- description: 최대 2000자
- price: 0.01 이상
- stock: 0 이상 정수

### 주문
- items: 1개 이상, 최대 50개
- quantity per item: 1~999
