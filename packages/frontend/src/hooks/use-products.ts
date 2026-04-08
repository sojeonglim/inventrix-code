import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Product, PaginatedResult } from '@/types'

export function useProducts(params?: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params?.search) sp.set('search', params.search)
      if (params?.page) sp.set('page', String(params.page))
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize))
      return apiClient<PaginatedResult<Product>>(`/api/products?${sp}`)
    },
    staleTime: 5 * 60_000,
  })
}

export function useInfiniteProducts(search?: string) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', search],
    queryFn: ({ pageParam = 1 }) => {
      const sp = new URLSearchParams({ page: String(pageParam), pageSize: '20' })
      if (search) sp.set('search', search)
      return apiClient<PaginatedResult<Product>>(`/api/products?${sp}`)
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: 5 * 60_000,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient<Product>(`/api/products/${id}`),
    staleTime: 5 * 60_000,
    enabled: !!id,
  })
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: { name: string; description?: string; price: number; stock: number; imageUrl?: string }) =>
      apiClient<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; price?: number; stock?: number; imageUrl?: string }) =>
      apiClient<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', vars.id] })
    },
  })
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: (id: string) => apiClient(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useGenerateImage() {
  return useMutation({
    mutationFn: (data: { productName: string; description: string }) =>
      apiClient<{ imageUrl: string }>('/api/products/generate-image', { method: 'POST', body: JSON.stringify(data) }),
  })
}
