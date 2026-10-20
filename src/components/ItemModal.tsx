import { Modal } from './Modal'
import { formatPrice } from '../utils/format'
import { ALLERGEN_LABELS, CATEGORY_LABELS, type MenuItem } from '../types/menu'
import { DietBadges, SoldOutBadge } from './Badges'

interface ItemModalProps {
  /** Il piatto da mostrare; null = modal chiuso. */
  item: MenuItem | null
  onClose: () => void
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  return (
    <Modal open={item !== null} onClose={onClose} labelledBy="item-modal-title">
      {item && (
        <div className="p-5">
          <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
            {CATEGORY_LABELS[item.category]}
          </p>

          <div className="mt-1 flex items-start justify-between gap-3">
            <h2 id="item-modal-title" className="text-xl font-bold">
              {item.title}
            </h2>
            <span className="shrink-0 text-lg font-bold text-red-700">
              {formatPrice(item.price)}
            </span>
          </div>

          {item.description && <p className="mt-3 text-stone-700">{item.description}</p>}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {!item.available && <SoldOutBadge />}
            <DietBadges item={item} />
          </div>

          <section className="mt-5">
            <h3 className="text-sm font-semibold text-stone-900">Allergeni</h3>
            {item.allergens.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {item.allergens.map((allergen) => (
                  <li
                    key={allergen}
                    className="rounded-md bg-red-50 px-2 py-1 text-sm text-red-800"
                  >
                    {ALLERGEN_LABELS[allergen]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-stone-600">Nessun allergene dichiarato.</p>
            )}
          </section>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-stone-900 py-3 font-semibold text-white hover:bg-stone-800"
          >
            Chiudi
          </button>
        </div>
      )}
    </Modal>
  )
}

