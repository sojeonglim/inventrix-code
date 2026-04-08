import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/constants'
import type { OrderStatus } from '@/types'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
