import { useDashboard } from '@/hooks/use-analytics'
import { KPICard } from '@/components/analytics/KPICard'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Skeleton } from '@/components/common/Skeleton'

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`} icon="💰" color="text-green-600" />
        <KPICard title="Total Orders" value={data.totalOrders} icon="🛒" color="text-blue-600" />
        <KPICard title="Total Products" value={data.totalProducts} icon="📦" color="text-indigo-600" />
        <KPICard title="Low Stock" value={data.lowStockCount} icon="⚠️" color="text-red-600" />
      </div>
      {data.topProducts.length > 0 && (
        <RevenueChart data={data.topProducts.map(p => ({ date: p.productName, revenue: p.revenue }))} />
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="dashboard-recent-orders">
            <thead><tr className="border-b dark:border-gray-700 text-left text-gray-500">
              <th className="pb-2">ID</th><th className="pb-2">Total</th><th className="pb-2">Status</th>
            </tr></thead>
            <tbody>
              {data.recentOrders.map(o => (
                <tr key={o.id} className="border-b dark:border-gray-700">
                  <td className="py-2 text-gray-900 dark:text-white">#{o.id}</td>
                  <td className="py-2">${o.total.toFixed(2)}</td>
                  <td className="py-2"><OrderStatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
