import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/constants'

interface SidebarItem { to: string; label: string; icon: string }

export function Sidebar({ items }: { items: SidebarItem[] }) {
  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-64px)] hidden lg:block">
      <nav className="p-4 flex flex-col gap-1">
        {items.map(item => (
          <NavLink key={item.to} to={item.to} end
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
