import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme()
  return (
    <button
      data-testid="theme-toggle"
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolved === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
