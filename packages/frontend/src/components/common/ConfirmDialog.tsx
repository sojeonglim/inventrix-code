import { Modal } from '@carbon/react'

interface Props { open: boolean; onConfirm: () => void; onCancel: () => void; title: string; description: string; confirmLabel?: string }

export function ConfirmDialog({ open, onConfirm, onCancel, title, description, confirmLabel = '확인' }: Props) {
  return (
    <Modal open={open} modalHeading={title} primaryButtonText={confirmLabel} secondaryButtonText="취소"
      onRequestSubmit={onConfirm} onRequestClose={onCancel} danger size="sm" data-testid="confirm-dialog">
      <p>{description}</p>
    </Modal>
  )
}
