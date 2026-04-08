# Inventrix 현대화 프로젝트 — 요구사항 문서

## Intent Analysis Summary

- **사용자 요청**: Inventrix application의 아키텍처를 향상시키고 새로운 기능을 추가해서 현대화. research-agent를 이용해서 주문 및 재고 관리 소프트웨어의 최신 업계 트렌드와 사용자 요구사항을 조사하고 반영하여 개발 진행.
- **요청 유형**: Enhancement + Migration + New Feature (복합)
- **범위 추정**: System-wide (전체 시스템)
- **복잡도 추정**: Complex
- **프로젝트 유형**: Brownfield (기존 코드베이스 현대화)

---

## 프로젝트 범위

Research 로드맵 **1~2단계** (기반 구축 + 아키텍처/API 현대화)를 이번 프로젝트 범위로 확정.

### 범위 내 (In Scope)
- 데이터베이스 마이그레이션 (SQLite → 프로덕션급 DB)
- 보안 강화 (헤더, 입력 검증, JWT 개선, rate limiting)
- 재고 예약 시스템 + 주문 취소 시 재고 복원
- 모듈러 모놀리스 리팩토링 (Service/Repository 계층 분리)
- RBAC 도입 (5개 역할)
- 실시간 기능 (SSE 대시보드 + 인앱 알림 + 이메일 알림)
- UX 중간 수준 개선 (반응형 + 다크 모드 + 로딩 상태)
- 보안 extension 규칙 전체 적용

### 범위 외 (Out of Scope)
- 외부 서비스 연동 (결제, 배송, 마켓플레이스)
- WCAG 2.1 AA 준수
- PWA 구현
- 고급 재고 기능 (바코드, 배치 추적, AI 예측)
- 고급 주문 기능 (분할 배송, 반품 포털, 멀티채널)
- OAuth 2.0 / SSO 연동

---

## 팀 구성

| 역할 | 담당 영역 |
|---|---|
| PO | 비즈니스 요구사항, 우선순위 결정 |
| Backend 담당자 | API, DB, 비즈니스 로직, 인증/인가 |
| Frontend 담당자 | UI, 상태 관리, 스타일링, UX |
| Cloud/Infra 담당자 | 배포, CI/CD, 인프라, 캐싱 |

---

## 기능 요구사항 (Functional Requirements)

### FR-01: 데이터베이스 마이그레이션
- SQLite에서 프로덕션급 데이터베이스로 마이그레이션
- 기존 데이터 모델(users, products, orders, order_items) 유지
- 동시성 지원 (다중 writer)
- 커넥션 풀링 적용
- 구체적 DB 선택은 Backend 담당자 결정

### FR-02: 모듈러 모놀리스 리팩토링
- 현재 Fat Routes 패턴을 모듈 기반 구조로 리팩토링
- 모듈 경계: `orders/`, `inventory/`, `catalog/`, `users/`, `analytics/`
- 각 모듈에 Service/Repository 계층 분리
- 모듈 간 직접 DB 접근 금지 — 서비스 인터페이스를 통해 통신
- 내부 이벤트 버스 도입 (타입 지정 도메인 이벤트)

### FR-03: 주문 관리 개선
- 주문 상태 전이 규칙 적용 (유효한 상태 변경만 허용)
  - pending → processing, cancelled
  - processing → shipped, cancelled
  - shipped → delivered
  - delivered, cancelled → 변경 불가
- 주문 취소 시 재고 자동 복원
- 환불 로직 구현 (취소된 주문에 대한 환불 상태 추적)

### FR-04: 재고 예약 시스템
- 주문 생성 시 재고 예약 (reservation)
- 예약 타임아웃 (설정 가능, 기본 15분) 후 자동 해제
- 주문 확정 시 예약된 재고를 원자적으로 차감
- 주문 취소 시 예약 해제 및 재고 복원
- 동시 주문 시 경쟁 조건 방지

### FR-05: RBAC (역할 기반 접근 제어)
- 5개 역할 도입:
  - **슈퍼 관리자**: 전체 시스템 관리, 역할 할당
  - **관리자**: 상품/주문/재고 관리, 분석 조회
  - **창고 관리자**: 재고 관리, 주문 상태 변경 (배송 관련)
  - **직원**: 주문 조회, 기본 재고 조회
  - **분석가**: 분석 대시보드 조회 전용
- 모든 API 엔드포인트에 역할 기반 권한 검사
- 역할 관리 UI (슈퍼 관리자 전용)

### FR-06: 실시간 기능
- SSE (Server-Sent Events) 기반 실시간 대시보드 업데이트
- 인앱 알림 시스템:
  - 토스트 알림 (실시간 이벤트)
  - 알림 벨 (읽지 않은 알림 수 표시)
  - 알림 목록 조회 및 읽음 처리
- 이메일 알림:
  - 외부 이메일 서비스(SES 등) 연동
  - 주문 상태 변경 시 고객에게 이메일 발송
  - 부족 재고 알림 이메일 (관리자)
  - 알림 대상 이벤트: 주문 생성, 상태 변경, 재고 부족, 품절

### FR-07: UX 개선
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 다크 모드 지원 (시스템 설정 감지 + 수동 전환)
- 스켈레톤 로딩 상태 (데이터 로딩 중 UI)
- 에러 상태 처리 (React Error Boundary)
- 인라인 스타일 제거 → 체계적 스타일링 (구체적 방식은 Frontend 담당자 결정)

---

## 비기능 요구사항 (Non-Functional Requirements)

### NFR-01: 성능
- 현재 대상: 동시 사용자 ~500명
- 아키텍처는 1000명+ 확장 가능하게 설계
- API 응답 시간: p95 < 500ms (일반 CRUD 작업)
- 대시보드 로딩: < 3초

### NFR-02: 보안 (Security Extension 전체 적용)
- SECURITY-01 ~ SECURITY-15 전체 blocking constraint로 적용
- 주요 항목:
  - DB 암호화 (at rest + in transit)
  - HTTP 보안 헤더 (CSP, HSTS, X-Frame-Options 등)
  - 모든 API 입력 검증 (Zod 등)
  - 최소 권한 원칙 (IAM)
  - 제한적 네트워크 설정
  - 애플리케이션 레벨 접근 제어 (IDOR 방지, CORS 제한)
  - 보안 하드닝 (하드코딩된 시크릿 제거)
  - 소프트웨어 공급망 보안 (의존성 스캔)
  - 구조화 로깅 + 감사 로그
  - 인증 강화 (비밀번호 정책, 브루트포스 방지, MFA for admin)
  - Rate limiting
  - 글로벌 에러 핸들러 (fail-safe)
  - 보안 이벤트 알림 및 모니터링

### NFR-03: 확장성
- 모듈러 모놀리스 아키텍처로 향후 마이크로서비스 전환 가능
- 수평 확장 가능한 설계 (stateless 서버)
- 캐싱 전략 적용 (구체적 방식은 Infra 담당자 결정)

### NFR-04: 유지보수성
- TypeScript strict mode
- 코드 품질 도구 도입 (구체적 도구는 Backend 담당자 결정)
- 모듈 간 명확한 경계와 인터페이스

### NFR-05: 가용성
- 배포 중단 최소화
- DB 마이그레이션 시 데이터 무결성 보장
- 구체적 배포 전략은 Infra 담당자 결정

---

## 담당자별 기술 결정 사항 (별도 진행)

아래 항목들은 위 요구사항이 확정된 후, 각 담당자가 `role-specific-questions.md`를 통해 결정합니다:

### Backend 담당자
- 데이터베이스 선택 (PostgreSQL / MySQL 등)
- API 레이어 방식 (tRPC / Express REST 개선 / GraphQL)
- 테스트 프레임워크 및 코드 품질 도구

### Frontend 담당자
- 상태 관리 라이브러리 (React Query / Zustand 등)
- 스타일링 방식 (Tailwind CSS / CSS Modules 등)
- UI 컴포넌트 라이브러리 (shadcn/ui / Radix UI 등)

### Cloud/Infra 담당자
- 배포 인프라 (EC2 / ECS / 서버리스)
- CI/CD 파이프라인
- 캐싱/세션 저장소 (Redis 등)

---

## 기존 기술 부채 해결 (이번 범위에 포함)

Research 및 Reverse Engineering에서 식별된 P0/P1 기술 부채 중 이번 범위에서 해결되는 항목:

| 우선순위 | 문제 | 해결 방법 |
|---|---|---|
| 🔴 P0 | SQLite 프로덕션 사용 | FR-01: DB 마이그레이션 |
| 🔴 P0 | 재고 예약 시스템 없음 | FR-04: 재고 예약 시스템 |
| 🔴 P0 | 하드코딩된 JWT Secret | NFR-02: SECURITY-09 |
| 🟠 P1 | 입력 검증 없음 | NFR-02: SECURITY-05 |
| 🟠 P1 | 요청 제한 없음 | NFR-02: SECURITY-11 |
| 🟠 P1 | 에러 처리 미흡 | NFR-02: SECURITY-15 |
| 🟠 P1 | CORS 무제한 | NFR-02: SECURITY-08 |
| 🟠 P1 | 보안 헤더 없음 | NFR-02: SECURITY-04 |
| 🟠 P1 | 감사 로깅 없음 | NFR-02: SECURITY-03 |
| 🟠 P2 | 라우트에서 직접 DB 쿼리 | FR-02: 모듈러 모놀리스 |
| 🟠 P2 | 인라인 스타일 | FR-07: UX 개선 |
| 🟠 P2 | any 타입 사용 | NFR-04: TypeScript strict |
| 🟠 P2 | 비밀번호 정책 없음 | NFR-02: SECURITY-12 |
| 🟠 P2 | 토큰 만료 처리 미흡 | NFR-02: SECURITY-12 |
| 🟠 P2 | 주문 취소 시 재고 복원 없음 | FR-03: 주문 관리 개선 |
