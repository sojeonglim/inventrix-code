import { useDashboard } from '@/hooks/use-analytics'
import { KPICard } from '@/components/analytics/KPICard'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Skeleton } from '@/components/common/Skeleton'
import {
  DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react'

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="80px" />)}</div>
  if (!data) return null

  const headers = [
    { key: 'id', header: 'ID' },
    { key: 'total', header: 'Total' },
    { key: 'status', header: 'Status' },
  ]
  const rows = data.recentOrders.map(o => ({ id: o.id, total: `$${o.total.toFixed(2)}`, status: o.status }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KPICard title="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`} icon="💰" />
        <KPICard title="Total Orders" value={data.totalOrders} icon="🛒" />
        <KPICard title="Total Products" value={data.totalProducts} icon="📦" />
        <KPICard title="Low Stock" value={data.lowStockCount} icon="⚠️" />
      </div>
      {data.topProducts.length > 0 && <RevenueChart data={data.topProducts.map(p => ({ date: p.productName, revenue: p.revenue }))} />}
      <DataTable rows={rows} headers={headers} data-testid="dashboard-recent-orders">
        {({ rows: r, headers: h, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead><TableRow>{h.map(header => <TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>)}</TableRow></TableHead>
            <TableBody>
              {r.map(row => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map(cell => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'status' ? <OrderStatusBadge status={cell.value} /> : cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  )
}
