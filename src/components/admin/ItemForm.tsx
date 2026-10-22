import { useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../../api/menuApi'
import {
  DESCRIPTION_MAX,
  FIELD_ORDER,
  TITLE_MAX,
  isFieldName,
  toFormValues,
  toInput,
  validate,
  type FieldName,
  type FormErrors,
  type FormValues,
} from './ItemForm'
import {
  ALLERGENS,
  ALLERGEN_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  type Allergen,
  type Category,
  type MenuItem,
  type MenuItemInput,
} from '../../types/menu'
import { FormField } from './FormField'

interface ItemFormProps {
  /** Piatto da modificare; undefined = nuovo piatto. */
  item?: MenuItem
  /** Categoria preselezionata per un nuovo piatto (quella della scheda aperta). */
  defaultCategory: Category
  /** Salva il piatto. Deve lanciare l'errore (ApiError) se il salvataggio fallisce. */
  onSubmit: (input: MenuItemInput) => Promise<void>
  onCancel: () => void
}

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none aria-invalid:border-danger'

export function ItemForm({ item, defaultCategory, onSubmit, onCancel }: ItemFormProps) {
  const isEdit = item !== undefined

  const [values, setValues] = useState<FormValues>(() => toFormValues(item, defaultCategory))
  // Gli errori compaiono solo dopo il primo tentativo di salvataggio: niente rosso mentre si scrive.
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Errori derivati dai valori correnti: si aggiornano mentre l'utente corregge.
  const clientErrors = validate(values)
  const errors: FormErrors = submitted ? { ...serverErrors, ...clientErrors } : {}

  /** Campo -> attributi comuni (id, name, stato di errore) per i controlli di testo. */
  function fieldProps(name: 'title' | 'description' | 'price') {
    return {
      id: `item-${name}`,
      name,
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `item-${name}-error` : undefined,
    }
  }

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    // Gli errori del server si riferiscono ai valori inviati: dopo una modifica sono "vecchi".
    setServerErrors({})
    setGeneralError(null)
  }

  function toggleAllergen(allergen: Allergen) {
    const selected = new Set(values.allergens)
    if (selected.has(allergen)) selected.delete(allergen)
    else selected.add(allergen)
    // Manteniamo l'ordine canonico, così il JSON salvato è sempre ordinato allo stesso modo.
    update('allergens', ALLERGENS.filter((a) => selected.has(a)))
  }

  function focusField(name: FieldName) {
    formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`)?.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setGeneralError(null)

    const firstInvalid = FIELD_ORDER.find((field) => clientErrors[field])
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(toInput(values))
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        const mapped: FormErrors = {}
        const unmapped: string[] = []
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (isFieldName(field)) mapped[field] = message
          else unmapped.push(`${field}: ${message}`)
        }
        setServerErrors(mapped)
        if (unmapped.length > 0) setGeneralError(`Dati non validi (${unmapped.join('; ')}).`)
        else if (Object.keys(mapped).length === 0) setGeneralError(error.message)
      } else {
        setGeneralError(error instanceof Error ? error.message : 'Si è verificato un errore imprevisto.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="p-5">
      <h2 id="item-form-title" className="text-xl font-bold">
        {isEdit ? 'Modifica piatto' : 'Nuovo piatto'}
      </h2>

      {/* Durante il salvataggio tutti i campi sono bloccati. */}
      <fieldset disabled={submitting} className="mt-4 space-y-4">
        <FormField id="item-title" label="Nome" error={errors.title}>
          <input type="text" maxLength={TITLE_MAX + 20} className={inputClass} {...fieldProps('title')}
            value={values.title} onChange={(e) => update('title', e.target.value)} autoComplete="off" />
        </FormField>

        <FormField id="item-description" label="Descrizione" error={errors.description}
          hint={`${values.description.length}/${DESCRIPTION_MAX} caratteri`}>
          <textarea rows={3} className={inputClass} {...fieldProps('description')}
            value={values.description} onChange={(e) => update('description', e.target.value)} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="item-price" label="Prezzo (€)" error={errors.price} hint="Es. 7,50">
            {/* Testo e non type="number": chi scrive "7,50" non deve ricevere un campo che lo rifiuta. */}
            <input type="text" inputMode="decimal" className={inputClass} {...fieldProps('price')}
              value={values.price} onChange={(e) => update('price', e.target.value)} autoComplete="off" />
          </FormField>

          <FormField id="item-category" label="Categoria" error={errors.category}>
            <select id="item-category" name="category" className={inputClass} value={values.category}
              onChange={(e) => update('category', e.target.value as Category)}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="space-y-2">
          {([
            ['isVegetarian', 'Vegetariano'],
            ['isGlutenFree', 'Senza glutine'],
            ['available', 'Disponibile'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-stone-800">
              <input type="checkbox" name={key} className="size-5 accent-brand"
                checked={values[key]} onChange={(e) => update(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <fieldset aria-describedby={errors.allergens ? 'item-allergens-error' : undefined}
          className="rounded-lg border border-stone-200 p-3">
          <legend className="px-1 text-sm font-medium text-stone-800">Allergeni</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {ALLERGENS.map((allergen) => (
              <label key={allergen} className="flex items-center gap-2 text-sm text-stone-800">
                <input type="checkbox" name="allergens" className="size-4 accent-brand"
                  checked={values.allergens.includes(allergen)} onChange={() => toggleAllergen(allergen)} />
                {ALLERGEN_LABELS[allergen]}
              </label>
            ))}
          </div>
          {errors.allergens && (
            <p id="item-allergens-error" className="mt-2 text-sm text-danger">{errors.allergens}</p>
          )}
        </fieldset>
      </fieldset>

      {generalError && (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-danger-strong">{generalError}</p>
      )}

      {/* Barra pulsanti fissa in fondo: su telefono il form è lungo e i pulsanti restano a portata. */}
      <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex gap-3 border-t border-stone-200 bg-white px-5 py-3">
        <button type="button" onClick={onCancel} disabled={submitting}
          className="flex-1 rounded-xl border border-stone-300 py-3 font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60">
          Annulla
        </button>
        <button type="submit" disabled={submitting}
          className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-strong disabled:opacity-60">
          {submitting ? 'Salvo…' : 'Salva'}
        </button>
      </div>
    </form>
  )
}
