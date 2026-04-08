import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { User, Role } from '@/types'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient<User[]>('/api/users'),
    staleTime: 2 * 60_000,
  })
}

export function useUpdateUserRole() {
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      apiClient<User>(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
