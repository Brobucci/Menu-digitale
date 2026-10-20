interface AvailabilitySwitchProps {
  checked: boolean
  disabled?: boolean
  /** Etichetta per screen reader, es. "Disponibilità di Margherita". */
  label: string
  onChange: () => void
}

/** Interruttore accessibile (role="switch") per segnare un piatto disponibile/esaurito. */
export function AvailabilitySwitch({ checked, disabled = false, label, onChange }: AvailabilitySwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        checked ? 'bg-green-600' : 'bg-stone-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
