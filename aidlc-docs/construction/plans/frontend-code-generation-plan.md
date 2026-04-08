# Frontend Code Generation Plan

## Unit Context
- **Unit**: Frontend (`packages/frontend`)
- **프로젝트 유형**: Brownfield (기존 코드 수정 + 신규 파일 생성)
- **기존 파일**: App.tsx, main.tsx, Layout.tsx, AuthContext.tsx, 9개 페이지
- **코드 위치**: `packages/frontend/src/` (절대 aidlc-docs/ 아님)

## 기술 스택
- React 18 + TypeScript 5 (strict) + Vite 5
- React Query 5 + Tailwind CSS 3 + Radix UI + React Hook Form + Zod + Recharts

## Story 커버리지
- 주 담당 (6): US-5.3, US-6.1, US-6.2, US-7.1, US-7.2, US-7.3
- 보조 (6): US-3.1, US-3.2, US-3.3, US-4.1, US-5.1, US-6.1

## 기존 파일 → 변경 계획
| 기존 파일 | 처리 |
|---|---|
| `src/App.tsx` | 수정 — 중첩 라우팅 + lazy loading |
| `src/main.tsx` | 수정 — Provider 래핑 |
| `src/index.css` | 삭제 → Tailwind 대체 |
| `src/context/AuthContext.tsx` | 수정 — React Query 기반 리팩토링 |
| `src/components/Layout.tsx` | 삭제 → 역할별 Layout 분리 |
| `src/pages/*.tsx` (9개) | 삭제 → 새 구조로 재작성 |

---

## Generation Steps

### Step 1: 프로젝트 설정 및 의존성
- [x] `package.json` 업데이트 (신규 의존성 추가)
- [x] `tailwind.config.js` 생성 (다크 모드 class 전략)
- [x] `postcss.config.js` 생성
- [x] `src/index.css` → Tailwind directives로 교체
- [x] `vite.config.ts` 업데이트 (번들 스플리팅 설정)
- [x] `tsconfig.json` path alias 추가 (`@/`)

### Step 2: 공유 타입 및 유틸리티
- [x] `src/types/index.ts` — 공유 타입 (cross-unit-contracts 기반)
- [x] `src/lib/api-client.ts` — fetch wrapper (토큰 자동 첨부, refresh, 에러 핸들링)
- [x] `src/lib/query-client.ts` — React Query 설정
- [x] `src/lib/validators.ts` — Zod 스키마
- [x] `src/lib/constants.ts` — 상수 (상태 색상, 라우트 등)

### Step 3: Context Providers
- [x] `src/contexts/AuthContext.tsx` — 리팩토링 (React Query 기반)
- [x] `src/contexts/ThemeContext.tsx` — 다크 모드 (Tailwind class 전략)
- [x] `src/contexts/ToastContext.tsx` — 토스트 상태 관리

### Step 4: React Query Hooks
- [x] `src/hooks/use-auth.ts` — 인증 mutations
- [x] `src/hooks/use-products.ts` — 상품 queries/mutations
- [x] `src/hooks/use-orders.ts` — 주문 queries/mutations
- [x] `src/hooks/use-inventory.ts` — 재고 queries/mutations
- [x] `src/hooks/use-users.ts` — 사용자 queries/mutations
- [x] `src/hooks/use-analytics.ts` — 분석 queries
- [x] `src/hooks/use-notifications.ts` — 알림 queries/mutations
- [x] `src/hooks/use-refunds.ts` — 환불 queries/mutations
- [x] `src/hooks/use-sse.ts` — SSE 연결 관리
- [x] `src/hooks/use-theme.ts` — 다크 모드 hook
- [x] `src/hooks/use-toast.ts` — 토스트 hook

### Step 5: 공통 컴포넌트
- [x] `src/components/common/Header.tsx` — 역할별 메뉴
- [x] `src/components/common/Sidebar.tsx` — Admin/Staff 사이드바
- [x] `src/components/common/NotificationBell.tsx` — 알림 벨 + 드롭다운
- [x] `src/components/common/ThemeToggle.tsx` — 다크 모드 토글
- [x] `src/components/common/ToastContainer.tsx` — Radix Toast
- [x] `src/components/common/Pagination.tsx` — 페이지네이션
- [x] `src/components/common/Skeleton.tsx` — 스켈레톤 로딩
- [x] `src/components/common/ErrorBoundary.tsx` — 에러 바운더리
- [x] `src/components/common/ErrorPage.tsx` — 에러 페이지
- [x] `src/components/common/ConfirmDialog.tsx` — Radix AlertDialog
- [x] `src/components/common/RouteGuard.tsx` — 인증/역할 가드

### Step 6: 레이아웃 컴포넌트
- [x] `src/components/layouts/PublicLayout.tsx`
- [x] `src/components/layouts/CustomerLayout.tsx`
- [x] `src/components/layouts/AdminLayout.tsx`
- [x] `src/components/layouts/StaffLayout.tsx`

### Step 7: Feature 컴포넌트 — Products
- [x] `src/components/products/ProductCard.tsx` — 상품 카드 (US-7.1, US-4.1)
- [x] `src/components/products/ProductForm.tsx` — 상품 폼 (Admin)
- [x] `src/components/products/ProductTable.tsx` — 상품 테이블 (Admin)

### Step 8: Feature 컴포넌트 — Orders
- [x] `src/components/orders/OrderCard.tsx` — 주문 카드 (US-3.1, US-3.2)
- [x] `src/components/orders/OrderTable.tsx` — 주문 테이블 (Admin/Staff)
- [x] `src/components/orders/OrderStatusBadge.tsx` — 상태 배지
- [x] `src/components/orders/OrderActions.tsx` — 역할별 액션 (US-3.1)

### Step 9: Feature 컴포넌트 — Inventory, Users, Analytics, Refunds, Notifications
- [x] `src/components/inventory/InventoryTable.tsx` — 재고 테이블 (US-4.1)
- [x] `src/components/inventory/StockEditDialog.tsx` — 재고 수정
- [x] `src/components/users/UserTable.tsx` — 사용자 테이블 (US-5.1, US-5.3)
- [x] `src/components/users/RoleSelect.tsx` — 역할 변경
- [x] `src/components/analytics/KPICard.tsx` — KPI 카드
- [x] `src/components/analytics/RevenueChart.tsx` — 매출 차트 (Recharts)
- [x] `src/components/analytics/OrderChart.tsx` — 주문 차트
- [x] `src/components/analytics/TopProductsList.tsx` — 인기 상품
- [x] `src/components/refunds/RefundTable.tsx` — 환불 테이블 (US-3.3)
- [x] `src/components/notifications/NotificationList.tsx` — 알림 목록 (US-6.2)
- [x] `src/components/notifications/NotificationItem.tsx` — 알림 항목

### Step 10: 페이지 컴포넌트
- [x] `src/pages/auth/LoginPage.tsx`
- [x] `src/pages/auth/RegisterPage.tsx`
- [x] `src/pages/customer/StorefrontPage.tsx` (US-7.1)
- [x] `src/pages/customer/ProductDetailPage.tsx`
- [x] `src/pages/customer/OrdersPage.tsx` (US-3.2)
- [x] `src/pages/admin/DashboardPage.tsx` (US-6.1)
- [x] `src/pages/admin/ProductsPage.tsx`
- [x] `src/pages/admin/OrdersPage.tsx` (US-3.1)
- [x] `src/pages/admin/InventoryPage.tsx` (US-4.1)
- [x] `src/pages/admin/UsersPage.tsx` (US-5.3)
- [x] `src/pages/admin/RefundsPage.tsx` (US-3.3)
- [x] `src/pages/admin/AnalyticsPage.tsx`
- [x] `src/pages/staff/OrdersPage.tsx`
- [x] `src/pages/staff/InventoryPage.tsx`

### Step 11: App 엔트리포인트
- [x] `src/App.tsx` — 수정 (중첩 라우팅 + lazy loading + Providers)
- [x] `src/main.tsx` — 수정 (QueryClientProvider 래핑)
- [x] 기존 파일 정리 (사용하지 않는 파일 삭제)

### Step 12: Code Summary 문서
- [x] `aidlc-docs/construction/frontend/code/code-summary.md` — 생성/수정 파일 목록, 아키텍처 요약
