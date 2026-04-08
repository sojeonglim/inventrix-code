# 담당자별 기술 결정 질문 (팀 협의 후 진행)

> ⚠️ 이 질문들은 팀 전체 협의(`requirement-verification-questions.md`)가 완료된 후,
> 확정된 비즈니스 요구사항을 기반으로 각 담당자가 결정합니다.

---

## Backend 담당자

### Backend-Q1
데이터베이스 마이그레이션 대상은?

A) PostgreSQL (Research 권장 — 프로덕션급, 동시성, 풍부한 기능)
B) MySQL/MariaDB
C) 현재 SQLite 유지
D) Other (please describe after [Answer]: tag below)

[Answer]: 

### Backend-Q2
API 레이어 현대화 방향은?

A) tRPC로 마이그레이션 (Research 권장 — 엔드투엔드 TypeScript 타입 안전성)
B) 기존 Express REST 유지하되 구조 개선 (Service/Repository 계층 분리, Zod 검증 추가)
C) GraphQL로 마이그레이션
D) Other (please describe after [Answer]: tag below)

[Answer]: 

### Backend-Q3
테스트 프레임워크 및 코드 품질 도구는?

A) 기본 — ESLint + Prettier만
B) 중간 — ESLint + Prettier + 단위 테스트 (Vitest)
C) 고급 — 중간 + 통합 테스트 + E2E 테스트 (Playwright)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Frontend 담당자

### Frontend-Q1
상태 관리 라이브러리는?

A) React Query (TanStack Query) — Research 권장
B) Zustand
C) Redux Toolkit
D) React Query + Zustand (서버 상태 + 클라이언트 상태 분리)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

### Frontend-Q2
스타일링 방향은?

A) Tailwind CSS (Research 권장)
B) CSS Modules
C) styled-components / Emotion
D) 기존 인라인 스타일 정리만
E) Other (please describe after [Answer]: tag below)

[Answer]: 

### Frontend-Q3
UI 컴포넌트 라이브러리 사용 여부는?

A) 사용 안 함 — 커스텀 컴포넌트 직접 구현
B) shadcn/ui (Tailwind 기반, 복사-붙여넣기 방식)
C) Radix UI (headless, 접근성 우수)
D) MUI (Material UI)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Cloud/Infra 담당자

### Infra-Q1
배포 인프라 현대화 방향은?

A) 현재 EC2 + Nginx 유지 (스크립트 개선만)
B) EC2 유지 + CDK/IaC 도입
C) 컨테이너화 (Docker + ECS/Fargate)
D) 서버리스 (Lambda + API Gateway)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

### Infra-Q2
CI/CD 파이프라인 도입 범위는?

A) 도입 안 함 — 수동 배포 유지
B) 기본 — GitHub Actions (빌드 + 린트 + 테스트)
C) 중간 — GitHub Actions + 자동 배포 (staging → production)
D) 고급 — 중간 + 인프라 변경 자동화 (CDK deploy)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

### Infra-Q3
캐싱/세션 저장소로 Redis 도입 여부는?

A) 도입 — Redis 사용 (세션, 요청 제한, 캐시, pub/sub)
B) 도입하되 최소 범위 — 세션 + 요청 제한만
C) 도입 안 함 — 인메모리 또는 DB 기반으로 처리
D) Other (please describe after [Answer]: tag below)

[Answer]: 
