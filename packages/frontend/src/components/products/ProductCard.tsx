import { Link } from 'react-router-dom'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const stockLabel = product.availableStock > 10 ? 'In Stock'
    : product.availableStock > 0 ? `${product.availableStock} left` : 'Out of Stock'
  const stockColor = product.availableStock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : product.availableStock > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'

  return (
    <Link to={`/products/${product.id}`} data-testid={`product-card-${product.id}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="relative pt-[75%] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">${product.price.toFixed(2)}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${stockColor}`}>{stockLabel}</span>
        </div>
      </div>
    </Link>
  )
}
