import { formatPrice } from '../../utils/format'
import type { MenuItem } from '../../types/menu'
import { DietBadges } from '../Badges'
import { AvailabilitySwitch } from './AvailabilitySwitch'

interface AdminItemRowProps {
  item: MenuItem
  /** true mentre è in corso il salvataggio della disponibilità di questo piatto. */
  pending: boolean
  onToggleAvailability: (item: MenuItem) => void
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}

export function AdminItemRow({ item, pending, onToggleAvailability, onEdit, onDelete }: AdminItemRowProps) {
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className={`font-semibold ${item.available ? 'text-stone-900' : 'text-stone-500'}`}>
          {item.title}
        </h3>
        <span className="shrink-0 font-semibold text-stone-700">{formatPrice(item.price)}</span>
      </div>

      {(item.isVegetarian || item.isGlutenFree) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <DietBadges item={item} />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
        <div className="flex items-center gap-3">
          <AvailabilitySwitch
            checked={item.available}
            disabled={pending}
            label={`Disponibilità di ${item.title}`}
            onChange={() => onToggleAvailability(item)}
          />
          <span className="text-sm text-stone-600">
            {item.available ? 'Disponibile' : 'Esaurito'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Modifica ${item.title}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Modifica
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={`Elimina ${item.title}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger-soft"
          >
            Elimina
          </button>
        </div>
      </div>
    </li>
  )
}



