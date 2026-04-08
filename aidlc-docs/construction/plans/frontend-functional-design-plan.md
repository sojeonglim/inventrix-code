# Frontend Functional Design Plan

## 기술 결정 요약
- **상태 관리**: React Query (TanStack Query) — 서버 상태 관리
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI (headless, 접근성 우수)

## Plan Checkboxes

### Step 1: 질문 수집 및 답변
- [x] Functional Design 질문 파일 생성
- [x] 사용자 답변 수집
- [x] 답변 분석 및 모호성 확인

### Step 2: Domain Entities 설계
- [x] Frontend 타입 정의 (cross-unit-contracts 기반)
- [x] 클라이언트 전용 상태 타입 정의 (Theme, UI 상태 등)

### Step 3: Business Logic Model 설계
- [x] API Client 구조 (React Query 기반)
- [x] 인증 흐름 (로그인/회원가입/토큰 갱신/로그아웃)
- [x] RBAC 라우팅 및 권한 기반 UI 렌더링
- [x] SSE 연결 관리 및 실시간 업데이트
- [x] 알림 시스템 (토스트 + 알림 벨)
- [x] 다크 모드 (시스템 감지 + 수동 전환)
- [x] 폼 검증 로직 (Zod 기반)

### Step 4: Business Rules 설계
- [x] 주문 상태 전이 UI 규칙 (역할별 허용 액션)
- [x] 재고 표시 규칙 (가용 재고 vs 실제 재고)
- [x] 역할별 네비게이션 및 접근 제어 규칙
- [x] 에러 처리 규칙 (Error Boundary + API 에러)

### Step 5: Frontend Components 설계
- [x] 컴포넌트 계층 구조 (페이지/레이아웃/공통)
- [x] 각 컴포넌트의 Props/State 정의
- [x] 사용자 인터랙션 흐름
- [x] API 연동 포인트 (어떤 컴포넌트가 어떤 endpoint 사용)

### Step 6: Artifacts 생성
- [x] `domain-entities.md` 생성
- [x] `business-logic-model.md` 생성
- [x] `business-rules.md` 생성
- [x] `frontend-components.md` 생성

### Step 7: 승인
- [x] 사용자 리뷰 및 승인
