import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { PaginatedResult, StockInfo } from '@/types'

export function useInventory(params?: { lowStock?: boolean; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params?.lowStock) sp.set('lowStock', 'true')
      if (params?.page) sp.set('page', String(params.page))
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize ?? 20))
      return apiClient<PaginatedResult<StockInfo>>(`/api/inventory?${sp}`)
    },
    staleTime: 30_000,
  })
}

export function useUpdateStock() {
  return useMutation({
    mutationFn: ({ productId, stock }: { productId: string; stock: number }) =>
      apiClient<StockInfo>(`/api/inventory/${productId}`, { method: 'PATCH', body: JSON.stringify({ stock }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
