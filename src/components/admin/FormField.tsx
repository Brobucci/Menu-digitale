import type { ReactNode } from 'react'

interface FormFieldProps {
  /** Id del controllo: collega l'etichetta e il messaggio d'errore (`${id}-error`). */
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

/** Etichetta + controllo + messaggio d'errore, con i collegamenti ARIA già fatti. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>
      )}
    </div>
  )
}