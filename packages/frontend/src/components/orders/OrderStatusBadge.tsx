import { Tag } from '@carbon/react'
import { ORDER_STATUS_TAG_TYPE, ORDER_STATUS_LABELS } from '@/lib/constants'
import type { OrderStatus } from '@/types'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Tag type={ORDER_STATUS_TAG_TYPE[status]} size="sm">{ORDER_STATUS_LABELS[status]}</Tag>
}
