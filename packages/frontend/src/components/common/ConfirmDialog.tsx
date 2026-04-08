import * as AlertDialog from '@radix-ui/react-alert-dialog'

interface Props { open: boolean; onConfirm: () => void; onCancel: () => void; title: string; description: string; confirmLabel?: string }

export function ConfirmDialog({ open, onConfirm, onCancel, title, description, confirmLabel = '확인' }: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl z-50">
          <AlertDialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</AlertDialog.Description>
          <div className="flex justify-end gap-3 mt-6">
            <AlertDialog.Cancel asChild>
              <button data-testid="confirm-dialog-cancel" className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">취소</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button data-testid="confirm-dialog-confirm" onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">{confirmLabel}</button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
