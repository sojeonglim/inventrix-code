import type { ErrorResponse } from '@/types'

let refreshPromise: Promise<string> | null = null

async function refreshToken(): Promise<string> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  if (!res.ok) throw new Error('Refresh failed')
  const data = await res.json()
  localStorage.setItem('token', data.token)
  return data.token
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, public details?: unknown) {
    super(code)
  }
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res = await fetch(endpoint, { ...options, headers })

  if (res.status === 401 && token) {
    try {
      if (!refreshPromise) refreshPromise = refreshToken()
      const newToken = await refreshPromise
      refreshPromise = null
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(endpoint, { ...options, headers })
    } catch {
      refreshPromise = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new ApiError(401, 'SESSION_EXPIRED')
    }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ErrorResponse | null
    throw new ApiError(
      res.status,
      body?.error?.code ?? `HTTP_${res.status}`,
      body?.error?.details,
    )
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
