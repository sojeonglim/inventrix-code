import type { OrderStatus } from '@/types'

export const ORDER_STATUS_TAG_TYPE: Record<OrderStatus, 'blue' | 'cyan' | 'teal' | 'green' | 'red' | 'warm-gray'> = {
  pending: 'warm-gray',
  processing: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
