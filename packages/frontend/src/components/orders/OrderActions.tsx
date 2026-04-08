import { useState } from 'react'
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
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      addToast('success', `주문 상태가 ${status}로 변경되었습니다`)
    } catch { addToast('error', '상태 변경에 실패했습니다') }
  }

  const handleCancel = async () => {
    setConfirmCancel(false)
    try {
      await cancelOrder.mutateAsync(order.id)
      addToast('success', '주문이 취소되었습니다')
    } catch { addToast('error', '취소에 실패했습니다') }
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {allowed.filter(s => s !== 'cancelled').map(status => (
        <button key={status} data-testid={`order-action-${status}-${order.id}`}
          onClick={() => handleStatus(status)} disabled={updateStatus.isPending}
          className="px-2 py-1 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 capitalize">
          {status}
        </button>
      ))}
      {allowed.includes('cancelled') && (
        <>
          <button data-testid={`order-action-cancel-${order.id}`} onClick={() => setConfirmCancel(true)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
          <ConfirmDialog open={confirmCancel} onConfirm={handleCancel} onCancel={() => setConfirmCancel(false)}
            title="주문 취소" description="주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다." confirmLabel="취소 확인" />
        </>
      )}
    </div>
  )
}
