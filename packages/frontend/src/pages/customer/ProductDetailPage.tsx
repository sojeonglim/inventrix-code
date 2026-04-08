import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

  if (isLoading) return <Skeleton className="h-96 max-w-3xl mx-auto rounded-xl" />
  if (!product) return <p className="text-center text-gray-500">상품을 찾을 수 없습니다</p>

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return }
    try {
      await createOrder.mutateAsync({ items: [{ productId: product.id, quantity }] })
      addToast('success', '주문이 완료되었습니다')
      navigate('/orders')
    } catch { addToast('error', '주문에 실패했습니다') }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-80 object-cover" />}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{product.description}</p>
        <div className="flex justify-between items-center mt-6">
          <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">${product.price.toFixed(2)}</span>
          <span className={`text-sm font-medium ${product.availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.availableStock > 0 ? `${product.availableStock} available` : 'Out of Stock'}
          </span>
        </div>
        {product.availableStock > 0 && (
          <div className="flex gap-3 mt-6">
            <input type="number" min={1} max={product.availableStock} value={quantity} onChange={e => setQuantity(Number(e.target.value))}
              data-testid="product-quantity-input" className="w-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            <button onClick={handleOrder} disabled={createOrder.isPending} data-testid="place-order-button"
              className="flex-1 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 font-medium">
              {createOrder.isPending ? '주문 중...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
