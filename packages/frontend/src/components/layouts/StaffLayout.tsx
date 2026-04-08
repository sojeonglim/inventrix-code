import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'

const staffMenu = [
  { to: '/staff/orders', label: 'Orders', icon: '🛒' },
  { to: '/staff/inventory', label: 'Inventory', icon: '📋' },
]

export function StaffLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar items={staffMenu} />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
