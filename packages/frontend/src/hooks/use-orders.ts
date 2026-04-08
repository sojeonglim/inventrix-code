import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Order, OrderStatus } from '@/types'

function mapOrder(o: Record<string, unknown>): Order {
  return {
    id: String(o.id), userId: String(o.user_id), subtotal: o.subtotal as number,
    gst: o.gst as number, total: o.total as number, status: o.status as OrderStatus,
    createdAt: o.created_at as string, items: [],
  }
}

export function useOrders(params?: { status?: OrderStatus; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const raw = await apiClient<Record<string, unknown>[]>('/api/orders')
      let all = raw.map(mapOrder)
      if (params?.status) all = all.filter(o => o.status === params.status)
      const page = params?.page ?? 1
      const pageSize = params?.pageSize ?? 20
      const start = (page - 1) * pageSize
      return { data: all.slice(start, start + pageSize), total: all.length, page, pageSize, totalPages: Math.ceil(all.length / pageSize) }
    },
    staleTime: 30_000,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => { const raw = await apiClient<Record<string, unknown>>(`/api/orders/${id}`); return mapOrder(raw) },
    enabled: !!id,
  })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: { items: Array<{ productId: string; quantity: number }> }) =>
      apiClient<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items: data.items.map(i => ({ product_id: Number(i.productId), quantity: i.quantity })) }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
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
    },
  })
}

export function useCancelOrder() {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
