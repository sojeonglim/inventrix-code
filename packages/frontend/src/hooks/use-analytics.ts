import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { DashboardKPIs, RevenueStats, OrderStats, InventoryStats } from '@/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient<DashboardKPIs>('/api/analytics/dashboard'),
    staleTime: 0,
  })
}

export function useRevenue(from?: string, to?: string) {
  return useQuery({
    queryKey: ['revenue', from, to],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (from) sp.set('from', from)
      if (to) sp.set('to', to)
      return apiClient<RevenueStats>(`/api/analytics/revenue?${sp}`)
    },
    staleTime: 60_000,
  })
}

export function useOrderStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['orderStats', from, to],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (from) sp.set('from', from)
      if (to) sp.set('to', to)
      return apiClient<OrderStats>(`/api/analytics/orders?${sp}`)
    },
    staleTime: 60_000,
  })
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventoryStats'],
    queryFn: () => apiClient<InventoryStats>('/api/analytics/inventory'),
    staleTime: 60_000,
  })
}
