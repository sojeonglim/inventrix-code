// SSE — 기존 Backend에 SSE 엔드포인트가 없으므로 연결 시도만 하고 실패 시 무시
import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { queryClient } from '@/lib/query-client'
import type { DashboardKPIs } from '@/types'

export function useSSE() {
  const { token, user } = useAuth()
  const { addToast } = useToast()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!token || !user) return

    try {
      const es = new EventSource(`/api/sse/connect?token=${token}`)
      esRef.current = es

      es.addEventListener('notification', (e) => {
        const data = JSON.parse(e.data)
        addToast('info', data.title, data.message)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      })

      es.addEventListener('dashboard_update', (e) => {
        queryClient.setQueryData(['dashboard'], JSON.parse(e.data) as DashboardKPIs)
      })

      es.onerror = () => { es.close() }
    } catch {
      // SSE not available — ignore
    }

    return () => { esRef.current?.close() }
  }, [token, user, addToast])
}
