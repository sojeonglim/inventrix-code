# Frontend Performance Test Instructions

## 성능 요구사항 (NFR-FE-01)
| 항목 | 목표 |
|---|---|
| LCP | < 3초 |
| FID | < 100ms |
| CLS | < 0.1 |
| 대시보드 초기 로드 | < 3초 |

## 번들 사이즈 검증

### 1. 빌드 후 번들 분석
```bash
cd packages/frontend
pnpm build
# dist/assets/ 디렉토리에서 chunk 사이즈 확인
ls -lh dist/assets/*.js
```

### 2. 기대 chunk 구조
| Chunk | 기대 사이즈 |
|---|---|
| vendor-react | < 150KB (gzip) |
| vendor-query | < 50KB (gzip) |
| vendor-charts | < 100KB (gzip, lazy) |
| main | < 50KB (gzip) |
| 페이지별 chunk | < 20KB each (gzip) |

### 3. 번들 시각화 (선택)
```bash
# vite.config.ts에 visualizer 플러그인 추가 후
pnpm build
# stats.html 파일 생성됨
```

## Lighthouse 성능 측정

### 1. Chrome DevTools
1. `pnpm preview`로 프로덕션 빌드 서빙
2. Chrome DevTools → Lighthouse 탭
3. Performance 카테고리 실행
4. LCP, FID, CLS 확인

### 2. 기대 점수
- Performance: > 80
- Accessibility: > 80 (Radix UI 기본 접근성)

## 코드 스플리팅 검증
- Admin 페이지 접근 전: vendor-charts chunk 미로드
- Admin Dashboard 접근 시: vendor-charts chunk 로드 확인
- Network 탭에서 lazy chunk 로드 타이밍 확인
