import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/types'
import { apiClient } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await apiClient<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST', body: JSON.stringify({ email, password, name }),
    })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
  }, [])

  const logout = useCallback(() => {
    apiClient('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    queryClient.clear()
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
