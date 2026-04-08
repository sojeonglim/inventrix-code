import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/types'

interface Props { requireAuth?: boolean; allowedRoles?: Role[]; redirectTo?: string }

export function RouteGuard({ requireAuth = true, allowedRoles, redirectTo }: Props) {
  const { user } = useAuth()

  if (requireAuth && !user) return <Navigate to={redirectTo ?? '/login'} replace />
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />

  return <Outlet />
}
