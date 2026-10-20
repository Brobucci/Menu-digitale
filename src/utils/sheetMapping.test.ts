import { describe, expect, it } from 'vitest'
import template from '../../sheet-template/menu-template.csv?raw'
import { ALLERGENS, ALLERGEN_LABELS } from '../types/menu'
import { SheetStructureError, parseMenuSheet, parseSheetPrice } from './sheetMapping'

const ALLERGEN_HEADERS = ALLERGENS.map((a) => ALLERGEN_LABELS[a])
const BASE_HEADERS = ['Nome', 'Categoria', 'Prezzo', 'Descrizione', 'Disponibile', 'Vegetariano', 'Senza glutine']

/**
 * Costruisce un CSV di prova. `row` sovrascrive solo i campi indicati; il resto è un piatto
 * valido e senza allergeni. Le chiavi sono i nomi delle colonne.
 */
function sheet(rows: Record<string, string>[], headers = [...BASE_HEADERS, ...ALLERGEN_HEADERS]): string {
  const defaults: Record<string, string> = {
    Nome: 'Piatto', Categoria: 'Pizze', Prezzo: '5,00', Descrizione: '',
    Disponibile: 'TRUE', Vegetariano: 'FALSE', 'Senza glutine': 'FALSE',
  }
  const lines = rows.map((row) =>
    headers.map((h) => `"${(row[h] ?? defaults[h] ?? 'FALSE').replaceAll('"', '""')}"`).join(','),
  )
  return [headers.map((h) => `"${h}"`).join(','), ...lines].join('\n')
}

describe('modello del foglio', () => {
  it('il file modello viene letto per intero e senza problemi', () => {
    const { items, problems } = parseMenuSheet(template)
    expect(problems).toEqual([])
    expect(items).toHaveLength(14)
    expect(new Set(items.map((i) => i.id)).size).toBe(14)
  })

  it('i dati del modello sono quelli attesi', () => {
    const { items } = parseMenuSheet(template)
    const bruschette = items.find((i) => i.title === 'Bruschette miste')!
    expect(bruschette).toMatchObject({ category: 'antipasti', price: 7.5, available: true, isVegetarian: false })
    expect(bruschette.allergens).toEqual(['glutine', 'pesce', 'latte'])
    const senzaGlutine = items.find((i) => i.title === 'Margherita senza glutine')!
    expect(senzaGlutine).toMatchObject({ isGlutenFree: true, isVegetarian: true })
    expect(senzaGlutine.allergens).toEqual(['latte'])
    expect(items.find((i) => i.title === 'Frittura di verdure')!.available).toBe(false)
  })
})

describe('struttura delle colonne', () => {
  it('trova le colonne per nome anche se sono in ordine diverso o ce ne sono di extra', () => {
    const headers = ['Note', ...ALLERGEN_HEADERS.slice().reverse(), ...BASE_HEADERS.slice().reverse()]
    const { items, problems } = parseMenuSheet(sheet([{ Nome: 'Diavola', Glutine: 'TRUE', Note: 'x' }], headers))
    expect(problems).toEqual([])
    expect(items[0]).toMatchObject({ title: 'Diavola', allergens: ['glutine'] })
  })

  it('ignora maiuscole, accenti e underscore nelle intestazioni', () => {
    const headers = BASE_HEADERS.map((h) => h.toUpperCase()).concat(ALLERGEN_HEADERS.map((h) => h.replaceAll(' ', '_')))
    const { items } = parseMenuSheet(sheet([{ NOME: 'X', CATEGORIA: 'pizze', PREZZO: '4', Frutta_a_guscio: 'TRUE' }], headers))
    expect(items[0].allergens).toEqual(['frutta_a_guscio'])
  })

  it('senza una colonna allergene rifiuta TUTTO il menù (un allergene mancante sarebbe "assente")', () => {
    const headers = [...BASE_HEADERS, ...ALLERGEN_HEADERS.filter((h) => h !== 'Glutine')]
    expect(() => parseMenuSheet(sheet([{}], headers))).toThrow(SheetStructureError)
    try {
      parseMenuSheet(sheet([{}], headers))
    } catch (error) {
      expect((error as SheetStructureError).missing).toEqual(['Glutine'])
    }
  })

  it('la colonna Descrizione è facoltativa', () => {
    const headers = [...BASE_HEADERS.filter((h) => h !== 'Descrizione'), ...ALLERGEN_HEADERS]
    expect(parseMenuSheet(sheet([{}], headers)).items[0].description).toBe('')
  })

  it('un CSV vuoto o una pagina HTML non sono un foglio valido', () => {
    expect(() => parseMenuSheet('')).toThrow(SheetStructureError)
    expect(() => parseMenuSheet('<!DOCTYPE html><html><body>Accedi</body></html>')).toThrow(SheetStructureError)
  })
})

describe('prezzi', () => {
  it.each([
    ['7,50', 7.5], ['7.5', 7.5], ['€ 7,50', 7.5], ['7,50 €', 7.5], ['7,50€', 7.5],
    ['7 €', 7], ['EUR 12', 12], ['0', 0],
  ])('«%s» -> %s', (raw, expected) => {
    expect(parseSheetPrice(raw)).toBe(expected)
  })

  it.each([['', 'vuoto'], ['abc', 'testo'], ['-3', 'negativo'], ['1.234,50', 'migliaia'], ['7,555', 'tre decimali']])(
    '«%s» (%s) non è valido',
    (raw) => {
      expect(parseSheetPrice(raw)).toBeNull()
    },
  )
})

describe('righe', () => {
  it('scarta le righe sbagliate, le segnala col numero di riga del foglio, e tiene le altre', () => {
    const { items, problems } = parseMenuSheet(
      sheet([{ Nome: 'Ok 1' }, { Nome: 'Prezzo rotto', Prezzo: 'boh' }, { Nome: 'Ok 2' }, { Nome: 'Cat rotta', Categoria: 'Dolci' }, { Nome: '' }]),
    )
    expect(items.map((i) => i.title)).toEqual(['Ok 1', 'Ok 2'])
    expect(problems.map((p) => [p.row, p.level])).toEqual([[3, 'error'], [5, 'error'], [6, 'error']])
    expect(problems[0].message).toContain('boh')
    expect(problems[1].message).toContain('Dolci')
  })

  it('ignora le righe completamente vuote senza segnalarle', () => {
    const { items, problems } = parseMenuSheet(sheet([{ Nome: 'A' }]) + '\n' + ','.repeat(20) + '\n\n')
    expect(items).toHaveLength(1)
    expect(problems).toEqual([])
  })

  it('accetta la categoria in qualunque maiuscola', () => {
    expect(parseMenuSheet(sheet([{ Categoria: 'BEVANDE' }])).items[0].category).toBe('bevande')
  })

  it('riconosce vero/falso in italiano e in inglese', () => {
    const { items, problems } = parseMenuSheet(sheet([{ Disponibile: 'VERO', Vegetariano: 'Sì', 'Senza glutine': 'FALSO' }]))
    expect(problems).toEqual([])
    expect(items[0]).toMatchObject({ available: true, isVegetarian: true, isGlutenFree: false })
  })

  it('i piatti ripetuti ricevono id diversi e un avviso', () => {
    const { items, problems } = parseMenuSheet(sheet([{ Nome: 'Margherita' }, { Nome: 'Margherita' }]))
    expect(items.map((i) => i.id)).toEqual(['pizze-margherita', 'pizze-margherita-2'])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatchObject({ row: 3, level: 'warning' })
  })

  it('mantiene l\'ordine delle righe del foglio', () => {
    const { items } = parseMenuSheet(sheet([{ Nome: 'C' }, { Nome: 'A' }, { Nome: 'B' }]))
    expect(items.map((i) => i.title)).toEqual(['C', 'A', 'B'])
  })
})

describe('regole prudenti (sicurezza alimentare)', () => {
  it('un valore strano in una colonna allergene vale PRESENTE, con avviso', () => {
    const { items, problems } = parseMenuSheet(sheet([{ Sesamo: 'forse' }]))
    expect(items[0].allergens).toEqual(['sesamo'])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatchObject({ level: 'warning' })
    expect(problems[0].message).toContain('PRESENTE')
  })

  it('un valore strano in «Senza glutine» vale NO, con avviso', () => {
    const { items, problems } = parseMenuSheet(sheet([{ 'Senza glutine': 'boh' }]))
    expect(items[0].isGlutenFree).toBe(false)
    expect(problems).toHaveLength(1)
  })

  it('«Senza glutine» + «Glutine» insieme: il piatto è mostrato CON glutine', () => {
    const { items, problems } = parseMenuSheet(sheet([{ 'Senza glutine': 'TRUE', Glutine: 'TRUE' }]))
    expect(items[0].isGlutenFree).toBe(false)
    expect(items[0].allergens).toContain('glutine')
    expect(problems[0].message).toContain('CON glutine')
  })

  it('«Senza glutine» con altri allergeni (non glutine) resta valido', () => {
    const { items, problems } = parseMenuSheet(sheet([{ 'Senza glutine': 'TRUE', Latte: 'TRUE' }]))
    expect(items[0].isGlutenFree).toBe(true)
    expect(problems).toEqual([])
  })

  it('una cella allergene vuota vale assente (nessun avviso)', () => {
    const { items, problems } = parseMenuSheet(sheet([{ Uova: '' }]))
    expect(items[0].allergens).toEqual([])
    expect(problems).toEqual([])
  })
})
