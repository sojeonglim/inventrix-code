import {
  Header as CarbonHeader, HeaderName, HeaderNavigation, HeaderMenuItem,
  HeaderGlobalBar, HeaderGlobalAction, HeaderMenuButton,
  SideNav, SideNavItems, SideNavLink, SkipToContent,
} from '@carbon/react'
import { UserAvatar, Asleep, Light } from '@carbon/icons-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const isDark = theme === 'g90' || theme === 'g100'

  return (
    <>
      <CarbonHeader aria-label="Inventrix">
        <SkipToContent />
        <HeaderMenuButton aria-label="Menu" onClick={() => setSideNavOpen(!sideNavOpen)} isActive={sideNavOpen} isCollapsible />
        <HeaderName as={Link} to="/" prefix="✨">Inventrix</HeaderName>
        <HeaderNavigation aria-label="Navigation">
          <HeaderMenuItem as={Link} to="/" isCurrentPage={location.pathname === '/'}>Store</HeaderMenuItem>
          {user && user.role === 'customer' && <HeaderMenuItem as={Link} to="/orders">My Orders</HeaderMenuItem>}
          {user?.role === 'admin' && <HeaderMenuItem as={Link} to="/admin">Admin</HeaderMenuItem>}
          {user?.role === 'staff' && <HeaderMenuItem as={Link} to="/staff/orders">Staff</HeaderMenuItem>}
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Toggle theme" onClick={toggleTheme} tooltipAlignment="end">
            {isDark ? <Light size={20} /> : <Asleep size={20} />}
          </HeaderGlobalAction>
          {user && <NotificationBell />}
          {user ? (
            <HeaderGlobalAction aria-label="Logout" onClick={logout} tooltipAlignment="end">
              <UserAvatar size={20} />
            </HeaderGlobalAction>
          ) : (
            <HeaderMenuItem as={Link} to="/login">Login</HeaderMenuItem>
          )}
        </HeaderGlobalBar>
        <SideNav expanded={sideNavOpen} isPersistent={false} aria-label="Side navigation">
          <SideNavItems>
            {user?.role === 'admin' && (
              <>
                <SideNavLink as={Link} to="/admin" isActive={location.pathname === '/admin'}>Dashboard</SideNavLink>
                <SideNavLink as={Link} to="/admin/products">Products</SideNavLink>
                <SideNavLink as={Link} to="/admin/orders">Orders</SideNavLink>
                <SideNavLink as={Link} to="/admin/inventory">Inventory</SideNavLink>
                <SideNavLink as={Link} to="/admin/users">Users</SideNavLink>
                <SideNavLink as={Link} to="/admin/refunds">Refunds</SideNavLink>
                <SideNavLink as={Link} to="/admin/analytics">Analytics</SideNavLink>
              </>
            )}
            {user?.role === 'staff' && (
              <>
                <SideNavLink as={Link} to="/staff/orders">Orders</SideNavLink>
                <SideNavLink as={Link} to="/staff/inventory">Inventory</SideNavLink>
              </>
            )}
          </SideNavItems>
        </SideNav>
      </CarbonHeader>
    </>
  )
}
