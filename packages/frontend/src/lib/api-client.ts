import type { ErrorResponse } from '@/types'

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

  const res = await fetch(endpoint, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new ApiError(401, 'UNAUTHORIZED')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ErrorResponse | null
    throw new ApiError(res.status, body?.error?.code ?? `HTTP_${res.status}`, body?.error?.details)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
