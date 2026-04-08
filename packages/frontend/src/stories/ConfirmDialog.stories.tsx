import type { Meta, StoryObj } from '@storybook/react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { fn } from '@storybook/test'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
}
export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Default: Story = {
  args: { open: true, title: '주문 취소', description: '주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.', confirmLabel: '취소 확인', onConfirm: fn(), onCancel: fn() },
}

export const DeleteProduct: Story = {
  args: { open: true, title: '상품 삭제', description: '이 상품을 삭제하시겠습니까?', confirmLabel: '삭제', onConfirm: fn(), onCancel: fn() },
}
