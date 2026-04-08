# Backend Functional Design — Business Logic Model

---

## 1. 주문 생성 흐름 (OrderService.createOrder)

```
입력: userId, items[{productId, quantity}]

1. 입력 검증 (Zod: items 1~50개, quantity 1~999)
2. DB 트랜잭션 시작
   2a. 각 item에 대해:
       - Product 조회 (SELECT FOR UPDATE)
       - availableStock 계산 (stock - active reservations)
       - availableStock < quantity → 롤백, 400 INSUFFICIENT_STOCK
       - subtotal 누적 (price * quantity)
   2b. GST 계산: subtotal * 0.1
   2c. total 계산: subtotal + GST
   2d. Order 레코드 생성 (status: pending)
   2e. OrderItem 레코드 생성 (각 item)
   2f. Reservation 레코드 생성 (status: active, expiresAt: now + 15분)
   2g. ReservationItem 레코드 생성 (각 item)
3. 트랜잭션 커밋
4. EventBus.emit(OrderCreated)
5. 반환: Order (items 포함)
```

---

## 2. 주문 상태 변경 흐름 (OrderService.updateOrderStatus)

```
입력: orderId, newStatus, 요청자(role, userId)

1. Order 조회 (없으면 404)
2. State Machine 검증:
   - 현재 상태 → newStatus 전이가 유효한지
   - 요청자 역할이 해당 전이를 수행할 수 있는지
3. 상태별 부가 효과:
   - pending → processing: ReservationService.confirmReservation(orderId)
   - pending → cancelled: ReservationService.releaseReservation(orderId) + Refund 자동 생성
   - processing → cancelled: 재고 복원 (confirmed reservation의 수량만큼 stock 증가) + Refund 자동 생성
4. Order status 업데이트
5. AuditLog 기록
6. EventBus.emit(OrderStatusChanged 또는 OrderCancelled)
7. 반환: 업데이트된 Order
```

---

## 3. 재고 예약 확정 (ReservationService.confirmReservation)

```
입력: orderId

1. Reservation 조회 (orderId, status: active)
   - 없으면 에러 (이미 확정/만료/해제됨)
2. DB 트랜잭션:
   2a. 각 ReservationItem에 대해:
       - Product.stock -= quantity (실제 차감)
   2b. Reservation.status = confirmed
3. 트랜잭션 커밋
```

---

## 4. 재고 예약 해제 (ReservationService.releaseReservation)

```
입력: orderId

1. Reservation 조회 (orderId, status: active 또는 confirmed)
2. DB 트랜잭션:
   2a. status가 confirmed인 경우:
       - 각 ReservationItem에 대해 Product.stock += quantity (복원)
   2b. Reservation.status = released
3. 트랜잭션 커밋
4. 각 product에 대해 stock 임계값 확인 → StockLow/StockDepleted 이벤트
```

---

## 5. 예약 타임아웃 (ReservationService.expireReservations)

```
스케줄러 (60초 간격):

1. 만료된 예약 조회: status = active AND expiresAt < now()
2. 각 만료 예약에 대해:
   2a. Reservation.status = expired
   2b. 연결된 Order.status = cancelled
   2c. Refund 자동 생성 (amount = order.total)
   2d. EventBus.emit(ReservationExpired)
3. 처리된 건수 반환
```

---

## 6. 인증 흐름

### 로그인 (AuthService.login)
```
1. email로 User 조회 (없으면 401 INVALID_CREDENTIALS)
2. lockedUntil 확인 (잠금 중이면 401 ACCOUNT_LOCKED)
3. bcrypt.compare(password, user.password)
   - 실패:
     a. loginAttempts += 1
     b. loginAttempts >= 5 → lockedUntil = now + 15분, EventBus.emit(LoginFailed)
     c. 401 INVALID_CREDENTIALS
   - 성공:
     a. loginAttempts = 0, lockedUntil = null
     b. Access Token 생성 (15분)
     c. Refresh Token 생성 (7일), DB 저장
     d. AuditLog 기록
     e. 반환: { token, user }
```

### 토큰 갱신 (AuthService.refreshToken)
```
1. refresh token으로 RefreshToken 조회
2. 만료 확인 (만료 시 401)
3. 기존 RefreshToken 삭제 (rotation)
4. 새 Access Token + Refresh Token 발급
5. 반환: { token, user }
```

---

## 7. 알림 흐름 (NotificationService)

### EventBus 구독 → 알림 생성
```
이벤트 수신 시:
1. 알림 대상 사용자 결정 (이벤트 타입별 라우팅 규칙)
2. Notification 레코드 생성 (DB)
3. SSEManager.sendToUser(userId, event) — 실시간 push
4. 이메일 발송 대상 이벤트인 경우 → EmailService.send()
```

### SSE 연결 관리 (SSEManager)
```
연결: GET /api/sse/connect (JWT 인증)
1. JWT에서 userId, role 추출
2. Response 헤더 설정 (text/event-stream)
3. connections Map에 {userId → response} 저장
4. 30초 간격 heartbeat (: heartbeat\n\n)
5. 연결 종료 시 Map에서 제거
```
