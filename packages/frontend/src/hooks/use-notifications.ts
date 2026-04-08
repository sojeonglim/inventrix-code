import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient, ApiError } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Notification } from '@/types'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try { return await apiClient<Notification[]>('/api/notifications') }
      catch (e) { if (e instanceof ApiError && e.status === 404) return []; throw e }
    },
    staleTime: 0,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      try { return await apiClient<{ count: number }>('/api/notifications/unread-count') }
      catch (e) { if (e instanceof ApiError && e.status === 404) return { count: 0 }; throw e }
    },
    staleTime: 0,
  })
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (id: string) => apiClient(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
}
