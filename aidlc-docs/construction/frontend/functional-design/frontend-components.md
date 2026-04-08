# Frontend Components

> 컴포넌트 계층, Props/State, 사용자 인터랙션, API 연동 포인트

---

## 1. 컴포넌트 계층 구조

```
src/
├── App.tsx                          — QueryClientProvider + RouterProvider
├── main.tsx                         — ReactDOM.createRoot
├── lib/
│   ├── api-client.ts                — fetch wrapper
│   ├── query-client.ts              — React Query 설정
│   └── validators.ts                — Zod 스키마
├── hooks/
│   ├── use-auth.ts                  — 인증 mutations
│   ├── use-products.ts              — 상품 queries/mutations
│   ├── use-orders.ts                — 주문 queries/mutations
│   ├── use-inventory.ts             — 재고 queries/mutations
│   ├── use-users.ts                 — 사용자 queries/mutations
│   ├── use-analytics.ts             — 분석 queries
│   ├── use-notifications.ts         — 알림 queries/mutations
│   ├── use-refunds.ts               — 환불 queries/mutations
│   ├── use-sse.ts                   — SSE 연결 관리
│   ├── use-theme.ts                 — 다크 모드
│   └── use-toast.ts                 — 토스트 관리
├── contexts/
│   ├── AuthContext.tsx               — 인증 상태
│   ├── ThemeContext.tsx              — 테마 상태
│   └── ToastContext.tsx              — 토스트 상태
├── components/
│   ├── layouts/
│   │   ├── PublicLayout.tsx          — 비인증 페이지 레이아웃
│   │   ├── CustomerLayout.tsx        — 고객 레이아웃 (헤더 + 알림)
│   │   ├── AdminLayout.tsx           — 관리자 레이아웃 (사이드바)
│   │   └── StaffLayout.tsx           — 직원 레이아웃
│   ├── common/
│   │   ├── Header.tsx                — 공통 헤더 (역할별 메뉴)
│   │   ├── Sidebar.tsx               — Admin/Staff 사이드바
│   │   ├── NotificationBell.tsx      — 알림 벨 + 드롭다운
│   │   ├── ThemeToggle.tsx           — 다크 모드 토글
│   │   ├── ToastContainer.tsx        — 토스트 스택
│   │   ├── Pagination.tsx            — 페이지네이션 컴포넌트
│   │   ├── Skeleton.tsx              — 스켈레톤 로딩
│   │   ├── ErrorBoundary.tsx         — 전역 에러 바운더리
│   │   ├── ErrorPage.tsx             — 에러 페이지
│   │   ├── ConfirmDialog.tsx         — 확인 다이얼로그 (Radix AlertDialog)
│   │   └── RouteGuard.tsx            — 인증/역할 가드
│   ├── products/
│   │   ├── ProductCard.tsx           — 상품 카드 (Storefront)
│   │   ├── ProductForm.tsx           — 상품 생성/수정 폼
│   │   └── ProductTable.tsx          — 상품 관리 테이블 (Admin)
│   ├── orders/
│   │   ├── OrderCard.tsx             — 주문 카드 (고객)
│   │   ├── OrderTable.tsx            — 주문 관리 테이블 (Admin/Staff)
│   │   ├── OrderDetail.tsx           — 주문 상세
│   │   ├── OrderStatusBadge.tsx      — 상태 배지
│   │   └── OrderActions.tsx          — 역할별 액션 버튼
│   ├── inventory/
│   │   ├── InventoryTable.tsx        — 재고 테이블
│   │   └── StockEditDialog.tsx       — 재고 수정 다이얼로그
│   ├── users/
│   │   ├── UserTable.tsx             — 사용자 목록 테이블
│   │   └── RoleSelect.tsx            — 역할 변경 셀렉트
│   ├── analytics/
│   │   ├── KPICard.tsx               — KPI 카드
│   │   ├── RevenueChart.tsx          — 매출 차트 (Recharts)
│   │   ├── OrderChart.tsx            — 주문 차트
│   │   └── TopProductsList.tsx       — 인기 상품 목록
│   ├── refunds/
│   │   └── RefundTable.tsx           — 환불 관리 테이블
│   └── notifications/
│       ├── NotificationList.tsx      — 알림 목록
│       └── NotificationItem.tsx      — 알림 항목
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── customer/
│   │   ├── StorefrontPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   └── OrdersPage.tsx
│   ├── admin/
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── RefundsPage.tsx
│   │   └── AnalyticsPage.tsx
│   └── staff/
│       ├── OrdersPage.tsx
│       └── InventoryPage.tsx
```

---

## 2. 주요 컴포넌트 Props/State

### Header

```typescript
// Props: 없음 (context에서 user, theme 읽음)
// State: mobileMenuOpen (모바일 햄버거 메뉴)
// API: useUnreadCount → 알림 벨 badge
```

### NotificationBell

```typescript
// Props: 없음
// State: isOpen (드롭다운 열림)
// API: useUnreadCount, useNotifications, useMarkAsRead
// SSE: notification 이벤트 → cache invalidate
```

### ProductCard

```typescript
interface ProductCardProps {
  product: Product
}
// 표시: 이미지, 이름, 설명, 가격, 가용 재고 상태
// 인터랙션: 클릭 → /products/:id 이동
```

### ProductForm

```typescript
interface ProductFormProps {
  product?: Product          // 수정 시 기존 데이터
  onSuccess: () => void
}
// State: React Hook Form + Zod validation
// API: useCreateProduct 또는 useUpdateProduct, useGenerateImage
```

### OrderTable

```typescript
interface OrderTableProps {
  role: Role
}
// State: page, pageSize, statusFilter
// API: useOrders (역할별 필터)
// 하위: OrderStatusBadge, OrderActions
```

### OrderActions

```typescript
interface OrderActionsProps {
  order: Order
  role: Role
}
// 표시: 역할+상태에 따른 허용 버튼만 렌더링
// API: useUpdateOrderStatus, useCancelOrder
// 인터랙션: 취소 시 ConfirmDialog
```

### InventoryTable

```typescript
interface InventoryTableProps {
  showLowStockOnly?: boolean
}
// State: page, pageSize, lowStockFilter
// API: useInventory
// 하위: StockEditDialog
// 표시: stock, availableStock, reservedStock 3컬럼
```

### KPICard

```typescript
interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}
```

### RevenueChart

```typescript
interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>
}
// Recharts AreaChart 사용
```

---

## 3. 페이지별 API 연동 포인트

| 페이지 | API Hooks | SSE 이벤트 |
|---|---|---|
| StorefrontPage | `useProducts` (infinite) | — |
| ProductDetailPage | `useProduct`, `useCreateOrder` | — |
| OrdersPage (고객) | `useOrders` | `order_status_changed` |
| DashboardPage | `useDashboard` | `dashboard_update` |
| ProductsPage (관리) | `useProducts`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useGenerateImage` | — |
| OrdersPage (관리) | `useOrders`, `useUpdateOrderStatus`, `useCancelOrder` | — |
| InventoryPage | `useInventory`, `useUpdateStock` | `stock_alert` |
| UsersPage | `useUsers`, `useUpdateUserRole` | — |
| RefundsPage | `useRefunds`, `useUpdateRefund` | — |
| AnalyticsPage | `useRevenue`, `useOrderStats`, `useInventoryStats` | — |

---

## 4. 사용자 인터랙션 흐름

### 고객 주문 흐름
1. StorefrontPage → 상품 카드 클릭
2. ProductDetailPage → 수량 선택 → "주문하기" 클릭
3. `useCreateOrder` mutation → 성공 시 토스트 + OrdersPage 이동
4. 재고 부족 시 409 에러 → "재고가 부족합니다" 토스트

### 관리자 주문 상태 변경 흐름
1. Admin OrdersPage → 주문 행의 액션 버튼 클릭
2. 상태 변경: `useUpdateOrderStatus` → 성공 시 테이블 갱신
3. 취소: ConfirmDialog → 확인 → `useCancelOrder` → 성공 시 테이블 갱신

### 관리자 역할 변경 흐름
1. UsersPage → 사용자 행의 역할 드롭다운 변경
2. ConfirmDialog → 확인 → `useUpdateUserRole` → 성공 시 토스트

### 실시간 대시보드 흐름
1. DashboardPage 진입 → `useDashboard` 초기 로드
2. SSE `dashboard_update` 이벤트 수신 → query cache 직접 업데이트
3. KPI 카드 + 차트 자동 갱신 (리렌더링)
