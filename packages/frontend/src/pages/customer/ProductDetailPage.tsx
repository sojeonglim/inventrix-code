import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, NumberInput, Tile, InlineLoading } from '@carbon/react'
import { useProduct } from '@/hooks/use-products'
import { useCreateOrder } from '@/hooks/use-orders'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Skeleton } from '@/components/common/Skeleton'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { data: product, isLoading } = useProduct(id!)
  const createOrder = useCreateOrder()
  const [quantity, setQuantity] = useState(1)

  if (isLoading) return <Skeleton height="400px" width="100%" />
  if (!product) return <p>상품을 찾을 수 없습니다</p>

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return }
    try { await createOrder.mutateAsync({ items: [{ productId: product.id, quantity }] }); addToast('success', '주문 완료'); navigate('/orders') }
    catch { addToast('error', '주문 실패') }
  }

  return (
    <Tile style={{ maxWidth: 800, margin: '0 auto' }}>
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" style={{ width: '100%', height: 320, objectFit: 'cover' }} />}
      <div style={{ padding: '1.5rem' }}>
        <h1>{product.name}</h1>
        <p style={{ color: 'var(--cds-text-secondary)', margin: '0.5rem 0 1.5rem' }}>{product.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: 32, fontWeight: 600 }}>${product.price.toFixed(2)}</span>
          <span style={{ color: product.availableStock > 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)' }}>
            {product.availableStock > 0 ? `${product.availableStock} available` : 'Out of Stock'}
          </span>
        </div>
        {product.availableStock > 0 && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <NumberInput id="qty" label="수량" min={1} max={product.availableStock} value={quantity}
              onChange={(_e: unknown, state: { value: string | number }) => setQuantity(Number(state.value))} data-testid="product-quantity-input" />
            <Button onClick={handleOrder} disabled={createOrder.isPending} data-testid="place-order-button">
              {createOrder.isPending ? <InlineLoading description="주문 중..." /> : 'Place Order'}
            </Button>
          </div>
        )}
      </div>
    </Tile>
  )
}
