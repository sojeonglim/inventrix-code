import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { ThemeMode } from '@/types'

interface ThemeContextType {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    (localStorage.getItem('theme-mode') as ThemeMode) ?? 'system'
  )
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    mode === 'system' ? getSystemTheme() : mode
  )

  useEffect(() => {
    const r = mode === 'system' ? getSystemTheme() : mode
    setResolved(r)
    document.documentElement.classList.toggle('dark', r === 'dark')
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setResolved(e.matches ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const setTheme = useCallback((m: ThemeMode) => {
    setMode(m)
    localStorage.setItem('theme-mode', m)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
