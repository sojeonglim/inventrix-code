import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
