# Backend Unit — 기술 결정 및 Functional Design 질문

> CONSTRUCTION PHASE 시작을 위한 통합 질문입니다.
> Section A: 기술 결정 (role-specific) / Section B: Functional Design 상세

---

## Section A: 기술 결정

### A-Q1: 데이터베이스
데이터베이스 마이그레이션 대상은?

A) PostgreSQL (Research 권장 — 프로덕션급, 동시성, LISTEN/NOTIFY, JSONB)
B) MySQL/MariaDB
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### A-Q2: ORM / DB 접근 방식
DB 접근 방식은?

A) Prisma ORM (Research 권장 — 타입 안전, 마이그레이션 도구, PostgreSQL 최적화)
B) Drizzle ORM (SQL-first, 경량, TypeScript 네이티브)
C) Raw SQL + query builder (knex.js 등)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### A-Q3: API 레이어
API 레이어 현대화 방향은? (cross-unit-contracts.md에 REST API 계약이 확정됨)

A) 기존 Express REST 유지하되 구조 개선 (Service/Repository 계층 분리, Zod 검증 추가)
B) tRPC로 마이그레이션 (엔드투엔드 TypeScript 타입 안전성)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### A-Q4: 테스트 및 코드 품질
테스트 프레임워크 및 코드 품질 도구는?

A) 기본 — ESLint + Prettier만
B) 중간 — ESLint + Prettier + 단위 테스트 (Vitest)
C) 고급 — 중간 + 통합 테스트 (Supertest) + DB 테스트
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Section B: Functional Design 상세

### B-Q1: 주문 상태 전이 — 결제 흐름
현재 설계에서 주문 생성 시 status가 `pending`으로 시작합니다. 결제 처리 방식은?

A) 결제 연동 없음 — 주문 생성 즉시 `pending`, 관리자가 수동으로 `processing`으로 변경
B) 결제 연동 없음 — 주문 생성 시 자동으로 `processing`으로 전환 (pending 단계 생략)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### B-Q2: 재고 예약 — 예약 시점
재고 예약(reservation)이 생성되는 시점은?

A) 주문 생성(POST /api/orders) 시 즉시 예약 생성 + 주문 레코드 생성 (동시)
B) 장바구니에 담는 시점에 예약 생성 (장바구니 기능 추가 필요)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### B-Q3: 재고 예약 — 확정 시점
예약된 재고가 실제로 차감(confirm)되는 시점은?

A) 주문 상태가 `processing`으로 변경될 때 확정
B) 주문 생성 시 즉시 확정 (예약과 확정이 동시에 발생, 타임아웃 불필요)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### B-Q4: 환불 처리 방식
주문 취소 시 환불 레코드 처리 방식은?

A) 자동 — 주문 취소 시 환불 레코드 자동 생성 (status: `pending_refund`), 관리자가 `refunded`로 변경
B) 수동 — 주문 취소만 처리, 환불은 관리자가 별도로 생성
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### B-Q5: 비밀번호 정책 상세
비밀번호 정책 수준은?

A) 기본 — 최소 8자, 대소문자 + 숫자 + 특수문자 각 1개 이상
B) 강화 — 기본 + 이전 비밀번호 재사용 금지 (최근 5개) + 유출 비밀번호 목록 검사
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### B-Q6: 브루트포스 방지 방식
로그인 실패 시 브루트포스 방지 방식은?

A) 계정 잠금 — 5회 연속 실패 시 15분 잠금
B) 점진적 지연 — 실패 횟수에 비례하여 응답 지연 증가
C) 계정 잠금 + 관리자에게 보안 알림 발송
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### B-Q7: JWT 토큰 전략
JWT 토큰 관리 방식은?

A) Access Token (1시간) + Refresh Token (7일) — Refresh Token은 DB에 저장, 로그아웃 시 무효화
B) Access Token (15분) + Refresh Token (7일) — 더 짧은 access token으로 보안 강화
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### B-Q8: 이메일 알림 — 발송 대상 이벤트
이메일 알림을 발송할 이벤트 범위는?

A) 최소 — 주문 생성 확인, 주문 상태 변경 (고객에게만)
B) 중간 — 최소 + 재고 부족 알림 (관리자에게), 역할 변경 알림
C) 포괄 — 중간 + 환불 처리 완료, 예약 만료 알림, 보안 이벤트 (로그인 실패 연속)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### B-Q9: 감사 로그 범위
감사 로그(audit log)에 기록할 이벤트 범위는?

A) 핵심만 — 주문 상태 변경, 역할 변경, 로그인/로그아웃
B) 포괄 — 핵심 + 모든 CRUD 작업 (상품, 재고, 사용자), 환불 처리
C) 전체 — 포괄 + 모든 API 요청 (읽기 포함), 실패한 인증 시도
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### B-Q10: 구조화 로깅 라이브러리
구조화 로깅에 사용할 라이브러리는?

A) Pino (경량, 고성능, JSON 출력)
B) Winston (풍부한 기능, 다양한 transport)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---
