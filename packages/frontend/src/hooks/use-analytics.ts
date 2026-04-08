import { useQuery } from '@tanstack/react-query'
import { apiClient, ApiError } from '@/lib/api-client'
import type { DashboardKPIs, RevenueStats, OrderStats, InventoryStats } from '@/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const raw = await apiClient<Record<string, unknown>>('/api/analytics/dashboard')
        const summary = raw.summary as Record<string, number> | undefined
        return {
          totalRevenue: summary?.totalRevenue ?? 0, totalOrders: summary?.totalOrders ?? 0,
          totalProducts: summary?.totalProducts ?? 0, lowStockCount: summary?.lowStockItems ?? 0,
          recentOrders: (raw.recentOrders as DashboardKPIs['recentOrders']) ?? [],
          topProducts: (raw.topProducts as DashboardKPIs['topProducts']) ?? [],
          ordersByStatus: (raw.ordersByStatus as DashboardKPIs['ordersByStatus']) ?? {},
        } as DashboardKPIs
      } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e }
    },
    staleTime: 0,
  })
}

export function useRevenue(from?: string, to?: string) {
  return useQuery({
    queryKey: ['revenue', from, to],
    queryFn: async () => {
      try {
        const sp = new URLSearchParams()
        if (from) sp.set('from', from)
        if (to) sp.set('to', to)
        return await apiClient<RevenueStats>(`/api/analytics/revenue?${sp}`)
      } catch { return { total: 0, byPeriod: [] } as RevenueStats }
    },
    staleTime: 60_000,
  })
}

export function useOrderStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['orderStats', from, to],
    queryFn: async () => {
      try {
        const sp = new URLSearchParams()
        if (from) sp.set('from', from)
        if (to) sp.set('to', to)
        return await apiClient<OrderStats>(`/api/analytics/orders?${sp}`)
      } catch { return { total: 0, byStatus: {}, byPeriod: [] } as unknown as OrderStats }
    },
    staleTime: 60_000,
  })
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventoryStats'],
    queryFn: async () => {
      try { return await apiClient<InventoryStats>('/api/analytics/inventory') }
      catch { return { totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0, items: [] } as InventoryStats }
    },
    staleTime: 60_000,
  })
}
