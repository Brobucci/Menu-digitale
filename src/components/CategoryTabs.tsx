import { PANEL_ID, tabId } from '../utils/tabIds'
import { CATEGORY_LABELS, type Category } from '../types/menu'

interface CategoryTabsProps {
  categories: readonly Category[]
  active: Category
  onChange: (category: Category) => void
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Categorie del menù"
      className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-none]"
    >
      {categories.map((category) => {
        const selected = category === active
        return (
          <button
            key={category}
            id={tabId(category)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={PANEL_ID}
            onClick={() => onChange(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selected
                ? 'bg-red-700 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        )
      })}
    </div>
  )
}
