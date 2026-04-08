import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-gradient-to-r from-brand-500 to-purple-600 text-white px-4 lg:px-8 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-4 lg:gap-8">
        <Link to="/" className="text-xl lg:text-2xl font-bold tracking-tight">✨ Inventrix</Link>
        <Link to="/" className="text-sm opacity-90 hover:opacity-100 hidden sm:inline">Store</Link>
        {user && user.role === 'customer' && <Link to="/orders" className="text-sm opacity-90 hover:opacity-100 hidden sm:inline">My Orders</Link>}
        {user?.role === 'admin' && <Link to="/admin" className="text-sm opacity-90 hover:opacity-100 hidden sm:inline">Admin</Link>}
        {user?.role === 'staff' && <Link to="/staff/orders" className="text-sm opacity-90 hover:opacity-100 hidden sm:inline">Staff</Link>}
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <ThemeToggle />
        {user && <NotificationBell />}
        {user ? (
          <>
            <span className="hidden sm:inline bg-white/20 px-3 py-1 rounded-full text-sm">👤 {user.name}</span>
            <button data-testid="logout-button" onClick={() => { logout(); navigate('/login') }}
              className="bg-white text-brand-500 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-100">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm px-4 py-1.5 bg-white/20 rounded-full hover:bg-white/30">Login</Link>
            <Link to="/register" className="text-sm px-4 py-1.5 bg-white text-brand-500 rounded-full font-semibold hover:bg-gray-100">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
