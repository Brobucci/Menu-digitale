interface FilterBarProps {
  onlyVegetarian: boolean
  onlyGlutenFree: boolean
  onToggleVegetarian: () => void
  onToggleGlutenFree: () => void
}

interface ToggleProps {
  label: string
  pressed: boolean
  onClick: () => void
}

function FilterToggle({ label, pressed, onClick }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        pressed
          ? 'border-red-700 bg-red-50 text-red-800'
          : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
      }`}
    >
      {pressed && <span aria-hidden="true">✓ </span>}
      {label}
    </button>
  )
}

export function FilterBar(props: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3" role="group" aria-label="Filtri alimentari">
      <FilterToggle
        label="Vegetariano"
        pressed={props.onlyVegetarian}
        onClick={props.onToggleVegetarian}
      />
      <FilterToggle
        label="Senza glutine"
        pressed={props.onlyGlutenFree}
        onClick={props.onToggleGlutenFree}
      />
    </div>
  )
}
