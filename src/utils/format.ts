const priceFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const PRICE_PATTERN = /^\d{1,4}([.,]\d{1,2})?$/

/** 7.5 -> "7,50 €" */
export function formatPrice(value: number): string {
  return priceFormatter.format(value)
}

/** Restituisce il prezzo come numero, oppure null se il testo non è valido. */
export function parsePrice(text: string): number | null {
  const trimmed = text.trim()
  if (!PRICE_PATTERN.test(trimmed)) return null
  return Number(trimmed.replace(',', '.'))
}

/** 7.5 -> "7,50": come lo scrive e lo legge chi gestisce il menù. */
export function priceToInput(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

