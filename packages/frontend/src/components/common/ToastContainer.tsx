import { InlineNotification } from '@carbon/react'
import { useToast } from '@/contexts/ToastContext'

const kindMap = { success: 'success', error: 'error', warning: 'warning', info: 'info' } as const

export function ToastContainer() {
  const { toasts, removeToast } = useToast()
  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <InlineNotification key={t.id} kind={kindMap[t.type]} title={t.title} subtitle={t.message}
          onCloseButtonClick={() => removeToast(t.id)} lowContrast data-testid={`toast-${t.id}`} />
      ))}
    </div>
  )
}
