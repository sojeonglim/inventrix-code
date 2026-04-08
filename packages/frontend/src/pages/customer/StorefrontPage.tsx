import { useState, useCallback, useRef, useEffect } from 'react'
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🛍️ Featured Products</h1>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="상품 검색..." data-testid="storefront-search"
        className="w-full max-w-md px-4 py-2 border rounded-lg mb-6 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div ref={observerRef} className="h-10 mt-4 flex items-center justify-center">
            {isFetchingNextPage && <span className="text-sm text-gray-500">로딩 중...</span>}
            {!hasNextPage && products.length > 0 && <span className="text-sm text-gray-400">모든 상품을 확인했습니다</span>}
          </div>
        </>
      )}
    </div>
  )
}
