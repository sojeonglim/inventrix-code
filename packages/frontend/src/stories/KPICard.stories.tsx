import type { Meta, StoryObj } from '@storybook/react'
import { KPICard } from '@/components/analytics/KPICard'

const meta: Meta<typeof KPICard> = {
  title: 'Components/KPICard',
  component: KPICard,
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof KPICard>

export const Revenue: Story = { args: { title: 'Total Revenue', value: '$12,345.67', icon: '💰' } }
export const Orders: Story = { args: { title: 'Total Orders', value: 156, icon: '🛒' } }
export const LowStock: Story = { args: { title: 'Low Stock', value: 8, icon: '⚠️' } }
