import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Theme, Loading } from '@carbon/react'
import { queryClient } from '@/lib/query-client'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ToastContainer } from '@/components/common/ToastContainer'
import { RouteGuard } from '@/components/common/RouteGuard'
import { Header } from '@/components/common/Header'
import { CustomerLayout } from '@/components/layouts/CustomerLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { StaffLayout } from '@/components/layouts/StaffLayout'
import { useSSE } from '@/hooks/use-sse'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const StorefrontPage = lazy(() => import('@/pages/customer/StorefrontPage'))
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'))
const OrdersPage = lazy(() => import('@/pages/customer/OrdersPage'))
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/OrdersPage'))
const InventoryPage = lazy(() => import('@/pages/admin/InventoryPage'))
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const RefundsPage = lazy(() => import('@/pages/admin/RefundsPage'))
const AnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage'))
const StaffOrdersPage = lazy(() => import('@/pages/staff/OrdersPage'))
const StaffInventoryPage = lazy(() => import('@/pages/staff/InventoryPage'))

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : <>{children}</>
}

function SSEConnector({ children }: { children: React.ReactNode }) {
  useSSE()
  return <>{children}</>
}

function ThemedApp() {
  const { theme } = useTheme()
  return (
    <Theme theme={theme}>
      <Header />
      <SSEConnector>
        <Suspense fallback={<Loading withOverlay />}>
          <Routes>
            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
            <Route element={<CustomerLayout />}>
              <Route index element={<StorefrontPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route element={<RouteGuard />}><Route path="orders" element={<OrdersPage />} /></Route>
            </Route>
            <Route element={<RouteGuard allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="admin" element={<DashboardPage />} />
                <Route path="admin/products" element={<ProductsPage />} />
                <Route path="admin/orders" element={<AdminOrdersPage />} />
                <Route path="admin/inventory" element={<InventoryPage />} />
                <Route path="admin/users" element={<UsersPage />} />
                <Route path="admin/refunds" element={<RefundsPage />} />
                <Route path="admin/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>
            <Route element={<RouteGuard allowedRoles={['staff']} />}>
              <Route element={<StaffLayout />}>
                <Route path="staff/orders" element={<StaffOrdersPage />} />
                <Route path="staff/inventory" element={<StaffInventoryPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </SSEConnector>
      <ToastContainer />
    </Theme>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <BrowserRouter>
                <ThemedApp />
              </BrowserRouter>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
