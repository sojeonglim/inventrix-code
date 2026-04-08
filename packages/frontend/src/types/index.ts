// Shared types based on cross-unit-contracts.md

export type Role = 'admin' | 'staff' | 'customer'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type RefundStatus = 'pending_refund' | 'refunded'
export type NotificationType =
  | 'order_created' | 'order_status_changed' | 'order_cancelled'
  | 'stock_low' | 'stock_depleted' | 'role_changed' | 'security_alert'

export interface User {
  id: string; email: string; name: string; role: Role; createdAt: string
}

export interface Product {
  id: string; name: string; description: string | null; price: number
  stock: number; availableStock: number; imageUrl: string | null; createdAt: string
}

export interface Order {
  id: string; userId: string; items: OrderItem[]; subtotal: number
  gst: number; total: number; status: OrderStatus; createdAt: string
}

export interface OrderItem {
  id: string; productId: string; productName: string; quantity: number; price: number
}

export interface Refund {
  id: string; orderId: string; amount: number; status: RefundStatus
  processedBy: string | null; processedAt: string | null; createdAt: string
}

export interface Notification {
  id: string; userId: string; type: NotificationType; title: string
  message: string; data: Record<string, unknown> | null; read: boolean; createdAt: string
}

export interface StockInfo {
  productId: string; productName: string; stock: number
  availableStock: number; reservedStock: number
}

export interface PaginatedResult<T> {
  data: T[]; total: number; page: number; pageSize: number; totalPages: number
}

export interface ErrorResponse {
  error: { code: string; message: string; details?: unknown }
}

export interface AuthResult { token: string; user: User }

export interface DashboardKPIs {
  totalRevenue: number; totalOrders: number; totalProducts: number; lowStockCount: number
  recentOrders: Order[]
  topProducts: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>
  ordersByStatus: Record<OrderStatus, number>
}

export interface RevenueStats {
  total: number; byPeriod: Array<{ date: string; revenue: number }>
}

export interface OrderStats {
  total: number; byStatus: Record<OrderStatus, number>
  byPeriod: Array<{ date: string; count: number }>
}

export interface InventoryStats {
  totalProducts: number; lowStockProducts: number; outOfStockProducts: number; items: StockInfo[]
}

// Client-only types
export type ThemeMode = 'light' | 'dark' | 'system'
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string; type: ToastType; title: string; message?: string; duration?: number
}
