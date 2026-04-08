import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Notification } from '@/types'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient<Notification[]>('/api/notifications'),
    staleTime: 0,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => apiClient<{ count: number }>('/api/notifications/unread-count'),
    staleTime: 0,
  })
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (id: string) => apiClient(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const prev = queryClient.getQueryData<Notification[]>(['notifications'])
      queryClient.setQueryData<Notification[]>(['notifications'], old =>
        old?.map(n => n.id === id ? { ...n, read: true } : n)
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
}
