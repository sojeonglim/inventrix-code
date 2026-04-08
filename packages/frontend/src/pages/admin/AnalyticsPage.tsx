import { Tile } from '@carbon/react'
import { useRevenue, useOrderStats, useInventoryStats } from '@/hooks/use-analytics'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { Skeleton } from '@/components/common/Skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const { data: revenue, isLoading: rl } = useRevenue()
  const { data: orders, isLoading: ol } = useOrderStats()
  const { data: inventory, isLoading: il } = useInventoryStats()

  if (rl || ol || il) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height="260px" />)}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1>Analytics</h1>
      {revenue && <RevenueChart data={revenue.byPeriod} />}
      {orders && (
        <Tile>
          <h3 style={{ marginBottom: 16 }}>주문 추이</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={orders.byPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f62fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Tile>
      )}
      {inventory && (
        <Tile>
          <h3 style={{ marginBottom: 16 }}>재고 현황</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
            <div><p style={{ fontSize: 28, fontWeight: 600 }}>{inventory.totalProducts}</p><p style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>전체</p></div>
            <div><p style={{ fontSize: 28, fontWeight: 600, color: '#f1c21b' }}>{inventory.lowStockProducts}</p><p style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>부족</p></div>
            <div><p style={{ fontSize: 28, fontWeight: 600, color: '#da1e28' }}>{inventory.outOfStockProducts}</p><p style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>품절</p></div>
          </div>
        </Tile>
      )}
    </div>
  )
}
