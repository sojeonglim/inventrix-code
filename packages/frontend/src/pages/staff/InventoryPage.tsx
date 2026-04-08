import { useState } from 'react'
import { useInventory, useUpdateStock } from '@/hooks/use-inventory'
import { Pagination } from '@/components/common/Pagination'
import { useToast } from '@/contexts/ToastContext'

export default function StaffInventoryPage() {
  const [page, setPage] = useState(1)
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const { data, isLoading } = useInventory({ page, pageSize: 20 })
  const updateStock = useUpdateStock()
  const { addToast } = useToast()

  const handleSave = async (productId: string) => {
    try {
      await updateStock.mutateAsync({ productId, stock: Number(editVal) })
      addToast('success', '재고가 수정되었습니다')
      setEditId(null)
    } catch { addToast('error', '수정에 실패했습니다') }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm" data-testid="staff-inventory-table">
          <thead><tr className="border-b dark:border-gray-700 text-left text-gray-500">
            <th className="p-3">Product</th><th className="p-3">Stock</th><th className="p-3">Available</th><th className="p-3">Reserved</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-4 text-center text-gray-500">로딩 중...</td></tr>
            : data?.data.map(item => (
              <tr key={item.productId} className={`border-b dark:border-gray-700 ${item.availableStock === 0 ? 'bg-red-50 dark:bg-red-900/10' : item.availableStock <= 10 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                <td className="p-3 text-gray-900 dark:text-white">{item.productName}</td>
                <td className="p-3 font-medium">{item.stock}</td>
                <td className="p-3">{item.availableStock}</td>
                <td className="p-3">{item.reservedStock}</td>
                <td className="p-3">
                  {editId === item.productId ? (
                    <div className="flex gap-1">
                      <input type="number" min={0} value={editVal} onChange={e => setEditVal(e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      <button onClick={() => handleSave(item.productId)} className="px-2 py-1 text-xs bg-green-500 text-white rounded">Save</button>
                      <button onClick={() => setEditId(null)} className="px-2 py-1 text-xs bg-gray-400 text-white rounded">Cancel</button>
                    </div>
                  ) : (
                    <button data-testid={`staff-edit-stock-${item.productId}`} onClick={() => { setEditId(item.productId); setEditVal(String(item.stock)) }}
                      className="px-2 py-1 text-xs bg-brand-500 text-white rounded hover:bg-brand-600">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>
    </div>
  )
}
