import { useMemo, useState } from 'react'
import { useMenu } from '../hooks/useMenu'
import { CATEGORIES, CATEGORY_LABELS, type Category, type MenuItem } from '../types/menu'
import { PANEL_ID, tabId } from '../utils/tabIds'
import { CategoryTabs } from '../components/CategoryTabs'
import { FilterBar } from '../components/FilterBar'
import { ItemModal } from '../components/ItemModal'
import { MenuNotices } from '../components/MenuNotices'
import { MenuItemCard } from '../components/MenuItemCard'
import { ErrorState, LoadingState } from '../components/MenuStates'

export function MenuPage() {
  const { state, reload } = useMenu()

  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0])
  const [onlyVegetarian, setOnlyVegetarian] = useState(false)
  const [onlyGlutenFree, setOnlyGlutenFree] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const items = state.status === 'success' ? state.items : null

  // Dati derivati: li calcoliamo dallo stato invece di duplicarli in altro stato.
  const visibleItems = useMemo(() => {
    if (!items) return []
    return items.filter(
      (item) =>
        item.category === activeCategory &&
        (!onlyVegetarian || item.isVegetarian) &&
        (!onlyGlutenFree || item.isGlutenFree),
    )
  }, [items, activeCategory, onlyVegetarian, onlyGlutenFree])

  return (
    <>
      {/* Sticky: restano visibili mentre si scorre l'elenco, utile da telefono. */}
      <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <CategoryTabs
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />
        <FilterBar
          onlyVegetarian={onlyVegetarian}
          onlyGlutenFree={onlyGlutenFree}
          onToggleVegetarian={() => setOnlyVegetarian((value) => !value)}
          onToggleGlutenFree={() => setOnlyGlutenFree((value) => !value)}
        />
      </div>

      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'success' && (
        <MenuNotices stale={state.stale} problems={state.problems} />
      )}

      {state.status === 'success' && (
        <section
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={tabId(activeCategory)}
          className="p-4"
        >
          {visibleItems.length > 0 ? (
            <ul className="space-y-3">
              {visibleItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onSelect={setSelectedItem} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-stone-600">
              Nessun piatto in «{CATEGORY_LABELS[activeCategory]}» con i filtri selezionati.
            </p>
          )}
        </section>
      )}

      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  )
}