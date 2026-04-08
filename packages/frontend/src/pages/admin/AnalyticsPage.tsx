import { useRevenue, useOrderStats, useInventoryStats } from '@/hooks/use-analytics'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { Skeleton } from '@/components/common/Skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const { data: revenue, isLoading: rl } = useRevenue()
  const { data: orders, isLoading: ol } = useOrderStats()
  const { data: inventory, isLoading: il } = useInventoryStats()

  if (rl || ol || il) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      {revenue && <RevenueChart data={revenue.byPeriod} />}
      {orders && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">주문 추이</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={orders.byPeriod}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#667eea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {inventory && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">재고 현황</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{inventory.totalProducts}</p><p className="text-sm text-gray-500">전체</p></div>
            <div><p className="text-2xl font-bold text-amber-600">{inventory.lowStockProducts}</p><p className="text-sm text-gray-500">부족</p></div>
            <div><p className="text-2xl font-bold text-red-600">{inventory.outOfStockProducts}</p><p className="text-sm text-gray-500">품절</p></div>
          </div>
        </div>
      )}
    </div>
  )
}
