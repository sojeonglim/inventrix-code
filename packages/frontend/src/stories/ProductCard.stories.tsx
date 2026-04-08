import type { Meta, StoryObj } from '@storybook/react'
import { ProductCard } from '@/components/products/ProductCard'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  decorators: [(Story) => <MemoryRouter><div style={{ width: 300 }}><Story /></div></MemoryRouter>],
}
export default meta
type Story = StoryObj<typeof ProductCard>

export const InStock: Story = {
  args: { product: { id: '1', name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, stock: 50, availableStock: 45, imageUrl: null, createdAt: '' } },
}

export const LowStock: Story = {
  args: { product: { id: '2', name: 'USB-C Hub', description: '7-in-1 USB-C hub', price: 49.99, stock: 5, availableStock: 3, imageUrl: null, createdAt: '' } },
}

export const OutOfStock: Story = {
  args: { product: { id: '3', name: 'Mechanical Keyboard', description: 'Cherry MX switches', price: 129.99, stock: 0, availableStock: 0, imageUrl: null, createdAt: '' } },
}
