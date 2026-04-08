import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ToastContainer } from '@/components/common/ToastContainer'
import { RouteGuard } from '@/components/common/RouteGuard'
import { CustomerLayout } from '@/components/layouts/CustomerLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { StaffLayout } from '@/components/layouts/StaffLayout'
import { Skeleton } from '@/components/common/Skeleton'
import { useSSE } from '@/hooks/use-sse'

// Lazy-loaded pages
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

const PageLoader = () => <div className="p-8"><Skeleton className="h-64 rounded-xl" /></div>

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function SSEConnector({ children }: { children: React.ReactNode }) {
  useSSE()
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <BrowserRouter>
                <SSEConnector>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Auth */}
                      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
                      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

                      {/* Customer */}
                      <Route element={<CustomerLayout />}>
                        <Route index element={<StorefrontPage />} />
                        <Route path="products/:id" element={<ProductDetailPage />} />
                        <Route element={<RouteGuard />}>
                          <Route path="orders" element={<OrdersPage />} />
                        </Route>
                      </Route>

                      {/* Admin */}
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

                      {/* Staff */}
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
              </BrowserRouter>
              <ToastContainer />
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
