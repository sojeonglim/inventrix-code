# Services

## 서비스 계층 개요

모듈러 모놀리스에서 각 모듈은 자체 Service 계층을 통해 비즈니스 로직을 캡슐화합니다. 모듈 간 통신은 EventBus를 통한 도메인 이벤트로만 이루어집니다.

```
+-----------------------------------------------------------+
| Express Router (API Layer)                                |
|  - 요청 검증 (Zod)                                        |
|  - 인증/인가 (JWT + RBAC)                                 |
|  - 라우트 핸들러                                           |
+---+-------+-------+-------+-------+-------+--------------+
    |       |       |       |       |       |
    v       v       v       v       v       v
+------+ +------+ +------+ +------+ +------+ +------+
|Catalog| |Orders| |Inven | |Users | |Analy | |Notif |
|Service| |Service| |Service| |Service| |Service| |Service|
+---+--+ +---+--+ +---+--+ +---+--+ +---+--+ +---+--+
    |       |       |       |       |       |
    v       v       v       v       v       v
+------+ +------+ +------+ +------+ +------+ +------+
|Catalog| |Order | |Inven | |User  | |Analy | |Notif |
|Repo  | |Repo  | |Repo  | |Repo  | |Repo  | |Repo  |
+---+--+ +---+--+ +---+--+ +---+--+ +---+--+ +---+--+
    |       |       |       |       |       |
    +-------+-------+-------+-------+-------+
                        |
                   +----v----+
                   | Database |
                   +---------+
```

---

## Orchestration 패턴

### 1. 주문 생성 흐름 (Cross-Module)
```
고객 → OrderService.createOrder()
         |
         +--> ReservationService.createReservation()  (동기 호출)
         |     (재고 예약 — 실패 시 주문 생성 중단)
         |
         +--> OrderRepository.create()                (DB 저장)
         |
         +--> EventBus.emit(OrderCreated)             (비동기 이벤트)
               |
               +--> NotificationService (인앱 + 이메일)
               +--> AnalyticsService (KPI 업데이트)
```

### 2. 주문 취소 흐름 (Cross-Module)
```
사용자 → OrderService.cancelOrder()
          |
          +--> State Machine 검증 (취소 가능 상태인지)
          |
          +--> ReservationService.releaseReservation() (동기 — 재고 복원)
          |
          +--> OrderRepository.updateStatus(cancelled) (DB 업데이트)
          |
          +--> OrderRepository.createRefund()          (환불 레코드)
          |
          +--> EventBus.emit(OrderCancelled)           (비동기 이벤트)
                |
                +--> NotificationService (인앱 + 이메일)
                +--> AnalyticsService (KPI 업데이트)
```

### 3. 재고 예약 타임아웃 흐름
```
Scheduler (setInterval) → ReservationService.expireReservations()
                           |
                           +--> 만료된 예약 조회
                           +--> 각 예약에 대해:
                           |     +--> InventoryRepository.updateQuantity() (재고 복원)
                           |     +--> InventoryRepository.deleteReservation()
                           |
                           +--> EventBus.emit(ReservationExpired)
```

### 4. 실시간 알림 흐름
```
EventBus 이벤트 수신 → NotificationService
                        |
                        +--> NotificationRepository.create()  (DB 저장)
                        |
                        +--> SSEManager.sendToUser()          (실시간 push)
                        |
                        +--> EmailService.send()              (이메일 — 해당 시)
```

---

## 동기 vs 비동기 통신 규칙

| 통신 유형 | 사용 시점 | 예시 |
|---|---|---|
| **동기 (직접 호출)** | 트랜잭션 원자성이 필요한 경우 | 주문 생성 → 재고 예약 |
| **비동기 (EventBus)** | 부가 효과, 실패해도 주 흐름에 영향 없는 경우 | 알림 발송, KPI 업데이트 |

**규칙**: Orders → Inventory 간 재고 예약/해제는 동기 호출 (트랜잭션 보장). 그 외 모든 cross-module 통신은 EventBus 비동기 이벤트.
