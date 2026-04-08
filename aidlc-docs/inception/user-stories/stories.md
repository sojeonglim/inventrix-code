# User Stories

## 개요
- **분류 방식**: Epic-Based (FR-01~FR-07 기반)
- **Acceptance Criteria**: 상세 (Given/When/Then + 엣지 케이스 + 에러 시나리오)
- **총 Epic**: 7개
- **페르소나 참조**: `personas.md` (고객, 관리자, 직원)

---

## Epic 1: 데이터베이스 마이그레이션 (FR-01)

### US-1.1: 프로덕션급 데이터베이스 마이그레이션
**As a** 관리자,
**I want** 시스템이 프로덕션급 데이터베이스를 사용하도록,
**So that** 동시 사용자 접속 시에도 데이터 무결성과 성능이 보장된다.

**Acceptance Criteria:**
1. Given 기존 SQLite 데이터가 존재할 때, When 마이그레이션을 실행하면, Then 모든 데이터(users, products, orders, order_items)가 새 DB로 이전된다
2. Given 다수 사용자가 동시에 주문을 생성할 때, When 동시 쓰기가 발생하면, Then 모든 트랜잭션이 정상 처리되고 데이터 손실이 없다
3. Given DB 연결이 설정될 때, When 커넥션 풀링이 적용되면, Then 최대 동시 연결 수가 설정값을 초과하지 않는다
4. Given DB 연결 시, When TLS가 적용되면, Then 모든 데이터 전송이 암호화된다 (SECURITY-01)
5. Given DB 서버가 일시적으로 불가할 때, When 연결 실패가 발생하면, Then 재시도 로직이 동작하고 사용자에게 적절한 에러 메시지가 표시된다 (SECURITY-15)

**페르소나**: 관리자 (시스템 관리), 모든 사용자 (간접 영향)

---

## Epic 2: 모듈러 모놀리스 리팩토링 (FR-02)

### US-2.1: 모듈 기반 아키텍처 전환
**As a** Backend 담당자,
**I want** 비즈니스 로직이 모듈별로 분리되도록,
**So that** 코드 유지보수성이 향상되고 모듈 간 의존성이 명확해진다.

**Acceptance Criteria:**
1. Given 기존 Fat Routes가 존재할 때, When 리팩토링이 완료되면, Then 각 모듈(orders, inventory, catalog, users, analytics)에 Service/Repository 계층이 분리된다
2. Given 모듈 A가 모듈 B의 데이터가 필요할 때, When 데이터를 요청하면, Then 직접 DB 접근이 아닌 서비스 인터페이스를 통해 통신한다
3. Given 주문이 생성될 때, When 재고 차감이 필요하면, Then 도메인 이벤트를 통해 inventory 모듈에 전달된다
4. Given 리팩토링 후, When 기존 API 엔드포인트를 호출하면, Then 모든 기존 기능이 동일하게 동작한다 (회귀 없음)

**페르소나**: Backend 담당자 (직접), 모든 사용자 (간접 — 기능 동일)

### US-2.2: 내부 이벤트 버스
**As a** Backend 담당자,
**I want** 모듈 간 통신이 타입 지정 도메인 이벤트로 이루어지도록,
**So that** 모듈 간 결합도가 낮아지고 확장이 용이해진다.

**Acceptance Criteria:**
1. Given 이벤트 버스가 구현될 때, When 이벤트를 발행하면, Then 구독한 모듈만 해당 이벤트를 수신한다
2. Given 이벤트 타입이 정의될 때, When 잘못된 타입의 이벤트를 발행하면, Then TypeScript 컴파일 에러가 발생한다
3. Given 이벤트 핸들러에서 에러가 발생할 때, When 처리 실패하면, Then 에러가 로깅되고 다른 핸들러에 영향을 주지 않는다 (SECURITY-15)

**페르소나**: Backend 담당자

---

## Epic 3: 주문 관리 개선 (FR-03)

### US-3.1: 주문 상태 전이 규칙
**As a** 관리자,
**I want** 주문 상태가 정의된 규칙에 따라서만 변경되도록,
**So that** 잘못된 상태 변경으로 인한 비즈니스 오류가 방지된다.

**Acceptance Criteria:**
1. Given 주문이 pending 상태일 때, When processing 또는 cancelled로 변경하면, Then 상태가 정상 변경된다
2. Given 주문이 shipped 상태일 때, When cancelled로 변경하려 하면, Then 요청이 거부되고 "배송 중인 주문은 취소할 수 없습니다" 에러가 반환된다
3. Given 주문이 delivered 상태일 때, When 어떤 상태로든 변경하려 하면, Then 요청이 거부된다
4. Given 주문이 cancelled 상태일 때, When 어떤 상태로든 변경하려 하면, Then 요청이 거부된다
5. Given 유효하지 않은 상태값이 전달될 때, When 상태 변경을 요청하면, Then 입력 검증 에러가 반환된다 (SECURITY-05)

**페르소나**: 관리자, 직원

### US-3.2: 주문 취소 및 재고 복원
**As a** 고객,
**I want** pending 상태의 주문을 취소하면 재고가 자동으로 복원되도록,
**So that** 취소한 상품이 다른 고객에게 판매될 수 있다.

**Acceptance Criteria:**
1. Given 고객이 pending 주문을 취소할 때, When 취소가 처리되면, Then 주문 상태가 cancelled로 변경되고 해당 상품의 재고가 주문 수량만큼 복원된다
2. Given 관리자가 processing 주문을 취소할 때, When 취소가 처리되면, Then 재고가 복원되고 환불 상태가 기록된다
3. Given 고객이 processing 이상 주문을 취소하려 할 때, When 취소를 요청하면, Then 요청이 거부되고 "관리자에게 문의하세요" 메시지가 표시된다
4. Given 재고 복원 중 에러가 발생할 때, When 트랜잭션이 실패하면, Then 주문 취소와 재고 복원이 모두 롤백된다 (원자성 보장)

**페르소나**: 고객, 관리자

### US-3.3: 환불 상태 추적
**As a** 관리자,
**I want** 취소된 주문의 환불 상태를 추적할 수 있도록,
**So that** 환불 처리 현황을 관리할 수 있다.

**Acceptance Criteria:**
1. Given 주문이 취소될 때, When 환불 레코드가 생성되면, Then 환불 상태(pending_refund, refunded)가 기록된다
2. Given 관리자가 환불 목록을 조회할 때, When 필터를 적용하면, Then 상태별로 환불 내역을 확인할 수 있다
3. Given 환불 상태를 변경할 때, When 관리자가 refunded로 변경하면, Then 변경 시각과 처리자가 기록된다

**페르소나**: 관리자

---

## Epic 4: 재고 예약 시스템 (FR-04)

### US-4.1: 주문 시 재고 예약
**As a** 고객,
**I want** 주문 생성 시 재고가 예약되도록,
**So that** 다른 고객과 동시에 주문해도 재고 부족 문제가 발생하지 않는다.

**Acceptance Criteria:**
1. Given 상품 재고가 10개이고 고객이 3개를 주문할 때, When 주문이 생성되면, Then 3개가 예약되고 가용 재고는 7개로 표시된다
2. Given 두 고객이 동시에 마지막 1개를 주문할 때, When 동시 요청이 발생하면, Then 한 명만 성공하고 다른 한 명은 "재고 부족" 에러를 받는다 (경쟁 조건 방지)
3. Given 예약이 생성될 때, When 예약 정보를 조회하면, Then 예약 시각, 만료 시각, 상품, 수량이 확인된다
4. Given 주문 생성 중 에러가 발생할 때, When 트랜잭션이 실패하면, Then 예약이 롤백되고 재고가 원래대로 복원된다 (SECURITY-15)

**페르소나**: 고객

### US-4.2: 예약 타임아웃 자동 해제
**As a** 시스템,
**I want** 설정된 시간(기본 15분) 내에 확정되지 않은 예약이 자동 해제되도록,
**So that** 미완료 주문으로 인한 재고 잠김이 방지된다.

**Acceptance Criteria:**
1. Given 예약이 15분 경과했을 때, When 타임아웃 체크가 실행되면, Then 해당 예약이 해제되고 재고가 복원된다
2. Given 타임아웃 직전에 주문이 확정될 때, When 확정 요청이 처리되면, Then 예약이 정상 확정되고 타임아웃이 취소된다
3. Given 다수의 예약이 동시에 만료될 때, When 일괄 해제가 실행되면, Then 모든 만료 예약이 정상 해제되고 각각의 재고가 복원된다

**페르소나**: 시스템 (자동), 고객 (간접)

### US-4.3: 주문 확정 시 재고 차감
**As a** 시스템,
**I want** 주문이 확정되면 예약된 재고가 원자적으로 차감되도록,
**So that** 재고 정확성이 보장된다.

**Acceptance Criteria:**
1. Given 3개가 예약된 상태에서, When 주문이 확정되면, Then 실제 재고에서 3개가 차감되고 예약이 제거된다
2. Given 확정 처리 중 DB 에러가 발생할 때, When 트랜잭션이 실패하면, Then 예약 상태가 유지되고 재시도가 가능하다
3. Given 예약이 이미 만료된 상태에서, When 확정을 시도하면, Then "예약이 만료되었습니다" 에러가 반환된다

**페르소나**: 시스템 (자동)

---

## Epic 5: RBAC (FR-05)

### US-5.1: 역할 기반 접근 제어
**As a** 관리자,
**I want** 사용자에게 역할을 할당하고 역할별로 접근 권한이 제어되도록,
**So that** 최소 권한 원칙에 따라 시스템 보안이 강화된다.

**Acceptance Criteria:**
1. Given 관리자가 사용자 목록을 조회할 때, When 역할 관리 페이지에 접근하면, Then 모든 사용자와 현재 역할이 표시된다
2. Given 관리자가 역할을 변경할 때, When 고객을 직원으로 변경하면, Then 즉시 해당 사용자의 권한이 업데이트된다
3. Given 직원이 역할 관리 페이지에 접근하려 할 때, When 요청하면, Then 403 Forbidden이 반환된다 (SECURITY-08)
4. Given 역할이 변경될 때, When 변경이 완료되면, Then 변경 이력(누가, 언제, 어떤 역할에서 어떤 역할로)이 감사 로그에 기록된다 (SECURITY-03)
5. Given 유효하지 않은 역할값이 전달될 때, When 역할 변경을 요청하면, Then 입력 검증 에러가 반환된다 (SECURITY-05)

**페르소나**: 관리자

### US-5.2: 역할별 API 접근 제어
**As a** 시스템,
**I want** 모든 API 엔드포인트가 역할 기반으로 접근 제어되도록,
**So that** 권한 없는 사용자가 데이터에 접근하거나 변경할 수 없다.

**Acceptance Criteria:**
1. Given 직원이 상품 삭제 API를 호출할 때, When 요청이 처리되면, Then 403 Forbidden이 반환된다
2. Given 직원이 주문을 pending→processing으로 변경하려 할 때, When 요청하면, Then 403 Forbidden이 반환된다
3. Given 관리자가 분석 대시보드 API를 호출할 때, When 요청이 처리되면, Then 정상 데이터가 반환된다
4. Given 고객이 다른 고객의 주문을 조회하려 할 때, When 요청하면, Then 403 Forbidden이 반환된다 (IDOR 방지, SECURITY-08)
5. Given 인증 토큰이 만료되었을 때, When API를 호출하면, Then 401 Unauthorized가 반환된다

**페르소나**: 모든 역할

### US-5.3: 역할 관리 UI
**As a** 관리자,
**I want** 웹 UI에서 사용자 역할을 관리할 수 있도록,
**So that** CLI나 DB 직접 접근 없이 역할을 관리할 수 있다.

**Acceptance Criteria:**
1. Given 관리자가 로그인했을 때, When 역할 관리 메뉴에 접근하면, Then 사용자 목록과 역할 변경 UI가 표시된다
2. Given 역할 변경 드롭다운에서, When 역할을 선택하고 저장하면, Then 변경이 즉시 반영되고 성공 토스트가 표시된다
3. Given 관리자가 아닌 사용자가 로그인했을 때, When 네비게이션을 확인하면, Then 역할 관리 메뉴가 표시되지 않는다

**페르소나**: 관리자

---

## Epic 6: 실시간 기능 (FR-06)

### US-6.1: SSE 기반 실시간 대시보드
**As a** 관리자,
**I want** 대시보드가 실시간으로 업데이트되도록,
**So that** 페이지 새로고침 없이 최신 비즈니스 데이터를 확인할 수 있다.

**Acceptance Criteria:**
1. Given 관리자가 대시보드를 열고 있을 때, When 새 주문이 생성되면, Then 대시보드 KPI가 자동으로 업데이트된다
2. Given SSE 연결이 끊어졌을 때, When 네트워크가 복구되면, Then 자동으로 재연결되고 최신 데이터가 반영된다
3. Given 관리자가 아닌 사용자가 SSE 엔드포인트에 접근할 때, When 요청하면, Then 403 Forbidden이 반환된다

**페르소나**: 관리자

### US-6.2: 인앱 알림 시스템
**As a** 관리자,
**I want** 중요 이벤트 발생 시 인앱 알림을 받도록,
**So that** 즉시 대응할 수 있다.

**Acceptance Criteria:**
1. Given 재고 부족 이벤트가 발생할 때, When 알림이 생성되면, Then 토스트 알림이 표시되고 알림 벨 카운트가 증가한다
2. Given 사용자가 알림 벨을 클릭할 때, When 알림 목록이 표시되면, Then 읽지 않은 알림이 상단에 표시된다
3. Given 사용자가 알림을 클릭할 때, When 읽음 처리되면, Then 알림 벨 카운트가 감소한다
4. Given 고객에게 주문 상태 변경 알림이 발생할 때, When 알림이 생성되면, Then 해당 고객에게만 토스트 알림이 표시된다

**페르소나**: 관리자, 직원, 고객

### US-6.3: 이메일 알림
**As a** 고객,
**I want** 주문 상태가 변경되면 이메일 알림을 받도록,
**So that** 앱에 접속하지 않아도 주문 진행 상황을 알 수 있다.

**Acceptance Criteria:**
1. Given 주문 상태가 변경될 때, When 이메일 발송이 트리거되면, Then 고객에게 상태 변경 이메일이 발송된다
2. Given 재고가 부족 임계값 이하로 떨어질 때, When 알림이 트리거되면, Then 관리자에게 재고 부족 이메일이 발송된다
3. Given 이메일 발송이 실패할 때, When 에러가 발생하면, Then 재시도 로직이 동작하고 실패가 로깅된다 (SECURITY-15)

**페르소나**: 고객, 관리자

---

## Epic 7: UX 개선 (FR-07)

### US-7.1: 반응형 디자인
**As a** 고객,
**I want** 모바일/태블릿/데스크톱에서 모두 편리하게 사용할 수 있도록,
**So that** 어떤 기기에서든 쇼핑 경험이 일관된다.

**Acceptance Criteria:**
1. Given 모바일 기기에서 접속할 때, When 페이지가 렌더링되면, Then 모바일에 최적화된 레이아웃이 표시된다
2. Given 태블릿에서 접속할 때, When 페이지가 렌더링되면, Then 태블릿에 적합한 레이아웃이 표시된다
3. Given 직원이 태블릿으로 재고를 관리할 때, When 재고 수정 UI를 사용하면, Then 터치 친화적인 인터페이스가 제공된다

**페르소나**: 고객, 직원

### US-7.2: 다크 모드
**As a** 고객,
**I want** 다크 모드를 사용할 수 있도록,
**So that** 어두운 환경에서도 편안하게 사용할 수 있다.

**Acceptance Criteria:**
1. Given 시스템 설정이 다크 모드일 때, When 앱에 접속하면, Then 자동으로 다크 모드가 적용된다
2. Given 사용자가 수동으로 모드를 전환할 때, When 토글을 클릭하면, Then 즉시 모드가 변경되고 설정이 저장된다

**페르소나**: 모든 사용자

### US-7.3: 로딩 및 에러 상태
**As a** 고객,
**I want** 데이터 로딩 중 스켈레톤 UI가 표시되고 에러 시 명확한 메시지가 표시되도록,
**So that** 앱 상태를 항상 파악할 수 있다.

**Acceptance Criteria:**
1. Given 데이터를 로딩 중일 때, When 페이지가 렌더링되면, Then 스켈레톤 로딩 UI가 표시된다
2. Given API 호출이 실패할 때, When 에러가 발생하면, Then 사용자 친화적 에러 메시지와 재시도 옵션이 표시된다
3. Given 예상치 못한 에러가 발생할 때, When React Error Boundary가 동작하면, Then 앱이 크래시되지 않고 에러 페이지가 표시된다

**페르소나**: 모든 사용자
