# Frontend 담당자 기술 결정 질문

> ⚠️ CONSTRUCTION PHASE 시작 전에 답변을 완료해주세요.
> 팀 전체 협의로 확정된 요구사항(`requirements.md`)과 API 계약(`cross-unit-contracts.md`)을 기반으로 결정합니다.

---

### Frontend-Q1: 상태 관리
상태 관리 라이브러리는?

A) React Query (TanStack Query) — Research 권장
B) Zustand
C) Redux Toolkit
D) React Query + Zustand (서버 상태 + 클라이언트 상태 분리)
E) Other (please describe after [Answer]: tag below)

[Answer]: A 

### Frontend-Q2: 스타일링
스타일링 방향은?

A) Tailwind CSS (Research 권장)
B) CSS Modules
C) styled-components / Emotion
D) Other (please describe after [Answer]: tag below)

[Answer]: A 

### Frontend-Q3: UI 컴포넌트 라이브러리
UI 컴포넌트 라이브러리 사용 여부는?

A) 사용 안 함 — 커스텀 컴포넌트 직접 구현
B) shadcn/ui (Tailwind 기반, 복사-붙여넣기 방식)
C) Radix UI (headless, 접근성 우수)
D) MUI (Material UI)
E) Other (please describe after [Answer]: tag below)

[Answer]: C 
 