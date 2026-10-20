import { useCallback, useEffect, useState } from 'react'
import { loadMenu } from '../api/menuSource'
import type { RowProblem } from '../types/loadResult'
import type { MenuItem } from '../types/menu'

export type MenuState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: MenuItem[]; problems: RowProblem[]; stale: boolean }

/**
 * Carica il menù (dal backend o dal foglio, a seconda della modalità). Lo stato è una
 * "union discriminata": TypeScript ci obbliga a gestire loading/error/success e impedisce
 * combinazioni impossibili (es. loading + errore).
 */
export function useMenu() {
  const [state, setState] = useState<MenuState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Se il componente si smonta (o parte un nuovo tentativo) la richiesta in corso viene annullata:
    // niente setState su un componente che non c'è più e niente risposte "vecchie" che sovrascrivono.
    const controller = new AbortController()

    loadMenu(controller.signal)
      .then((result) => setState({ status: 'success', ...result }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message =
          error instanceof Error ? error.message : 'Si è verificato un errore imprevisto.'
        setState({ status: 'error', message })
      })

    return () => controller.abort()
  }, [attempt])

  /**
   * Aggiorna l'elenco già caricato senza ricaricarlo dal server (usato dall'admin dopo
   * una modifica). Se il menù non è nello stato 'success' non fa nulla.
   */
  const updateItems = useCallback((updater: (items: MenuItem[]) => MenuItem[]) => {
    setState((current) =>
      current.status === 'success' ? { ...current, items: updater(current.items) } : current,
    )
  }, [])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, reload, updateItems }
}
