import { useState, useCallback, useRef, useEffect } from 'react'
import { Search } from '@carbon/react'
import { useInfiniteProducts } from '@/hooks/use-products'
import { ProductCard } from '@/components/products/ProductCard'
import { Skeleton } from '@/components/common/Skeleton'

export default function StorefrontPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteProducts(search)
  const observerRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  const products = data?.pages.flatMap(p => p.data) ?? []

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>🛍️ Featured Products</h1>
      <Search id="storefront-search" labelText="Search" placeholder="상품 검색..." value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} data-testid="storefront-search" style={{ maxWidth: 400, marginBottom: '1.5rem' }} />
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height="280px" />)}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div ref={observerRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
            {isFetchingNextPage && <p style={{ fontSize: 14, color: 'var(--cds-text-secondary)' }}>로딩 중...</p>}
            {!hasNextPage && products.length > 0 && <p style={{ fontSize: 14, color: 'var(--cds-text-secondary)' }}>모든 상품을 확인했습니다</p>}
          </div>
        </>
      )}
    </div>
  )
}
