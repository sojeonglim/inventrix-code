import type { Meta, StoryObj } from '@storybook/react'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

const meta: Meta<typeof OrderStatusBadge> = {
  title: 'Components/OrderStatusBadge',
  component: OrderStatusBadge,
}
export default meta
type Story = StoryObj<typeof OrderStatusBadge>

export const Pending: Story = { args: { status: 'pending' } }
export const Processing: Story = { args: { status: 'processing' } }
export const Shipped: Story = { args: { status: 'shipped' } }
export const Delivered: Story = { args: { status: 'delivered' } }
export const Cancelled: Story = { args: { status: 'cancelled' } }
