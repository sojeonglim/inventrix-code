import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Order, PaginatedResult, OrderStatus } from '@/types'

export function useOrders(params?: { status?: OrderStatus; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params?.status) sp.set('status', params.status)
      if (params?.page) sp.set('page', String(params.page))
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize ?? 20))
      return apiClient<PaginatedResult<Order>>(`/api/orders?${sp}`)
    },
    staleTime: 30_000,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient<Order>(`/api/orders/${id}`),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: { items: Array<{ productId: string; quantity: number }> }) =>
      apiClient<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiClient<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCancelOrder() {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<Order>(`/api/orders/${id}/cancel`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
