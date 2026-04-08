import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/lib/constants'

const typeStyles = {
  success: 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  error: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  warning: 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  info: 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map(t => (
        <div key={t.id} className={cn('border-l-4 p-4 rounded-lg shadow-lg', typeStyles[t.type])}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">{t.title}</p>
              {t.message && <p className="text-sm mt-1 opacity-80">{t.message}</p>}
            </div>
            <button data-testid={`toast-close-${t.id}`} onClick={() => removeToast(t.id)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
