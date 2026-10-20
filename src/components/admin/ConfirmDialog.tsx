import { Modal } from '../Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  /** true mentre l'azione è in corso: disabilita i pulsanti. */
  busy?: boolean
  /** Errore dell'ultimo tentativo, mostrato dentro il dialog. */
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

/** Conferma per azioni distruttive (es. eliminare un piatto). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-dialog-title">
      <div className="p-5">
        <h2 id="confirm-dialog-title" className="text-lg font-bold">
          {title}
        </h2>
        <p className="mt-2 text-stone-700">{message}</p>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-stone-300 py-3 font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-700 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {busy ? 'Elimino…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
