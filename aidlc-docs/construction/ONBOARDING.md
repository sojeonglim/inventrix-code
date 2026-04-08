# 담당자 온보딩 가이드

## 개요
Inventrix 현대화 프로젝트의 INCEPTION PHASE가 완료되었습니다.
각 담당자는 이 가이드를 따라 CONSTRUCTION PHASE를 시작해주세요.

---

## 시작 전 필수 읽기 문서

모든 담당자 공통:
1. `aidlc-docs/inception/requirements/requirements.md` — 확정된 요구사항
2. `aidlc-docs/inception/user-stories/stories.md` — User Stories (18개)
3. `aidlc-docs/inception/user-stories/personas.md` — 페르소나 (3개: 고객, 관리자, 직원)
4. `aidlc-docs/inception/application-design/cross-unit-contracts.md` — ⭐ **핵심** — API 계약, SSE 스키마, 환경 변수, 보안 계약
5. `aidlc-docs/inception/application-design/application-design.md` — 통합 설계 문서

---

## Unit별 시작 절차

### Unit 1: Backend 담당자

**작업 디렉토리**: `aidlc-docs/construction/backend/`

1. 추가 읽기:
   - `aidlc-docs/inception/application-design/components.md` — 6개 모듈 정의
   - `aidlc-docs/inception/application-design/component-methods.md` — method signatures
   - `aidlc-docs/inception/application-design/services.md` — orchestration 패턴
   - `aidlc-docs/inception/application-design/component-dependency.md` — 모듈 간 의존성
   - `aidlc-docs/inception/reverse-engineering/` — 기존 코드 분석 문서
2. `role-specific-questions-backend.md`의 3개 질문에 답변 (DB 선택, API 레이어, 테스트 도구)
3. AI-DLC에 다음과 같이 요청: "Unit 1: Backend의 CONSTRUCTION PHASE를 시작해줘. role-specific-questions 답변 완료했어."
4. AI가 `aidlc-state.md`를 읽고 Functional Design부터 진행

### Unit 2: Frontend 담당자

**작업 디렉토리**: `aidlc-docs/construction/frontend/`

1. 추가 읽기:
   - `aidlc-docs/inception/application-design/application-design.md` Section 3 — Frontend 구조
   - `aidlc-docs/inception/reverse-engineering/` — 기존 코드 분석 문서
2. `role-specific-questions-frontend.md`의 3개 질문에 답변 (상태 관리, 스타일링, UI 라이브러리)
3. AI-DLC에 다음과 같이 요청: "Unit 2: Frontend의 CONSTRUCTION PHASE를 시작해줘. role-specific-questions 답변 완료했어."
4. AI가 `aidlc-state.md`를 읽고 Functional Design부터 진행

### Unit 3: Infrastructure 담당자

**작업 디렉토리**: `aidlc-docs/construction/infrastructure/`

1. 추가 읽기:
   - `aidlc-docs/inception/application-design/cross-unit-contracts.md` Section 4 — Infrastructure Contract
   - `aidlc-docs/inception/reverse-engineering/technology-stack.md` — 현재 인프라
2. `role-specific-questions-infrastructure.md`의 3개 질문에 답변 (배포 인프라, CI/CD, Redis)
3. AI-DLC에 다음과 같이 요청: "Unit 3: Infrastructure의 CONSTRUCTION PHASE를 시작해줘. role-specific-questions 답변 완료했어."
4. AI가 `aidlc-state.md`를 읽고 NFR Requirements부터 진행 (Functional Design은 Skip 가능)

---

## CONSTRUCTION 단계 흐름

각 Unit은 다음 단계를 순서대로 진행합니다:

```
role-specific-questions 답변
  → Functional Design (비즈니스 로직 상세 설계)
  → NFR Requirements (비기능 요구사항 평가)
  → NFR Design (비기능 설계)
  → Infrastructure Design (인프라 설계 — Unit 3 주 담당)
  → Code Generation (코드 구현)
  → Build and Test (빌드 및 테스트)
```

각 단계에서 AI가 설계/코드를 생성하고 승인을 요청합니다.

---

## 계약 변경 시

개발 중 cross-unit-contracts.md 변경이 필요한 경우:
1. 변경 내용을 cross-unit-contracts.md에 먼저 반영
2. 영향받는 Unit 담당자에게 즉시 공유
3. Breaking change는 관련 담당자 합의 후 반영

---

## 디렉토리 구조

```
aidlc-docs/
├── inception/                          # ✅ INCEPTION 완료
│   ├── requirements/
│   ├── user-stories/
│   ├── application-design/
│   │   ├── cross-unit-contracts.md     # ⭐ Unit 간 계약
│   │   ├── unit-of-work.md
│   │   └── ...
│   ├── plans/
│   └── reverse-engineering/
├── construction/
│   ├── backend/                        # ← Backend 담당자
│   │   ├── aidlc-state.md
│   │   ├── audit.md
│   │   ├── role-specific-questions-backend.md
│   │   ├── functional-design/
│   │   ├── nfr-requirements/
│   │   ├── nfr-design/
│   │   ├── code/
│   │   └── plans/
│   ├── frontend/                       # ← Frontend 담당자
│   │   ├── aidlc-state.md
│   │   ├── audit.md
│   │   ├── role-specific-questions-frontend.md
│   │   └── ...
│   ├── infrastructure/                 # ← Infra 담당자
│   │   ├── aidlc-state.md
│   │   ├── audit.md
│   │   ├── role-specific-questions-infrastructure.md
│   │   └── ...
│   └── build-and-test/                 # ← 통합 테스트 (전체 완료 후)
├── aidlc-state.md                      # 전체 프로젝트 상태
└── audit.md                            # 전체 프로젝트 감사 로그
```
