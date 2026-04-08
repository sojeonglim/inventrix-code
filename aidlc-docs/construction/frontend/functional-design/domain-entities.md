# Frontend Domain Entities

> cross-unit-contracts.md 기반 타입 정의 + 클라이언트 전용 타입

---

## 1. API 응답 타입 (cross-unit-contracts 기반)

### Shared Enums

```typescript
type Role = 'admin' | 'staff' | 'customer'
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
type RefundStatus = 'pending_refund' | 'refunded'
type ReservationStatus = 'active' | 'confirmed' | 'expired' | 'released'
type NotificationType =
  | 'order_created' | 'order_status_changed' | 'order_cancelled'
  | 'stock_low' | 'stock_depleted' | 'role_changed' | 'security_alert'
```

### Core Models

```typescript
interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  availableStock: number
  imageUrl: string | null
  createdAt: string
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  gst: number
  total: number
  status: OrderStatus
  createdAt: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Refund {
  id: string
  orderId: string
  amount: number
  status: RefundStatus
  processedBy: string | null
  processedAt: string | null
  createdAt: string
}

interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  read: boolean
  createdAt: string
}

interface StockInfo {
  productId: string
  productName: string
  stock: number
  availableStock: number
  reservedStock: number
}
```

### Pagination & Error

```typescript
interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
```

### Analytics

```typescript
interface DashboardKPIs {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  lowStockCount: number
  recentOrders: Order[]
  topProducts: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>
  ordersByStatus: Record<OrderStatus, number>
}

interface RevenueStats {
  total: number
  byPeriod: Array<{ date: string; revenue: number }>
}

interface OrderStats {
  total: number
  byStatus: Record<OrderStatus, number>
  byPeriod: Array<{ date: string; count: number }>
}

interface InventoryStats {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  items: StockInfo[]
}
```

### Auth

```typescript
interface AuthResult {
  token: string
  user: User
}

interface RegisterInput {
  email: string
  password: string
  name: string
}

interface LoginInput {
  email: string
  password: string
}
```

---

## 2. 클라이언트 전용 타입

### Theme

```typescript
type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  resolved: 'light' | 'dark'  // system 해석 후 실제 적용값
}
```

### Toast / Notification UI

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number  // ms, 기본 5000
}
```

### SSE

```typescript
interface SSEEvent {
  type: string
  payload: unknown
  timestamp: string
}

type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
```

### Form Input Types

```typescript
interface CreateProductForm {
  name: string
  description: string
  price: string       // 폼에서는 string, 제출 시 number 변환
  stock: string
  imageUrl: string
}

interface CreateOrderForm {
  items: Array<{ productId: string; quantity: number }>
}

interface UpdateStockForm {
  stock: string
}
```

### Route Guard

```typescript
interface RouteConfig {
  path: string
  requireAuth: boolean
  allowedRoles?: Role[]
}
```
