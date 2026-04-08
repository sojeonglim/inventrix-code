# Frontend Unit Test Instructions

## 테스트 프레임워크 설정 (필요 시)

현재 프로젝트에 테스트 프레임워크가 설정되어 있지 않습니다. 추가 시:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

`vite.config.ts`에 추가:
```typescript
/// <reference types="vitest" />
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

## 테스트 대상 및 우선순위

### P0: 핵심 비즈니스 로직
| 대상 | 테스트 내용 |
|---|---|
| `lib/api-client.ts` | 401 refresh mutex, 에러 파싱, 토큰 첨부 |
| `lib/validators.ts` | Zod 스키마 검증 (비밀번호 정책, 상품 검증 등) |
| `components/orders/OrderActions.tsx` | 역할별 허용 버튼 렌더링 (TRANSITIONS 매핑) |
| `components/common/RouteGuard.tsx` | 인증/역할 리다이렉트 |

### P1: UI 컴포넌트
| 대상 | 테스트 내용 |
|---|---|
| `components/products/ProductCard.tsx` | 재고 상태별 라벨/색상 |
| `components/orders/OrderStatusBadge.tsx` | 상태별 배지 렌더링 |
| `contexts/ThemeContext.tsx` | 다크 모드 토글, localStorage 저장 |
| `contexts/ToastContext.tsx` | 토스트 추가/제거, 최대 3개 제한 |

### P2: 페이지 통합
| 대상 | 테스트 내용 |
|---|---|
| `pages/auth/LoginPage.tsx` | 폼 검증, 로그인 성공/실패 |
| `pages/customer/StorefrontPage.tsx` | 무한 스크롤 로드 |

## 실행
```bash
cd packages/frontend
pnpm test           # 전체 테스트
pnpm test --watch   # 워치 모드
pnpm test --coverage # 커버리지
```

## 기대 결과
- 모든 Zod 스키마 검증 통과
- 역할별 OrderActions 버튼 정확히 렌더링
- RouteGuard 리다이렉트 정상 동작
- 다크 모드 토글 + localStorage 동기화
