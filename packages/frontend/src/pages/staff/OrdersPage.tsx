import { useState } from 'react'
import { useOrders } from '@/hooks/use-orders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderActions } from '@/components/orders/OrderActions'
import { Pagination } from '@/components/common/Pagination'

export default function StaffOrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders({ page, pageSize: 20 })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm" data-testid="staff-orders-table">
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
                <td className="p-3"><OrderActions order={o} role="staff" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>
    </div>
  )
}
