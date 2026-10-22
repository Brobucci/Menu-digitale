import { formatPrice } from '../utils/format'
import type { MenuItem } from '../types/menu'
import { DietBadges, SoldOutBadge } from './Badges'

interface MenuItemCardProps {
  item: MenuItem
  onSelect: (item: MenuItem) => void
}

/**
 * L'intera card è un <button>: è cliccabile/tappabile, raggiungibile da tastiera e annunciata
 * correttamente dagli screen reader, senza codice extra.
 */
export function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={`w-full rounded-xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-stone-300 hover:shadow ${
          item.available ? '' : 'opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-stone-900">{item.title}</h3>
          <span
            className={`shrink-0 font-semibold ${
              item.available ? 'text-brand' : 'text-stone-500 line-through'
            }`}
          >
            {formatPrice(item.price)}
          </span>
        </div>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">{item.description}</p>
        )}

        {(!item.available || item.isVegetarian || item.isGlutenFree) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {!item.available && <SoldOutBadge />}
            <DietBadges item={item} />
          </div>
        )}
      </button>
    </li>
  )
}