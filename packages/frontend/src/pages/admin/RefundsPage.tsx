import { useState } from 'react'
import { useRefunds, useUpdateRefund } from '@/hooks/use-refunds'
import { Pagination } from '@/components/common/Pagination'
import { useToast } from '@/contexts/ToastContext'
import type { RefundStatus } from '@/types'

export default function RefundsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useRefunds({ page, pageSize: 20 })
  const updateRefund = useUpdateRefund()
  const { addToast } = useToast()

  const handleProcess = async (id: string) => {
    try {
      await updateRefund.mutateAsync({ id, status: 'refunded' as RefundStatus })
      addToast('success', '환불이 처리되었습니다')
    } catch { addToast('error', '처리에 실패했습니다') }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Refunds</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm" data-testid="refunds-table">
          <thead><tr className="border-b dark:border-gray-700 text-left text-gray-500">
            <th className="p-3">ID</th><th className="p-3">Order</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-4 text-center text-gray-500">로딩 중...</td></tr>
            : data?.data.map(r => (
              <tr key={r.id} className="border-b dark:border-gray-700">
                <td className="p-3 text-gray-900 dark:text-white">#{r.id}</td>
                <td className="p-3">#{r.orderId}</td>
                <td className="p-3">${r.amount.toFixed(2)}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'refunded' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span></td>
                <td className="p-3">
                  {r.status === 'pending_refund' && (
                    <button data-testid={`process-refund-${r.id}`} onClick={() => handleProcess(r.id)}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Process</button>
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
