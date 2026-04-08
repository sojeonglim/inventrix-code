import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Refund, PaginatedResult, RefundStatus } from '@/types'

export function useRefunds(params?: { status?: RefundStatus; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['refunds', params],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params?.status) sp.set('status', params.status)
      if (params?.page) sp.set('page', String(params.page))
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize ?? 20))
      return apiClient<PaginatedResult<Refund>>(`/api/refunds?${sp}`)
    },
  })
}

export function useUpdateRefund() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RefundStatus }) =>
      apiClient<Refund>(`/api/refunds/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['refunds'] }),
  })
}
