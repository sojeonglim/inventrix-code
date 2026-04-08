import type { Meta, StoryObj } from '@storybook/react'
import { OrderActions } from '@/components/orders/OrderActions'
import { ToastProvider } from '@/contexts/ToastContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

const meta: Meta<typeof OrderActions> = {
  title: 'Components/OrderActions',
  component: OrderActions,
  decorators: [(Story) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider><Story /></ToastProvider>
    </QueryClientProvider>
  )],
}
export default meta
type Story = StoryObj<typeof OrderActions>

const baseOrder = { id: '1', userId: 'u1', items: [], subtotal: 100, gst: 10, total: 110, createdAt: '' }

export const AdminPending: Story = { args: { order: { ...baseOrder, status: 'pending' }, role: 'admin' } }
export const AdminProcessing: Story = { args: { order: { ...baseOrder, status: 'processing' }, role: 'admin' } }
export const StaffProcessing: Story = { args: { order: { ...baseOrder, status: 'processing' }, role: 'staff' } }
export const CustomerPending: Story = { args: { order: { ...baseOrder, status: 'pending' }, role: 'customer' } }
export const DeliveredNoActions: Story = { args: { order: { ...baseOrder, status: 'delivered' }, role: 'admin' } }
