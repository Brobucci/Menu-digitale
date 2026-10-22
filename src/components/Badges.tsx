import type { MenuItem } from '../types/menu'

const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'

export function DietBadges({ item }: { item: Pick<MenuItem, 'isVegetarian' | 'isGlutenFree'> }) {
  if (!item.isVegetarian && !item.isGlutenFree) return null
  return (
    <>
      {item.isVegetarian && (
        <span className={`${base} bg-success-chip text-success-text`}>Vegetariano</span>
      )}
      {item.isGlutenFree && (
        <span className={`${base} bg-warning-chip text-warning-text`}>Senza glutine</span>
      )}
    </>
  )
}

export function SoldOutBadge() {
  return <span className={`${base} bg-stone-200 text-stone-700`}>Esaurito</span>
}