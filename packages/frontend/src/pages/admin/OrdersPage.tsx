import { useState } from 'react'
import { useOrders } from '@/hooks/use-orders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderActions } from '@/components/orders/OrderActions'
import { Pagination } from '@/components/common/Pagination'
import type { OrderStatus } from '@/types'

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const { data, isLoading } = useOrders({ status, page, pageSize: 20 })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <select value={status ?? ''} onChange={e => { setStatus((e.target.value || undefined) as OrderStatus | undefined); setPage(1) }}
          data-testid="order-status-filter" className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value="">All</option>
          <option value="pending">Pending</option><option value="processing">Processing</option>
          <option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm" data-testid="admin-orders-table">
          <thead><tr className="border-b dark:border-gray-700 text-left text-gray-500">
            <th className="p-3">ID</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-4 text-center text-gray-500">로딩 중...</td></tr>
            : data?.data.map(o => (
              <tr key={o.id} className="border-b dark:border-gray-700">
                <td className="p-3 text-gray-900 dark:text-white">#{o.id}</td>
                <td className="p-3">${o.total.toFixed(2)}</td>
                <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                <td className="p-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-3"><OrderActions order={o} role="admin" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>
    </div>
  )
}
