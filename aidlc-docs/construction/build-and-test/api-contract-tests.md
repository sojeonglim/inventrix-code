# API Contract 테스트 케이스

> cross-unit-contracts.md 기반. 구현 완료 후 실행.

---

## Auth API

### POST /api/auth/register
- [ ] 유효한 입력 → 201 + AuthResult (token, user with role='customer')
- [ ] 이메일 중복 → 409 + ErrorResponse
- [ ] 비밀번호 정책 미충족 (8자 미만) → 400 + ErrorResponse
- [ ] 비밀번호 정책 미충족 (특수문자 없음) → 400 + ErrorResponse
- [ ] 필수 필드 누락 (email, password, name) → 400 + ErrorResponse
- [ ] 잘못된 이메일 형식 → 400 + ErrorResponse

### POST /api/auth/login
- [ ] 유효한 자격증명 → 200 + AuthResult
- [ ] 잘못된 비밀번호 → 401 + ErrorResponse
- [ ] 존재하지 않는 이메일 → 401 + ErrorResponse (동일 메시지 — 정보 노출 방지)
- [ ] 5회 연속 실패 후 → 429 + 계정 잠금 메시지
- [ ] 잠금 15분 경과 후 → 정상 로그인 가능

### POST /api/auth/refresh
- [ ] 유효한 refresh token → 200 + AuthResult (새 access + refresh token)
- [ ] 만료된 refresh token → 401
- [ ] 로그아웃된 refresh token → 401

### POST /api/auth/logout
- [ ] 인증된 사용자 → 204
- [ ] 인증 없음 → 401

---

## Products API

### GET /api/products
- [ ] 인증 없이 접근 가능 → 200 + PaginatedResult<Product>
- [ ] availableStock 필드 포함 확인
- [ ] search 파라미터 → 이름/설명 필터링
- [ ] page, pageSize 파라미터 → 페이지네이션

### GET /api/products/:id
- [ ] 존재하는 상품 → 200 + Product
- [ ] 존재하지 않는 ID → 404

### POST /api/products
- [ ] admin → 201 + Product
- [ ] staff → 403
- [ ] customer → 403
- [ ] 인증 없음 → 401
- [ ] 필수 필드 누락 → 400

### PUT /api/products/:id
- [ ] admin → 200 + Product
- [ ] staff → 403
- [ ] 존재하지 않는 ID → 404

### DELETE /api/products/:id
- [ ] admin → 204
- [ ] staff → 403
- [ ] customer → 403

### POST /api/products/generate-image
- [ ] admin → 200 + { imageUrl }
- [ ] staff → 403

---

## Orders API

### GET /api/orders
- [ ] admin → 전체 주문 목록
- [ ] staff → 전체 주문 목록
- [ ] customer → 본인 주문만
- [ ] 인증 없음 → 401
- [ ] status 필터 → 해당 상태만
- [ ] 페이지네이션 동작

### GET /api/orders/:id
- [ ] admin → 모든 주문 접근 가능
- [ ] staff → 모든 주문 접근 가능
- [ ] customer (본인 주문) → 200 + Order (items 포함)
- [ ] customer (타인 주문) → 403 (IDOR 방지)

### POST /api/orders
- [ ] customer → 201 + Order (status='pending')
- [ ] admin → 403
- [ ] staff → 403
- [ ] 재고 충분 → 주문 생성 + 재고 예약
- [ ] 재고 부족 → 409 + 'INSUFFICIENT_STOCK'
- [ ] 존재하지 않는 productId → 404
- [ ] quantity ≤ 0 → 400
- [ ] items 빈 배열 → 400

### PATCH /api/orders/:id/status
- [ ] admin: pending→processing → 200
- [ ] admin: processing→shipped → 200
- [ ] admin: processing→cancelled → 200
- [ ] staff: processing→shipped → 200
- [ ] staff: shipped→delivered → 200
- [ ] staff: pending→processing → 403
- [ ] customer → 403
- [ ] shipped→cancelled → 409
- [ ] delivered→anything → 409
- [ ] cancelled→anything → 409
- [ ] 잘못된 status 값 → 400

### POST /api/orders/:id/cancel
- [ ] customer (본인, pending) → 200 + Order (status='cancelled')
- [ ] customer (본인, processing) → 409 + "관리자에게 문의"
- [ ] customer (타인 주문) → 403
- [ ] admin (pending) → 200
- [ ] admin (processing) → 200
- [ ] staff → 403

---

## Refunds API

### GET /api/refunds
- [ ] admin → 200 + PaginatedResult<Refund>
- [ ] staff → 403
- [ ] customer → 403
- [ ] status 필터 동작

### PATCH /api/refunds/:id
- [ ] admin: pending_refund→refunded → 200 + Refund (processedBy, processedAt 포함)
- [ ] staff → 403
- [ ] 잘못된 status → 400

---

## Inventory API

### GET /api/inventory
- [ ] admin → 200 + PaginatedResult<StockInfo>
- [ ] staff → 200
- [ ] customer → 403
- [ ] lowStock=true → 부족 재고만

### PATCH /api/inventory/:productId
- [ ] admin → 200 + StockInfo
- [ ] staff → 200
- [ ] customer → 403
- [ ] 존재하지 않는 productId → 404

---

## Users API

### GET /api/users
- [ ] admin → 200 + User[]
- [ ] staff → 403
- [ ] customer → 403

### PATCH /api/users/:id/role
- [ ] admin → 200 + User (역할 변경됨)
- [ ] staff → 403
- [ ] 잘못된 role 값 → 400
- [ ] 감사 로그 기록 확인

---

## Analytics API

### GET /api/analytics/dashboard
- [ ] admin → 200 + DashboardKPIs
- [ ] staff → 403
- [ ] customer → 403

### GET /api/analytics/revenue
- [ ] admin → 200 + RevenueStats
- [ ] from/to 파라미터 동작

### GET /api/analytics/orders
- [ ] admin → 200 + OrderStats

### GET /api/analytics/inventory
- [ ] admin → 200 + InventoryStats

---

## Notifications API

### GET /api/notifications
- [ ] 인증된 사용자 → 본인 알림만 반환
- [ ] 인증 없음 → 401

### GET /api/notifications/unread-count
- [ ] 인증된 사용자 → { count: number }

### PATCH /api/notifications/:id/read
- [ ] 본인 알림 → 204
- [ ] 타인 알림 → 403

---

## SSE Endpoint

### GET /api/sse/connect
- [ ] 인증된 사용자 → 200 + text/event-stream
- [ ] 인증 없음 → 401
- [ ] heartbeat 30초 간격 수신
- [ ] 연결 끊김 후 재연결 가능

---

## 공통 검증

### ErrorResponse 형식
- [ ] 모든 에러 응답이 `{ error: { code, message } }` 형식
- [ ] 500 에러 시 내부 정보 노출 없음

### 보안 헤더
- [ ] Content-Security-Policy 헤더 존재
- [ ] X-Frame-Options 헤더 존재
- [ ] Strict-Transport-Security 헤더 존재

### Rate Limiting
- [ ] 제한 초과 시 429 반환
- [ ] Rate limit 헤더 포함 (X-RateLimit-Limit, X-RateLimit-Remaining)
