import { useState } from 'react'
import { useProducts, useDeleteProduct } from '@/hooks/use-products'
import { ProductForm } from '@/components/products/ProductForm'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import type { Product } from '@/types'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useProducts({ page, pageSize: 20 })
  const deleteMut = useDeleteProduct()
  const { addToast } = useToast()

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteMut.mutateAsync(deleteId); addToast('success', '상품이 삭제되었습니다') }
    catch { addToast('error', '삭제에 실패했습니다') }
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <button onClick={() => { setEditing(null); setShowForm(true) }} data-testid="add-product-button"
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">+ 상품 추가</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <ProductForm product={editing ?? undefined} onSuccess={() => { setShowForm(false); setEditing(null) }} />
          <button onClick={() => { setShowForm(false); setEditing(null) }} className="mt-2 text-sm text-gray-500 hover:underline">취소</button>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm" data-testid="products-table">
          <thead><tr className="border-b dark:border-gray-700 text-left text-gray-500">
            <th className="p-3">Name</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="p-4 text-center text-gray-500">로딩 중...</td></tr>
            : data?.data.map(p => (
              <tr key={p.id} className="border-b dark:border-gray-700">
                <td className="p-3 text-gray-900 dark:text-white">{p.name}</td>
                <td className="p-3">${p.price.toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 flex gap-2">
                  <button data-testid={`edit-product-${p.id}`} onClick={() => { setEditing(p); setShowForm(true) }}
                    className="px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600">Edit</button>
                  <button data-testid={`delete-product-${p.id}`} onClick={() => setDeleteId(p.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>
      <ConfirmDialog open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)}
        title="상품 삭제" description="이 상품을 삭제하시겠습니까?" confirmLabel="삭제" />
    </div>
  )
}
