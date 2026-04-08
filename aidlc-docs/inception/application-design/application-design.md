# Application Design — 통합 문서

## 1. 아키텍처 개요

Inventrix를 Fat Routes 패턴에서 모듈러 모놀리스로 전환합니다. 6개 비즈니스 모듈이 각각 Service/Repository 계층을 가지며, 모듈 간 통신은 In-memory EventBus(비동기)와 Service 인터페이스(동기)를 통해 이루어집니다.

### 설계 결정 요약
| 결정 항목 | 선택 | 근거 |
|---|---|---|
| 이벤트 버스 | In-memory EventEmitter | 500명 규모, 단일 프로세스, 향후 Redis 전환 가능 |
| 알림 저장소 | 메인 DB notifications 테이블 | 영속성 보장, 현재 규모에 충분 |
| SSE 관리 | 사용자별 개별 연결 | 정확한 이벤트 라우팅, 보안 (IDOR 방지) |

## 2. Backend 모듈 구조

```
packages/api/src/
+-- modules/
|   +-- catalog/
|   |   +-- catalog.service.ts
|   |   +-- catalog.repository.ts
|   |   +-- catalog.routes.ts
|   |   +-- catalog.types.ts
|   |   +-- catalog.validation.ts
|   +-- orders/
|   |   +-- order.service.ts
|   |   +-- order.repository.ts
|   |   +-- order.routes.ts
|   |   +-- order.types.ts
|   |   +-- order.validation.ts
|   |   +-- order-state-machine.ts
|   +-- inventory/
|   |   +-- inventory.service.ts
|   |   +-- inventory.repository.ts
|   |   +-- reservation.service.ts
|   |   +-- inventory.routes.ts
|   |   +-- inventory.types.ts
|   |   +-- inventory.validation.ts
|   +-- users/
|   |   +-- auth.service.ts
|   |   +-- user.service.ts
|   |   +-- user.repository.ts
|   |   +-- user.routes.ts
|   |   +-- user.types.ts
|   |   +-- user.validation.ts
|   +-- analytics/
|   |   +-- analytics.service.ts
|   |   +-- analytics.repository.ts
|   |   +-- analytics.routes.ts
|   |   +-- analytics.types.ts
|   +-- notifications/
|       +-- notification.service.ts
|       +-- notification.repository.ts
|       +-- sse-manager.ts
|       +-- email.service.ts
|       +-- notification.routes.ts
|       +-- notification.types.ts
+-- shared/
|   +-- event-bus/
|   |   +-- event-bus.ts
|   |   +-- events.ts          (도메인 이벤트 타입 정의)
|   +-- middleware/
|   |   +-- authenticate.ts
|   |   +-- authorize.ts
|   |   +-- rate-limiter.ts
|   |   +-- security-headers.ts
|   |   +-- error-handler.ts
|   |   +-- request-logger.ts
|   +-- database/
|   |   +-- connection.ts
|   |   +-- migrations/
|   +-- validation/
|   |   +-- validate.ts
|   +-- logger/
|   |   +-- logger.ts
|   |   +-- audit-logger.ts
|   +-- types/
|       +-- common.ts          (공통 타입: Role, PaginatedResult 등)
+-- index.ts                   (Express 앱 초기화, 모듈 등록)
```

## 3. Frontend 구조

```
packages/frontend/src/
+-- components/
|   +-- common/
|   |   +-- Layout.tsx
|   |   +-- Navigation.tsx
|   |   +-- Skeleton.tsx
|   |   +-- ErrorBoundary.tsx
|   |   +-- Toast.tsx
|   +-- notifications/
|       +-- NotificationBell.tsx
|       +-- NotificationList.tsx
+-- pages/
|   +-- Login.tsx
|   +-- Register.tsx
|   +-- Storefront.tsx
|   +-- ProductDetail.tsx
|   +-- Orders.tsx              (고객 본인 주문)
|   +-- admin/
|   |   +-- Dashboard.tsx
|   |   +-- Products.tsx
|   |   +-- Orders.tsx
|   |   +-- Inventory.tsx
|   |   +-- UserRoles.tsx
|   +-- staff/
|       +-- Orders.tsx
|       +-- Inventory.tsx
+-- contexts/
|   +-- AuthContext.tsx
|   +-- NotificationContext.tsx
|   +-- ThemeContext.tsx
+-- hooks/
|   +-- useSSE.ts
|   +-- useNotifications.ts
+-- api/
|   +-- client.ts              (axios/fetch wrapper)
+-- styles/
|   +-- theme.ts
+-- App.tsx
+-- main.tsx
```

## 4. 핵심 통신 패턴

### 동기 의존성 (트랜잭션 원자성 필요)
- Orders → Inventory: 재고 예약/해제/확정

### 비동기 의존성 (EventBus)
- Orders → Notifications, Analytics
- Inventory → Notifications, Analytics
- Users → Notifications

### 모듈 독립성 규칙
1. 각 모듈은 자체 Repository만 사용 (타 모듈 테이블 직접 접근 금지)
2. 동기 의존은 Service 인터페이스 통해서만 허용
3. 비동기 통신은 EventBus만 사용
4. 순환 의존성 금지

## 5. RBAC 적용

| 역할 | 접근 가능 모듈/기능 |
|---|---|
| 관리자 | 전체 (역할 관리, 상품 CRUD, 주문 관리, 재고, 분석, 보안 모니터링) |
| 직원 | 주문 조회, 배송 상태 변경, 재고 조회/수정 |
| 고객 | 상품 조회, 주문 생성, 본인 주문 조회/취소 |

## 6. 상세 설계 문서 참조

- 컴포넌트 정의: `components.md`
- Method Signatures: `component-methods.md`
- 서비스 계층 및 Orchestration: `services.md`
- 의존성 및 통신 패턴: `component-dependency.md`
