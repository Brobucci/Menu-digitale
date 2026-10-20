import type { Allergen, Category, MenuItem, MenuItemInput } from '../../types/menu'
import { parsePrice, priceToInput } from '../../utils/format'

export const TITLE_MAX = 100
export const DESCRIPTION_MAX = 500

/**
 * Valori del form. Differiscono da MenuItemInput in un punto: il prezzo è un *testo*
 * (l'utente scrive "7,50"), che convertiamo in numero solo al momento dell'invio.
 */
export interface FormValues {
  title: string
  description: string
  price: string
  category: Category
  isVegetarian: boolean
  isGlutenFree: boolean
  available: boolean
  allergens: Allergen[]
}

/** I campi che possono avere un errore, nell'ordine in cui compaiono nel form. */
export const FIELD_ORDER = ['title', 'description', 'price', 'category', 'allergens'] as const
export type FieldName = (typeof FIELD_ORDER)[number]
export type FormErrors = Partial<Record<FieldName, string>>

export function isFieldName(value: string): value is FieldName {
  return (FIELD_ORDER as readonly string[]).includes(value)
}

/** Valori iniziali: quelli del piatto da modificare, oppure i default per un piatto nuovo. */
export function toFormValues(item: MenuItem | undefined, defaultCategory: Category): FormValues {
  if (item) {
    return {
      title: item.title,
      description: item.description,
      price: priceToInput(item.price),
      category: item.category,
      isVegetarian: item.isVegetarian,
      isGlutenFree: item.isGlutenFree,
      available: item.available,
      allergens: item.allergens,
    }
  }
  return {
    title: '',
    description: '',
    price: '',
    category: defaultCategory,
    isVegetarian: false,
    isGlutenFree: false,
    available: true,
    allergens: [],
  }
}

/** Validazione lato client. Il backend ripete i controlli: questo serve a dare risposte immediate. */
export function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  const title = values.title.trim()
  if (title === '') errors.title = 'Il nome del piatto è obbligatorio.'
  else if (title.length > TITLE_MAX) errors.title = `Massimo ${TITLE_MAX} caratteri.`

  if (values.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Massimo ${DESCRIPTION_MAX} caratteri.`
  }

  if (values.price.trim() === '') errors.price = 'Il prezzo è obbligatorio.'
  else if (parsePrice(values.price) === null) {
    errors.price = 'Inserisci un prezzo valido, ad esempio 7,50.'
  }

  // Dati contraddittori in un menù sono pericolosi: chi è celiaco si fida del badge.
  if (values.isGlutenFree && values.allergens.includes('glutine')) {
    errors.allergens =
      'Il piatto è segnato «Senza glutine» ma tra gli allergeni c’è il glutine. Correggi uno dei due.'
  }

  return errors
}

/** Converte i valori (già validati) nel payload da inviare al backend. */
export function toInput(values: FormValues): MenuItemInput {
  const price = parsePrice(values.price)
  if (price === null) throw new Error('Prezzo non valido')
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    price,
    category: values.category,
    isGlutenFree: values.isGlutenFree,
    isVegetarian: values.isVegetarian,
    available: values.available,
    allergens: values.allergens,
  }
}
