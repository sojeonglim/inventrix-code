# Story Generation Plan

## 개요
Inventrix 현대화 프로젝트의 요구사항(FR-01~FR-07, NFR-01~NFR-05)을 사용자 중심 스토리로 변환합니다.

---

## Part 1: 질문

아래 질문에 답변하여 스토리 생성 방향을 결정해주세요.

### Question 1
User Story 분류(breakdown) 방식은 어떤 것을 선호하시나요?

A) Persona-Based — 역할별로 스토리 그룹화 (슈퍼 관리자, 관리자, 창고 관리자, 직원, 분석가, 고객)
B) Feature-Based — 기능별로 스토리 그룹화 (주문 관리, 재고, RBAC, 실시간 알림, UX 등)
C) Epic-Based — 상위 Epic 아래 하위 스토리로 계층 구조화
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
Acceptance Criteria의 상세 수준은?

A) 간결 — Given/When/Then 형식으로 핵심 시나리오만 (스토리당 2~3개)
B) 상세 — Given/When/Then + 엣지 케이스 + 에러 시나리오 포함 (스토리당 4~6개)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
RBAC 5개 역할의 권한 범위에 대해 추가 정의가 필요합니다. 창고 관리자의 권한 범위는?

A) 재고 관리 전체 + 주문 상태 중 배송 관련만 (processing → shipped, shipped → delivered)
B) 재고 관리 전체 + 모든 주문 상태 변경
C) 재고 조회/수정만 (주문 상태 변경 불가)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
직원(Staff) 역할의 구체적 권한은?

A) 주문 조회 + 재고 조회만 (읽기 전용)
B) 주문 조회 + 재고 조회 + 주문 상태를 processing으로 변경 가능
C) 주문 조회 + 재고 조회 + 상품 조회 (모든 읽기 권한)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 5
이메일 알림 대상 이벤트 중 우선순위를 확인합니다. 고객에게 발송할 이메일은?

A) 주문 상태 변경 시에만 (주문 확인, 배송 시작, 배송 완료)
B) 주문 상태 변경 + 주문 취소/환불 확인
C) 주문 관련 전체 + 계정 관련 (회원가입 환영, 비밀번호 변경)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 6
관리자에게 발송할 이메일 알림은?

A) 재고 부족 알림만 (stock < 임계값)
B) 재고 부족 + 품절 + 신규 주문 알림
C) 재고 부족 + 품절 + 보안 이벤트 (로그인 실패 반복 등)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Part 2: 생성 계획

질문 답변 확인 후 아래 순서로 스토리를 생성합니다.

- [ ] Step 1: 사용자 페르소나 생성 (6개 역할)
- [ ] Step 2: RBAC 권한 매트릭스 정의
- [ ] Step 3: User Stories 생성 (요구사항 FR-01~FR-07 기반)
- [ ] Step 4: Acceptance Criteria 작성
- [ ] Step 5: 페르소나-스토리 매핑
- [ ] Step 6: INVEST 기준 검증
- [ ] Step 7: personas.md 저장
- [ ] Step 8: stories.md 저장
