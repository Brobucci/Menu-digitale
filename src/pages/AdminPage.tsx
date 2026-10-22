import { useState } from 'react'
import { Link } from 'react-router'
import {  useAuth } from '../auth/useAuth.ts'
import { ApiError, createItem, deleteItem, setAvailability, updateItem } from '../api/menuApi'
import { AdminItemRow } from '../components/admin/AdminItemRow'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { ItemForm } from '../components/admin/ItemForm.tsx'
import { CategoryTabs } from '../components/CategoryTabs'
import { ErrorState, LoadingState } from '../components/MenuStates'
import { Modal } from '../components/Modal'
import { useMenu } from '../hooks/useMenu'
import { PANEL_ID, tabId } from '../utils/tabIds'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
  type MenuItem,
  type MenuItemInput,
} from '../types/menu'

/** Cosa mostra il modal del form: niente, un piatto nuovo oppure la modifica di un piatto. */
type FormTarget = { mode: 'create' } | { mode: 'edit'; item: MenuItem }

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Si è verificato un errore imprevisto.'
}

export function AdminPage() {
  const { state, reload, updateItems } = useMenu()
  const { logout } = useAuth()

  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0])
  // Id dei piatti con un salvataggio di disponibilità in corso.
  const [pendingIds, setPendingIds] = useState<string[]>([])
  // Errore di un'azione rapida (toggle), mostrato in un banner.
  const [actionError, setActionError] = useState<string | null>(null)

  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)

  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const visibleItems =
    state.status === 'success'
      ? state.items.filter((item) => item.category === activeCategory)
      : []

  /**
   * Aggiornamento "ottimistico": la UI cambia subito, senza aspettare il server, e torna
   * com'era se la chiamata fallisce. A servizio in corso il toggle deve sembrare istantaneo.
   */
  async function handleToggleAvailability(item: MenuItem) {
    const previous = item.available
    const next = !previous
    const applyTo = (value: boolean) => (items: MenuItem[]) =>
      items.map((current) => (current.id === item.id ? { ...current, available: value } : current))

    setActionError(null)
    setPendingIds((ids) => [...ids, item.id])
    updateItems(applyTo(next))

    try {
      const saved = await setAvailability(item.id, next)
      // Il server è la fonte di verità: sostituiamo il piatto con quello che ha salvato.
      updateItems((items) => items.map((current) => (current.id === saved.id ? saved : current)))
    } catch (error) {
      updateItems(applyTo(previous))
      setActionError(
        `Non sono riuscito a salvare la disponibilità di «${item.title}». ${errorMessage(error)}`,
      )
    } finally {
      setPendingIds((ids) => ids.filter((id) => id !== item.id))
    }
  }

  /**
   * Salva dal form. Se fallisce lancia l'errore: lo gestisce ItemForm, che lo mostra sotto i
   * campi giusti e lascia il modal aperto. Se riesce, l'elenco si aggiorna con il piatto
   * restituito dal server (fonte di verità) e il modal si chiude.
   */
  async function handleSave(input: MenuItemInput) {
    if (!formTarget) return
    const saved =
      formTarget.mode === 'edit'
        ? await updateItem(formTarget.item.id, input)
        : await createItem(input)

    updateItems((items) =>
      formTarget.mode === 'edit'
        ? items.map((current) => (current.id === saved.id ? saved : current))
        : [...items, saved],
    )
    // Se la categoria è cambiata (o è un piatto nuovo) portiamo l'utente dove il piatto si trova ora.
    setActiveCategory(saved.category)
    setFormTarget(null)
  }

  function askToDelete(item: MenuItem) {
    setDeleteError(null)
    setItemToDelete(item)
  }

  function cancelDelete() {
    setItemToDelete(null)
    setDeleteError(null)
  }

  async function confirmDelete() {
    if (!itemToDelete) return
    const target = itemToDelete
    const removeLocally = () => updateItems((items) => items.filter((item) => item.id !== target.id))

    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteItem(target.id)
      removeLocally()
      setItemToDelete(null)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // Qualcuno l'ha già eliminato: il risultato voluto è comunque raggiunto.
        removeLocally()
        setItemToDelete(null)
      } else {
        setDeleteError(errorMessage(error))
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-stone-900 px-4 py-5 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Gestione menù</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-stone-300 underline hover:text-white">
              ← Torna al menù
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-stone-500 px-3 py-1.5 text-stone-100 hover:bg-stone-800"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
          <CategoryTabs
            categories={CATEGORIES}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {actionError && (
          <div
            role="alert"
            className="m-4 flex items-start justify-between gap-3 rounded-xl border border-danger-line bg-danger-soft p-4 text-sm text-danger-deep"
          >
            <p>{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="shrink-0 font-semibold underline"
            >
              Chiudi
            </button>
          </div>
        )}

        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

        {state.status === 'success' && (
          <section
            id={PANEL_ID}
            role="tabpanel"
            aria-labelledby={tabId(activeCategory)}
            className="p-4"
          >
            <button
              type="button"
              onClick={() => setFormTarget({ mode: 'create' })}
              className="mb-4 w-full rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-strong"
            >
              + Aggiungi piatto
            </button>

            {visibleItems.length > 0 ? (
              <ul className="space-y-3">
                {visibleItems.map((item) => (
                  <AdminItemRow
                    key={item.id}
                    item={item}
                    pending={pendingIds.includes(item.id)}
                    onToggleAvailability={handleToggleAvailability}
                    onEdit={(target) => setFormTarget({ mode: 'edit', item: target })}
                    onDelete={askToDelete}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-stone-600">
                Nessun piatto in «{CATEGORY_LABELS[activeCategory]}».
              </p>
            )}
          </section>
        )}
      </main>

      {/* Il form non si chiude con un tocco sullo sfondo: non si perde quello che si è scritto. */}
      <Modal
        open={formTarget !== null}
        onClose={() => setFormTarget(null)}
        labelledBy="item-form-title"
        dismissOnBackdrop={false}
      >
        {formTarget && (
          <ItemForm
            item={formTarget.mode === 'edit' ? formTarget.item : undefined}
            defaultCategory={activeCategory}
            onSubmit={handleSave}
            onCancel={() => setFormTarget(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={itemToDelete !== null}
        title={`Eliminare «${itemToDelete?.title ?? ''}»?`}
        message="Il piatto sparirà dal menù dei clienti. L'operazione non si può annullare."
        confirmLabel="Elimina"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}

