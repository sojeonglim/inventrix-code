import { useState } from 'react'
import { Tile } from '@carbon/react'
import { useOrders } from '@/hooks/use-orders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderActions } from '@/components/orders/OrderActions'
import { useAuth } from '@/contexts/AuthContext'
import { Pagination } from '@/components/common/Pagination'
import { Skeleton } from '@/components/common/Skeleton'

export default function OrdersPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders({ page, pageSize: 10 })

  if (isLoading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height="100px" />)}</div>

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>My Orders</h1>
      {!data?.data.length ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--cds-text-secondary)' }}>주문 내역이 없습니다</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.data.map(order => (
            <Tile key={order.id} data-testid={`order-card-${order.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h4>Order #{order.id}</h4>
                  <p style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  <div style={{ marginTop: 8 }}><OrderStatusBadge status={order.status} /></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>Subtotal: ${order.subtotal.toFixed(2)}</p>
                  <p style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>GST: ${order.gst.toFixed(2)}</p>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>${order.total.toFixed(2)}</p>
                  {user && <div style={{ marginTop: 8 }}><OrderActions order={order} role={user.role} /></div>}
                </div>
              </div>
            </Tile>
          ))}
          <Pagination page={page} totalItems={data.total} pageSize={10} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
