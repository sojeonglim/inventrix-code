import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Product } from '@/types'

// 기존 Backend는 배열 반환 — PaginatedResult가 아님
function mapProduct(p: Record<string, unknown>): Product {
  return {
    id: String(p.id), name: p.name as string, description: (p.description as string) ?? null,
    price: p.price as number, stock: p.stock as number, availableStock: p.stock as number,
    imageUrl: (p.image_url as string) ?? null, createdAt: p.created_at as string,
  }
}

export function useProducts(params?: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const raw = await apiClient<Record<string, unknown>[]>('/api/products')
      const all = raw.map(mapProduct)
      const page = params?.page ?? 1
      const pageSize = params?.pageSize ?? 20
      const start = (page - 1) * pageSize
      return { data: all.slice(start, start + pageSize), total: all.length, page, pageSize, totalPages: Math.ceil(all.length / pageSize) }
    },
    staleTime: 5 * 60_000,
  })
}

export function useInfiniteProducts(search?: string) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', search],
    queryFn: async ({ pageParam = 1 }) => {
      const raw = await apiClient<Record<string, unknown>[]>('/api/products')
      const all = raw.map(mapProduct).filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      const pageSize = 20
      const start = (pageParam - 1) * pageSize
      return { data: all.slice(start, start + pageSize), total: all.length, page: pageParam, pageSize, totalPages: Math.ceil(all.length / pageSize) }
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: 5 * 60_000,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const raw = await apiClient<Record<string, unknown>>(`/api/products/${id}`)
      return mapProduct(raw)
    },
    staleTime: 5 * 60_000,
    enabled: !!id,
  })
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: { name: string; description?: string; price: number; stock: number; imageUrl?: string }) =>
      apiClient<Product>('/api/products', { method: 'POST', body: JSON.stringify({ ...data, image_url: data.imageUrl }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; price?: number; stock?: number; imageUrl?: string }) =>
      apiClient<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify({ ...data, image_url: data.imageUrl }) }),
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
