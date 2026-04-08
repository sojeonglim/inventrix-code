# Frontend Build Instructions

## Prerequisites
- **Node.js**: 18.x+
- **pnpm**: 8.x+ (monorepo 패키지 매니저)
- **OS**: macOS / Linux / Windows

## Build Steps

### 1. Install Dependencies
```bash
cd packages/frontend
pnpm install
```

### 2. Configure Environment
Backend API 서버가 `http://localhost:3000`에서 실행 중이어야 합니다 (Vite proxy 설정).

```bash
# Backend 서버 시작 (별도 터미널)
cd packages/api
pnpm dev
```

### 3. Development Server
```bash
cd packages/frontend
pnpm dev
```
- Vite dev server: `http://localhost:5173`
- API proxy: `/api/*` → `http://localhost:3000`

### 4. Production Build
```bash
cd packages/frontend
pnpm build
```

### 5. Verify Build Success
- **Expected Output**: `dist/` 디렉토리에 빌드 결과물 생성
- **Build Artifacts**:
  - `dist/index.html`
  - `dist/assets/*.js` (vendor-react, vendor-query, vendor-charts 등 chunk 분리)
  - `dist/assets/*.css` (Tailwind CSS)
- **번들 분석**: `npx rollup-plugin-visualizer` (선택)

### 6. Preview Production Build
```bash
pnpm preview
```

## Troubleshooting

### Tailwind CSS 미적용
- `tailwind.config.js`의 `content` 경로 확인
- `postcss.config.js` 존재 확인
- `src/index.css`에 `@tailwind` directives 확인

### Path Alias (@/) 에러
- `tsconfig.json`에 `paths` 설정 확인
- `vite.config.ts`에 `resolve.alias` 설정 확인

### 의존성 설치 실패
```bash
pnpm install --force
```
