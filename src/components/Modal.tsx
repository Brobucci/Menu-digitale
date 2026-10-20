import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** Id dell'elemento che titola il modal (per aria-labelledby). */
  labelledBy: string
  /**
   * Se false, un click sullo sfondo non chiude il modal. Utile nei form: un tocco accidentale
   * fuori dal riquadro non deve far perdere quello che l'utente ha scritto.
   */
  dismissOnBackdrop?: boolean
  children: ReactNode
}

/**
 * Contenitore comune per tutti i modal dell'app (dettaglio piatto, conferma, form).
 * Usa l'elemento nativo <dialog> con showModal(): il browser gestisce da solo focus trap,
 * tasto Esc, sfondo oscurato e "inertizzazione" della pagina sotto.
 */
export function Modal({ open, onClose, labelledBy, dismissOnBackdrop = true, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      // 'close' scatta con Esc, con dialog.close() e con il form method="dialog".
      onClose={onClose}
      // Il padding sta nel contenuto: così un click sul target "dialog" stesso è un click sullo sfondo.
      onClick={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) onClose()
      }}
      aria-labelledby={labelledBy}
      // m-auto: il preflight di Tailwind azzera i margini, che servono a centrare il <dialog>.
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-white p-0 text-stone-900 shadow-xl backdrop:bg-black/50"
    >
      {open && children}
    </dialog>
  )
}
