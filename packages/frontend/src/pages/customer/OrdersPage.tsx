import { useState } from 'react'
import { useOrders } from '@/hooks/use-orders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderActions } from '@/components/orders/OrderActions'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/common/Skeleton'
import { Pagination } from '@/components/common/Pagination'

export default function OrdersPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders({ page, pageSize: 10 })

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
      {!data?.data.length ? (
        <p className="text-gray-500 text-center py-8">주문 내역이 없습니다</p>
      ) : (
        <div className="space-y-4">
          {data.data.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow" data-testid={`order-card-${order.id}`}>
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2"><OrderStatusBadge status={order.status} /></div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Subtotal: ${order.subtotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">GST: ${order.gst.toFixed(2)}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                  {user && <div className="mt-2"><OrderActions order={order} role={user.role} /></div>}
                </div>
              </div>
            </div>
          ))}
          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
