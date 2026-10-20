import type { RowProblem } from '../types/loadResult'
import {
  ALLERGENS,
  ALLERGEN_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  type Allergen,
  type Category,
  type MenuItem,
} from '../types/menu'
import { parseCsv } from './csv'
import { parsePrice } from './format'

/**
 * Conversione del CSV di Google Fogli in piatti del menù.
 *
 * Principi:
 * 1. Le colonne si trovano per NOME dell'intestazione, non per posizione: se il cliente
 *    sposta o aggiunge colonne, il menù continua a funzionare.
 * 2. Mancano colonne obbligatorie (inclusi i 14 allergeni)? Non carichiamo il menù: un
 *    allergene mancante verrebbe letto come "assente", ed è il tipo di errore peggiore.
 * 3. Su un valore dubbio si sceglie sempre l'opzione PIÙ PRUDENTE per il cliente finale:
 *    allergene non riconosciuto = presente; "senza glutine" non riconosciuto = no.
 * 4. Una riga sbagliata viene scartata (e segnalata) senza far cadere tutto il menù.
 */

export interface ParsedSheet {
  items: MenuItem[]
  problems: RowProblem[]
}

/** Struttura del foglio non valida (es. colonne mancanti): il menù non può essere letto. */
export class SheetStructureError extends Error {
  readonly missing: string[]

  constructor(missing: string[]) {
    super(`Il foglio non ha la struttura attesa. Colonne mancanti: ${missing.join(', ')}.`)
    this.name = 'SheetStructureError'
    this.missing = missing
  }
}

/** Minuscolo, senza accenti, spazi/underscore ridotti a uno: "Frutta_a  guscio" -> "frutta a guscio". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[_\s]+/g, ' ')
    .trim()
}

const TRUE_VALUES = new Set(['true', 'vero', 'si', 'yes', '1', 'x', '✓', '✔'])
const FALSE_VALUES = new Set(['', 'false', 'falso', 'no', '0', '-'])

/** true / false se riconosciuto, null se il valore è strano (es. "forse"). */
function readBoolean(raw: string): boolean | null {
  const value = normalize(raw)
  if (TRUE_VALUES.has(value)) return true
  if (FALSE_VALUES.has(value)) return false
  return null
}

/** Accetta "7,50", "7.5", "€ 7,50", "7,50 €", "7,50€" (anche con spazi non separabili). */
export function parseSheetPrice(raw: string): number | null {
  const cleaned = raw.replace(/eur|€|\s/gi, '')
  return parsePrice(cleaned)
}

function readCategory(raw: string): Category | null {
  const value = normalize(raw)
  return (
    CATEGORIES.find(
      (category) => value === category || value === normalize(CATEGORY_LABELS[category]),
    ) ?? null
  )
}

function slugify(text: string): string {
  const slug = normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug === '' ? 'piatto' : slug
}

interface ColumnSpec {
  label: string
  key: string
}

const BASE_REQUIRED: ColumnSpec[] = [
  { label: 'Nome', key: 'nome' },
  { label: 'Categoria', key: 'categoria' },
  { label: 'Prezzo', key: 'prezzo' },
  { label: 'Disponibile', key: 'disponibile' },
  { label: 'Vegetariano', key: 'vegetariano' },
  { label: 'Senza glutine', key: 'senza glutine' },
]
const DESCRIPTION_KEY = 'descrizione' // facoltativa

export function parseMenuSheet(csvText: string): ParsedSheet {
  const rows = parseCsv(csvText)
  const header = rows[0] ?? []

  // nome normalizzato -> indice di colonna (vale la prima occorrenza)
  const columns = new Map<string, number>()
  header.forEach((name, index) => {
    const key = normalize(name)
    if (key !== '' && !columns.has(key)) columns.set(key, index)
  })

  const allergenColumns = ALLERGENS.map((allergen) => ({
    allergen,
    label: ALLERGEN_LABELS[allergen],
    key: normalize(ALLERGEN_LABELS[allergen]),
  }))

  const missing = [...BASE_REQUIRED, ...allergenColumns]
    .filter((column) => !columns.has(column.key))
    .map((column) => column.label)
  if (missing.length > 0) throw new SheetStructureError(missing)

  const col = (key: string) => columns.get(key)!
  const cell = (row: string[], index: number | undefined) =>
    index === undefined ? '' : (row[index] ?? '').trim()

  const items: MenuItem[] = []
  const problems: RowProblem[] = []
  const usedIds = new Map<string, number>()

  rows.slice(1).forEach((row, offset) => {
    const sheetRow = offset + 2 // riga 1 = intestazione
    if (row.every((value) => value.trim() === '')) return // riga vuota

    const problem = (level: RowProblem['level'], message: string) =>
      problems.push({ row: sheetRow, level, message })

    const title = cell(row, col('nome'))
    const category = readCategory(cell(row, col('categoria')))
    const price = parseSheetPrice(cell(row, col('prezzo')))

    let rowIsValid = true
    if (title === '') {
      problem('error', 'Manca il nome del piatto: riga ignorata.')
      rowIsValid = false
    }
    if (category === null) {
      problem(
        'error',
        `Categoria «${cell(row, col('categoria'))}» non riconosciuta (usa: ${CATEGORIES.map((c) => CATEGORY_LABELS[c]).join(', ')}): riga ignorata.`,
      )
      rowIsValid = false
    }
    if (price === null) {
      problem(
        'error',
        `Prezzo «${cell(row, col('prezzo'))}» non valido (esempio corretto: 7,50): riga ignorata.`,
      )
      rowIsValid = false
    }
    if (!rowIsValid || category === null || price === null) return

    /** Casella di controllo normale: valore dubbio -> false, con avviso. */
    const flag = (key: string, label: string): boolean => {
      const raw = cell(row, col(key))
      const value = readBoolean(raw)
      if (value === null) {
        problem('warning', `Valore «${raw}» non riconosciuto in «${label}»: considerato NO.`)
        return false
      }
      return value
    }

    const available = flag('disponibile', 'Disponibile')
    const isVegetarian = flag('vegetariano', 'Vegetariano')
    let isGlutenFree = flag('senza glutine', 'Senza glutine')

    const allergens: Allergen[] = []
    for (const { allergen, label, key } of allergenColumns) {
      const raw = cell(row, col(key))
      const value = readBoolean(raw)
      if (value === null) {
        // Prudenza: nel dubbio l'allergene c'è.
        problem('warning', `Valore «${raw}» non riconosciuto in «${label}»: considerato PRESENTE.`)
        allergens.push(allergen)
      } else if (value) {
        allergens.push(allergen)
      }
    }

    if (isGlutenFree && allergens.includes('glutine')) {
      problem(
        'warning',
        '«Senza glutine» e «Glutine» sono entrambi spuntati: il piatto è mostrato CON glutine. Correggi il foglio.',
      )
      isGlutenFree = false
    }

    // Id stabile e leggibile; i duplicati ricevono un suffisso così le liste React restano valide.
    const baseId = `${category}-${slugify(title)}`
    const seen = usedIds.get(baseId) ?? 0
    usedIds.set(baseId, seen + 1)
    if (seen > 0) problem('warning', `Piatto «${title}» ripetuto nella stessa categoria.`)

    items.push({
      id: seen === 0 ? baseId : `${baseId}-${seen + 1}`,
      title,
      description: cell(row, columns.get(DESCRIPTION_KEY)),
      price,
      category,
      isGlutenFree,
      isVegetarian,
      available,
      allergens,
    })
  })

  return { items, problems }
}
