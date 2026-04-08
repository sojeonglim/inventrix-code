# Backend 담당자 기술 결정 질문

> ⚠️ CONSTRUCTION PHASE 시작 전에 답변을 완료해주세요.
> 팀 전체 협의로 확정된 요구사항(`requirements.md`)과 API 계약(`cross-unit-contracts.md`)을 기반으로 결정합니다.

---

### Backend-Q1: 데이터베이스
데이터베이스 마이그레이션 대상은?

A) PostgreSQL (Research 권장 — 프로덕션급, 동시성, 풍부한 기능)
B) MySQL/MariaDB
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Backend-Q2: API 레이어
API 레이어 현대화 방향은? (cross-unit-contracts.md에 REST API 계약이 확정되어 있음)

A) 기존 Express REST 유지하되 구조 개선 (Service/Repository 계층 분리, Zod 검증 추가)
B) tRPC로 마이그레이션 (엔드투엔드 TypeScript 타입 안전성)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Backend-Q3: 테스트 및 코드 품질
테스트 프레임워크 및 코드 품질 도구는?

A) 기본 — ESLint + Prettier만
B) 중간 — ESLint + Prettier + 단위 테스트 (Vitest)
C) 고급 — 중간 + 통합 테스트 + E2E 테스트 (Playwright)
D) Other (please describe after [Answer]: tag below)

[Answer]: B
