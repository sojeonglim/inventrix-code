import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { queryClient } from '@/lib/query-client'
import type { DashboardKPIs } from '@/types'

export function useSSE() {
  const { token, user } = useAuth()
  const { addToast } = useToast()
  const esRef = useRef<EventSource | null>(null)
  const retryRef = useRef(0)

  useEffect(() => {
    if (!token || !user) return

    function connect() {
      const es = new EventSource(`/api/sse/connect?token=${token}`)
      esRef.current = es

      es.onopen = () => { retryRef.current = 0 }

      es.addEventListener('notification', (e) => {
        const data = JSON.parse(e.data)
        addToast('info', data.title, data.message)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['unread-count'] })
      })

      es.addEventListener('dashboard_update', (e) => {
        const data = JSON.parse(e.data) as DashboardKPIs
        queryClient.setQueryData(['dashboard'], data)
      })

      es.addEventListener('order_status_changed', (e) => {
        const data = JSON.parse(e.data)
        addToast('info', 'Order Updated', `Order #${data.orderId}: ${data.newStatus}`)
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      })

      es.addEventListener('stock_alert', (e) => {
        const data = JSON.parse(e.data)
        const type = data.type === 'depleted' ? 'error' : 'warning'
        addToast(type, 'Stock Alert', `${data.productName}: ${data.currentStock} remaining`)
      })

      es.onerror = () => {
        es.close()
        const delay = Math.min(1000 * 2 ** retryRef.current, 30_000)
        retryRef.current++
        setTimeout(connect, delay)
      }
    }

    connect()
    return () => { esRef.current?.close() }
  }, [token, user, addToast])
}
