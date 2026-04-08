import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100'

interface ThemeContextType {
  theme: CarbonTheme
  setTheme: (t: CarbonTheme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<CarbonTheme>(
    () => (localStorage.getItem('carbon-theme') as CarbonTheme) ?? 'g10'
  )

  const setTheme = useCallback((t: CarbonTheme) => {
    setThemeState(t)
    localStorage.setItem('carbon-theme', t)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'g10' || theme === 'white' ? 'g90' : 'g10')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
