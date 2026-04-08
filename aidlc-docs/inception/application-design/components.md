# Components

## Backend 모듈 (packages/api)

### 1. Catalog Module (`modules/catalog/`)
- **목적**: 상품 관리
- **책임**:
  - 상품 CRUD (생성, 조회, 수정, 삭제)
  - AI 이미지 생성 (AWS Bedrock Nova Canvas)
  - 상품 검색 및 필터링
- **인터페이스**: CatalogService, CatalogRepository
- **접근 권한**: 조회(모든 역할), 생성/수정/삭제(관리자), AI 이미지(관리자)

### 2. Orders Module (`modules/orders/`)
- **목적**: 주문 생명주기 관리
- **책임**:
  - 주문 생성 (재고 예약 연동)
  - 주문 상태 전이 (state machine 패턴)
  - 주문 취소 및 환불 상태 추적
  - 주문 조회 (역할별 필터링)
- **인터페이스**: OrderService, OrderRepository
- **접근 권한**: 생성(고객), 상태 변경(관리자/직원 — 역할별 허용 전이 다름), 본인 주문 조회(고객), 전체 조회(관리자/직원)
- **이벤트 발행**: OrderCreated, OrderStatusChanged, OrderCancelled

### 3. Inventory Module (`modules/inventory/`)
- **목적**: 재고 관리 및 예약 시스템
- **책임**:
  - 재고 수준 관리 (조회, 수정)
  - 재고 예약 (reservation) 생성/확정/해제
  - 예약 타임아웃 자동 해제 (기본 15분)
  - 동시성 제어 (경쟁 조건 방지)
  - 주문 취소 시 재고 복원
- **인터페이스**: InventoryService, InventoryRepository, ReservationService
- **접근 권한**: 조회(관리자/직원), 수정(관리자/직원)
- **이벤트 구독**: OrderCreated, OrderCancelled
- **이벤트 발행**: StockLow, StockDepleted, ReservationExpired

### 4. Users Module (`modules/users/`)
- **목적**: 사용자 인증/인가 및 역할 관리
- **책임**:
  - 회원가입, 로그인, 토큰 관리
  - RBAC (3개 역할: 관리자, 직원, 고객)
  - 역할 할당/변경 (관리자 전용)
  - 비밀번호 정책 적용
  - 감사 로그 기록
- **인터페이스**: AuthService, UserService, UserRepository
- **접근 권한**: 역할 관리(관리자), 본인 정보(모든 인증 사용자)
- **이벤트 발행**: RoleChanged, LoginFailed (보안 이벤트)

### 5. Analytics Module (`modules/analytics/`)
- **목적**: 비즈니스 분석 대시보드
- **책임**:
  - 매출/주문/재고 KPI 집계
  - SSE 기반 실시간 대시보드 업데이트
  - 데이터 트렌드 조회
- **인터페이스**: AnalyticsService, AnalyticsRepository
- **접근 권한**: 대시보드 조회(관리자)
- **이벤트 구독**: OrderCreated, OrderStatusChanged, StockLow

### 6. Notifications Module (`modules/notifications/`)
- **목적**: 알림 시스템 (인앱 + 이메일)
- **책임**:
  - 인앱 알림 생성/조회/읽음 처리
  - SSE 연결 관리 (사용자별 개별 연결)
  - 이메일 알림 발송 (외부 서비스 연동)
  - 알림 대상 라우팅 (역할/사용자별)
- **인터페이스**: NotificationService, NotificationRepository, SSEManager, EmailService
- **접근 권한**: 본인 알림 조회/읽음(모든 인증 사용자)
- **이벤트 구독**: OrderCreated, OrderStatusChanged, OrderCancelled, StockLow, StockDepleted, RoleChanged, LoginFailed

---

## Shared Infrastructure (packages/api)

### EventBus (`shared/event-bus/`)
- **목적**: 모듈 간 느슨한 결합 통신
- **구현**: In-memory TypedEventEmitter
- **책임**: 타입 안전 이벤트 발행/구독, 에러 격리

### RBAC Middleware (`shared/middleware/`)
- **목적**: 인증/인가 미들웨어
- **책임**: JWT 검증, 역할 기반 접근 제어, rate limiting, 보안 헤더

### Database (`shared/database/`)
- **목적**: DB 연결 관리
- **책임**: 커넥션 풀링, 마이그레이션, 트랜잭션 관리

### Validation (`shared/validation/`)
- **목적**: 입력 검증
- **책임**: Zod 스키마 기반 요청 검증

### Logger (`shared/logger/`)
- **목적**: 구조화 로깅 및 감사 로그
- **책임**: 요청 로깅, 감사 이벤트 기록, 에러 로깅

---

## Frontend 컴포넌트 (packages/frontend)

### 페이지 구조
- **공통**: Layout, Navigation (역할별 메뉴), ThemeProvider (다크 모드)
- **고객**: Storefront, ProductDetail, Orders (본인), Cart
- **관리자**: Dashboard (실시간), Products CRUD, Orders 관리, Inventory, UserRoles, Analytics
- **직원**: Orders 조회, Inventory 관리 (재고 수정, 배송 상태)

### 공통 인프라
- **AuthContext**: 인증 상태 + 역할 정보
- **NotificationContext**: 인앱 알림 상태 + SSE 연결
- **ThemeContext**: 다크 모드 상태
- **API Client**: 인증 토큰 자동 첨부, 에러 핸들링
- **Error Boundary**: 전역 에러 처리
- **Skeleton Components**: 로딩 상태 UI
