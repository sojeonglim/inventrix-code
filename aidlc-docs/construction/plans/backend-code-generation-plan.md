# Backend Code Generation Plan

## Unit Context
- **Package**: `packages/api`
- **Type**: Brownfield (기존 코드 리팩토링 + 신규 코드)
- **Tech Stack**: Express + TypeScript + Prisma + PostgreSQL + Zod + Pino

## Story Coverage
US-1.1, US-2.1, US-2.2, US-3.1, US-3.2, US-3.3, US-4.1, US-4.2, US-4.3, US-5.1, US-5.2, US-5.3(API), US-6.1(SSE), US-6.2(API), US-6.3

---

## Execution Steps

### Step 1: Project Setup & Dependencies
- [ ] `packages/api/package.json` 업데이트 (신규 deps 추가, better-sqlite3 제거)
- [ ] `packages/api/tsconfig.json` strict mode 활성화
- [ ] `packages/api/.env.example` 생성 (환경 변수 템플릿)
- [ ] ESLint + Prettier 설정 파일 생성
- **Stories**: US-1.1, US-2.1

### Step 2: Prisma Schema & Database
- [ ] `packages/api/prisma/schema.prisma` 생성 (domain-entities.md 기반)
- [ ] 시드 스크립트 `packages/api/prisma/seed.ts` 생성
- **Stories**: US-1.1

### Step 3: Shared Infrastructure
- [ ] `packages/api/src/shared/database/connection.ts` — Prisma 클라이언트 싱글톤
- [ ] `packages/api/src/shared/event-bus/event-bus.ts` — TypedEventEmitter
- [ ] `packages/api/src/shared/event-bus/events.ts` — 도메인 이벤트 타입
- [ ] `packages/api/src/shared/logger/logger.ts` — Pino 설정
- [ ] `packages/api/src/shared/logger/audit-logger.ts` — 감사 로그 서비스
- [ ] `packages/api/src/shared/types/common.ts` — 공통 타입 (Role, PaginatedResult, ErrorResponse)
- **Stories**: US-2.1, US-2.2

### Step 4: Shared Middleware
- [ ] `packages/api/src/shared/middleware/authenticate.ts` — JWT 검증
- [ ] `packages/api/src/shared/middleware/authorize.ts` — RBAC + ownerOrRole
- [ ] `packages/api/src/shared/middleware/validate.ts` — Zod 검증 미들웨어
- [ ] `packages/api/src/shared/middleware/rate-limiter.ts` — Rate limiting
- [ ] `packages/api/src/shared/middleware/security-headers.ts` — Helmet 설정
- [ ] `packages/api/src/shared/middleware/request-logger.ts` — Pino HTTP
- [ ] `packages/api/src/shared/middleware/error-handler.ts` — 글로벌 에러 핸들러
- **Stories**: US-5.1, US-5.2

### Step 5: Users Module (인증/인가)
- [ ] `packages/api/src/modules/users/user.types.ts`
- [ ] `packages/api/src/modules/users/user.validation.ts` — Zod 스키마
- [ ] `packages/api/src/modules/users/user.repository.ts`
- [ ] `packages/api/src/modules/users/user.service.ts`
- [ ] `packages/api/src/modules/users/auth.service.ts` — 로그인, 토큰, 브루트포스
- [ ] `packages/api/src/modules/users/user.routes.ts`
- **Stories**: US-5.1, US-5.2, US-5.3(API)

### Step 6: Catalog Module (상품)
- [ ] `packages/api/src/modules/catalog/catalog.types.ts`
- [ ] `packages/api/src/modules/catalog/catalog.validation.ts`
- [ ] `packages/api/src/modules/catalog/catalog.repository.ts`
- [ ] `packages/api/src/modules/catalog/catalog.service.ts`
- [ ] `packages/api/src/modules/catalog/catalog.routes.ts`
- **Stories**: US-2.1

### Step 7: Inventory Module (재고 + 예약)
- [ ] `packages/api/src/modules/inventory/inventory.types.ts`
- [ ] `packages/api/src/modules/inventory/inventory.validation.ts`
- [ ] `packages/api/src/modules/inventory/inventory.repository.ts`
- [ ] `packages/api/src/modules/inventory/inventory.service.ts`
- [ ] `packages/api/src/modules/inventory/reservation.service.ts` — 예약/확정/해제/타임아웃
- [ ] `packages/api/src/modules/inventory/inventory.routes.ts`
- **Stories**: US-4.1, US-4.2, US-4.3

### Step 8: Orders Module (주문 + 환불)
- [ ] `packages/api/src/modules/orders/order.types.ts`
- [ ] `packages/api/src/modules/orders/order.validation.ts`
- [ ] `packages/api/src/modules/orders/order.repository.ts`
- [ ] `packages/api/src/modules/orders/order-state-machine.ts` — 상태 전이 규칙
- [ ] `packages/api/src/modules/orders/order.service.ts` — 주문 생성/취소/상태 변경
- [ ] `packages/api/src/modules/orders/order.routes.ts`
- **Stories**: US-3.1, US-3.2, US-3.3

### Step 9: Analytics Module
- [ ] `packages/api/src/modules/analytics/analytics.types.ts`
- [ ] `packages/api/src/modules/analytics/analytics.repository.ts`
- [ ] `packages/api/src/modules/analytics/analytics.service.ts`
- [ ] `packages/api/src/modules/analytics/analytics.routes.ts`
- **Stories**: US-2.1

### Step 10: Notifications Module (인앱 + SSE + 이메일)
- [ ] `packages/api/src/modules/notifications/notification.types.ts`
- [ ] `packages/api/src/modules/notifications/notification.repository.ts`
- [ ] `packages/api/src/modules/notifications/notification.service.ts`
- [ ] `packages/api/src/modules/notifications/sse-manager.ts`
- [ ] `packages/api/src/modules/notifications/email.service.ts` — AWS SES
- [ ] `packages/api/src/modules/notifications/notification.routes.ts`
- **Stories**: US-6.1, US-6.2, US-6.3

### Step 11: App Entry Point
- [ ] `packages/api/src/index.ts` 리팩토링 — 모듈 등록, DI 조립, graceful shutdown
- **Stories**: US-2.1

### Step 12: Unit Tests
- [ ] `packages/api/src/modules/orders/__tests__/order-state-machine.test.ts`
- [ ] `packages/api/src/modules/orders/__tests__/order.service.test.ts`
- [ ] `packages/api/src/modules/inventory/__tests__/reservation.service.test.ts`
- [ ] `packages/api/src/modules/users/__tests__/auth.service.test.ts`
- [ ] `packages/api/vitest.config.ts`
- **Stories**: 전체 (품질 보증)

### Step 13: Legacy Cleanup
- [ ] `packages/api/src/db.ts` 삭제 (Prisma로 대체)
- [ ] `packages/api/src/routes/` 디렉토리 삭제 (모듈 구조로 대체)
- [ ] `packages/api/src/middleware/auth.ts` 삭제 (shared/middleware로 대체)
- [ ] `packages/api/src/services/imageGenerator.ts` → `modules/catalog/` 내부로 이동

---

## Total: 13 Steps, ~50 files (생성/수정/삭제)
