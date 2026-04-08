import { ClickableTile, Tag } from '@carbon/react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const stockLabel = product.availableStock > 10 ? 'In Stock' : product.availableStock > 0 ? `${product.availableStock} left` : 'Out of Stock'
  const tagType = product.availableStock > 10 ? 'green' : product.availableStock > 0 ? 'warm-gray' : 'red'

  return (
    <ClickableTile data-testid={`product-card-${product.id}`} onClick={() => navigate(`/products/${product.id}`)}
      style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 180, background: 'var(--cds-layer-02)', overflow: 'hidden' }}>
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ padding: '1rem' }}>
        <h4 style={{ marginBottom: 4 }}>{product.name}</h4>
        <p style={{ fontSize: 12, color: 'var(--cds-text-secondary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>${product.price.toFixed(2)}</span>
          <Tag type={tagType} size="sm">{stockLabel}</Tag>
        </div>
      </div>
    </ClickableTile>
  )
}
