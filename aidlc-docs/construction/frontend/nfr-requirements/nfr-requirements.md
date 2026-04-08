# Frontend NFR Requirements

> requirements.md NFR 섹션 + Functional Design 기반 Frontend 특화 비기능 요구사항

---

## NFR-FE-01: 성능

| 항목 | 목표 |
|---|---|
| LCP (Largest Contentful Paint) | < 3초 |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| API 응답 후 UI 반영 | < 200ms |
| SSE 이벤트 → UI 갱신 | < 500ms |
| 대시보드 초기 로드 | < 3초 (requirements.md NFR-01) |

### 번들 최적화
- 라우트별 코드 스플리팅 (`React.lazy` + `Suspense`)
- Tree shaking (Vite 기본)
- 번들 분석 도구 (`rollup-plugin-visualizer`)
- 주요 라이브러리 별도 chunk: React, React Query, Recharts, Radix UI

### 렌더링 최적화
- React Query 캐싱으로 불필요한 API 호출 방지
- `React.memo` / `useMemo` / `useCallback` 적절히 사용
- 가상화 (virtualization): 대량 리스트 시 고려 (현재 범위에서는 pagination으로 충분)

---

## NFR-FE-02: 보안 (Security Extension 적용)

| SECURITY Rule | Frontend 적용 |
|---|---|
| SECURITY-05 | Zod + React Hook Form으로 모든 폼 입력 클라이언트 검증 |
| SECURITY-08 | RouteGuard로 역할별 접근 제어, 권한 없는 메뉴 숨김 |
| SECURITY-09 | 에러 메시지 일반화, 내부 정보 노출 금지 |
| SECURITY-12 | 비밀번호 정책 UI 검증 (8자+, 대소문자+숫자+특수문자) |
| SECURITY-13 | 외부 CDN 리소스 사용 시 SRI hash 적용 |
| SECURITY-15 | Error Boundary, API 에러 핸들링, SSE 재연결 |

### 추가 보안
- JWT 토큰은 localStorage 저장 (HttpOnly cookie는 Backend 결정)
- 토큰 만료 시 자동 refresh → 실패 시 로그아웃
- XSS 방지: React 기본 이스케이핑 + 사용자 입력 sanitize
- CORS: Backend에서 제어 (Frontend는 same-origin 또는 허용된 origin)

---

## NFR-FE-03: 가용성 / 안정성

- Error Boundary로 컴포넌트 크래시 격리
- SSE 연결 끊김 시 exponential backoff 재연결 (max 30초)
- React Query retry: 3회 (네트워크 에러)
- 오프라인 감지: 네트워크 상태 표시 (선택적)

---

## NFR-FE-04: 반응형 / UX

- Tailwind 기본 breakpoint: sm(640), md(768), lg(1024), xl(1280)
- 모바일 우선 설계 (mobile-first)
- 터치 친화적 UI (최소 터치 타겟 44x44px)
- 다크 모드: Tailwind `dark:` 클래스 + `class` 전략
- 스켈레톤 로딩: 모든 데이터 로딩 상태
- 이미지: lazy loading (`loading="lazy"`)

---

## NFR-FE-05: 접근성 (a11y)

- Radix UI 기본 접근성 활용 (ARIA 속성, 포커스 관리)
- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- `aria-label` / `aria-describedby` 적절히 사용
- 색상 대비: 다크/라이트 모드 모두 충분한 대비 유지
- 스크린 리더 호환: 시맨틱 HTML + ARIA

---

## NFR-FE-06: 유지보수성

- TypeScript strict mode
- ESLint + Prettier 설정
- 컴포넌트 단위 파일 구조 (feature-based)
- 공통 hooks/components 분리
- Tailwind 커스텀 테마 (디자인 토큰)

---

## NFR-FE-07: 브라우저 지원

| 브라우저 | 지원 버전 |
|---|---|
| Chrome | 최신 2버전 |
| Edge | 최신 2버전 |
| Firefox | 최신 2버전 |
| Safari | 최신 2버전 |
| IE11 | ❌ 미지원 |
