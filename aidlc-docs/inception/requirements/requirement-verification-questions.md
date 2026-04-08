# Requirements Verification Questions — 팀 전체 협의

이 질문들은 프로젝트의 방향과 범위를 결정하는 사항으로, 팀 전체(PO, Backend, Frontend, Cloud/Infra)가 함께 협의하여 답변해주세요.
각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션 문자를 입력해주세요.

---

## Question 1
이번 현대화 프로젝트의 구현 범위는 어디까지인가요? (Research 로드맵 기준)

A) 1단계만 — 기반 구축 (DB 마이그레이션, 보안 강화, 재고 예약)
B) 1~2단계 — 기반 구축 + 아키텍처/API 현대화 (모듈러 모놀리스, RBAC)
C) 1~3단계 — 기반 구축 + 아키텍처 + 기능 현대화 (OMS, IMS, 분석)
D) 1~4단계 — 기반 구축 + 아키텍처 + 기능 + UX 현대화 (PWA, 접근성)
E) 전체 5단계 — 외부 연동(결제, 배송, 마켓플레이스)까지 포함
F) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
주문 관리 기능 중 이번에 구현할 비즈니스 범위는?

A) 기본 — 주문 상태 워크플로우 개선 + 주문 취소/환불 로직
B) 중간 — 기본 + 분할 배송 + 셀프서비스 반품 포털
C) 고급 — 중간 + 멀티채널 대시보드 + 자동 주문 라우팅 + 실시간 추적
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
재고 관리 기능 중 이번에 구현할 비즈니스 범위는?

A) 기본 — 재고 예약 시스템 + 주문 취소 시 재고 복원
B) 중간 — 기본 + 동적 재주문 시점 + 재고 이동 감사 로그
C) 고급 — 중간 + 바코드/QR 스캔 + 배치/로트 추적 + AI 수요 예측
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
인증/인가 시스템의 비즈니스 요구 수준은?

A) 기본 — 현재 2개 역할(admin, customer) 유지, 보안만 강화
B) 중간 — RBAC 도입 (슈퍼 관리자, 관리자, 창고 관리자, 직원, 분석가)
C) 고급 — RBAC + OAuth 2.0 / SSO 연동
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
실시간 기능(알림, 대시보드 업데이트)이 비즈니스적으로 필요한가요?

A) 필요 없음 — 기존 방식 유지
B) 기본 — 대시보드 실시간 업데이트만
C) 고급 — 실시간 대시보드 + 알림 시스템 (토스트, 알림 벨, 이메일)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 6
외부 서비스 연동이 이번 범위에 포함되나요?

A) 포함 안 함 — 내부 기능에 집중
B) 결제만 — Stripe 등 결제 게이트웨이
C) 결제 + 배송 — 결제 + 배송사 연동
D) 결제 + 배송 + 마켓플레이스 — 전체 외부 연동
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
이 프로젝트의 대상 사용자 규모는?

A) 소규모 — 단일 팀/소규모 비즈니스 (동시 사용자 ~50명)
B) 중규모 — 중소기업 (동시 사용자 ~500명)
C) 대규모 — 엔터프라이즈 (동시 사용자 1000명+)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
UX/접근성 개선의 비즈니스 요구 수준은?

A) 최소 — 기본적인 반응형 디자인만
B) 중간 — 반응형 + 다크 모드 + 로딩 상태 개선
C) 고급 — WCAG 2.1 AA 준수 + PWA + 모바일 최적화
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 9: Security Extensions
이 프로젝트에 보안 extension 규칙을 적용해야 하나요?

A) Yes — 모든 SECURITY 규칙을 blocking constraint로 적용 (프로덕션급 애플리케이션에 권장)
B) No — 모든 SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: A
