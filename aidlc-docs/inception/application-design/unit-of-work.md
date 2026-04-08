# Unit of Work

## 분할 전략
- **방식**: 기술 계층 기반 (Backend / Frontend / Infrastructure)
- **근거**: 모듈러 모놀리스 아키텍처에서 Backend 모듈 간 긴밀한 통합(EventBus, 트랜잭션)이 필요하므로 Backend를 하나의 Unit으로 유지. 팀 구성(Backend 담당자, Frontend 담당자, Cloud/Infra 담당자)과도 자연스럽게 매핑됨.
- **실행 순서**: Backend / Frontend / Infrastructure 병렬 진행 가능 (cross-unit-contracts.md로 계약 확정됨)

---

## Unit 1: Backend

- **패키지**: `packages/api`
- **담당자**: Backend 담당자
- **범위**:
  - DB 마이그레이션 (SQLite → 프로덕션 DB) + 커넥션 풀링 + 마이그레이션 스크립트
  - 모듈러 모놀리스 리팩토링 (6개 모듈: catalog, orders, inventory, users, analytics, notifications)
  - 각 모듈의 Service/Repository 계층 구현
  - EventBus (In-memory TypedEventEmitter)
  - 주문 상태 전이 (state machine)
  - 재고 예약 시스템 (reservation + 타임아웃)
  - 주문 취소 + 재고 복원 + 환불 상태 추적
  - RBAC (3개 역할: 관리자, 직원, 고객)
  - 인증 강화 (비밀번호 정책, 브루트포스 방지, JWT 개선)
  - SSE 엔드포인트 (사용자별 개별 연결)
  - 인앱 알림 API (CRUD + 읽음 처리)
  - 이메일 알림 서비스 (외부 서비스 연동)
  - Shared Infrastructure (미들웨어, 검증, 로깅, 에러 핸들링)
  - 보안 강화 (헤더, rate limiting, CORS, 입력 검증, 감사 로그)
- **산출물**: 리팩토링된 API 서버 + 새 DB 스키마 + 마이그레이션 스크립트

## Unit 2: Frontend

- **패키지**: `packages/frontend`
- **담당자**: Frontend 담당자
- **의존성**: cross-unit-contracts.md (API 계약 확정됨) — Backend 완료 대기 불필요, 병렬 진행 가능
- **범위**: (모바일/태블릿/데스크톱)
  - 다크 모드 (시스템 감지 + 수동 전환)
  - 스타일링 체계화 (인라인 스타일 제거)
  - RBAC UI (역할별 네비게이션, 역할 관리 페이지)
  - 주문 관리 UI 개선 (상태 전이 표시, 취소 기능)
  - 재고 관리 UI (가용 재고/예약 표시)
  - 실시간 대시보드 (SSE 연동)
  - 인앱 알림 UI (토스트, 알림 벨, 알림 목록)
  - 스켈레톤 로딩 상태
  - Error Boundary
  - API Client 리팩토링 (인증 토큰 자동 관리)
- **산출물**: 현대화된 React SPA

## Unit 3: Infrastructure

- **패키지**: 신규 (인프라 구성)
- **담당자**: Cloud/Infra 담당자
- **의존성**: cross-unit-contracts.md (환경 변수, 외부 서비스 요구사항 확정됨) — Backend 완료 대기 불필요, 병렬 진행 가능
- **범위**:
  - 프로덕션 DB 인프라 프로비저닝
  - 이메일 서비스 (SES) 설정
  - 배포 환경 구성 (기존 EC2 + Nginx 개선 또는 새 모델)
  - SSL 인증서 (자체 서명 → 적절한 인증서)
  - 환경 변수 관리 (하드코딩 시크릿 제거)
  - CI/CD 파이프라인 (구체적 방식은 Infra 담당자 결정)
  - 모니터링/로깅 인프라
- **산출물**: 인프라 구성 코드 + 배포 스크립트 + CI/CD 설정
