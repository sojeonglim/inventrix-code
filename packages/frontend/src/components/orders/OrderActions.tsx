import { useState } from 'react'
import { Button } from '@carbon/react'
import { useUpdateOrderStatus, useCancelOrder } from '@/hooks/use-orders'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Order, Role, OrderStatus } from '@/types'

const TRANSITIONS: Record<Role, Record<string, OrderStatus[]>> = {
  admin: { pending: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered'] },
  staff: { processing: ['shipped'], shipped: ['delivered'] },
  customer: { pending: ['cancelled'] },
}

export function OrderActions({ order, role }: { order: Order; role: Role }) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const updateStatus = useUpdateOrderStatus()
  const cancelOrder = useCancelOrder()
  const { addToast } = useToast()
  const allowed = TRANSITIONS[role]?.[order.status] ?? []
  if (!allowed.length) return null

  const handleStatus = async (status: OrderStatus) => {
    try { await updateStatus.mutateAsync({ id: order.id, status }); addToast('success', `상태가 ${status}로 변경됨`) }
    catch { addToast('error', '상태 변경 실패') }
  }

  const handleCancel = async () => {
    setConfirmCancel(false)
    try { await cancelOrder.mutateAsync(order.id); addToast('success', '주문 취소됨') }
    catch { addToast('error', '취소 실패') }
  }

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {allowed.filter(s => s !== 'cancelled').map(status => (
        <Button key={status} size="sm" kind="primary" onClick={() => handleStatus(status)}
          disabled={updateStatus.isPending} data-testid={`order-action-${status}-${order.id}`}>
          {status}
        </Button>
      ))}
      {allowed.includes('cancelled') && (
        <>
          <Button size="sm" kind="danger" onClick={() => setConfirmCancel(true)} data-testid={`order-action-cancel-${order.id}`}>Cancel</Button>
          <ConfirmDialog open={confirmCancel} onConfirm={handleCancel} onCancel={() => setConfirmCancel(false)}
            title="주문 취소" description="주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다." confirmLabel="취소 확인" />
        </>
      )}
    </div>
  )
}
