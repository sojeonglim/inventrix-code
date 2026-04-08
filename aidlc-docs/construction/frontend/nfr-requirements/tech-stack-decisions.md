# Frontend Tech Stack Decisions

> role-specific-questions + NFR 질문 답변 기반 확정

---

## 확정 기술 스택

| 카테고리 | 기술 | 버전 | 선택 근거 |
|---|---|---|---|
| Framework | React | 18.x | 기존 사용 중, 유지 |
| Build Tool | Vite | 5.x | 기존 사용 중, 빠른 HMR |
| Language | TypeScript | 5.x (strict) | 기존 사용 중, strict 강화 |
| Routing | React Router | 6.x | 기존 사용 중, 중첩 라우팅 지원 |
| 서버 상태 관리 | TanStack Query (React Query) | 5.x | 캐싱, 자동 refetch, mutation 관리 |
| 스타일링 | Tailwind CSS | 3.x | 유틸리티 퍼스트, 다크 모드 네이티브 |
| UI 컴포넌트 | Radix UI | latest | headless, 접근성 우수 |
| 폼 관리 | React Hook Form | 7.x | 성능 우수, 비제어 컴포넌트 |
| 검증 | Zod | 3.x | TypeScript 네이티브, RHF 통합 |
| 차트 | Recharts | 2.x | React 네이티브, 가벼움 |

## 신규 의존성 (추가 필요)

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5",
    "@radix-ui/react-alert-dialog": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-toast": "latest",
    "@radix-ui/react-tooltip": "latest",
    "@hookform/resolvers": "^3",
    "react-hook-form": "^7",
    "zod": "^3",
    "recharts": "^2",
    "tailwindcss": "^3",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "autoprefixer": "latest",
    "postcss": "latest",
    "rollup-plugin-visualizer": "latest"
  }
}
```

## 제거 대상 (기존 의존성)
- 인라인 스타일 전체 제거 → Tailwind 클래스로 대체
- 직접 `fetch` 호출 → React Query hooks로 대체

## 번들 스플리팅 전략

| Chunk | 포함 내용 |
|---|---|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-query` | @tanstack/react-query |
| `vendor-ui` | @radix-ui/* |
| `vendor-charts` | recharts (admin 라우트에서만 로드) |
| `pages-admin` | admin/* 페이지 (lazy load) |
| `pages-staff` | staff/* 페이지 (lazy load) |
| `pages-customer` | customer/* 페이지 (lazy load) |
| `pages-auth` | auth/* 페이지 (lazy load) |
