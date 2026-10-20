import { parseMenuSheet } from '../utils/sheetMapping'
import type { MenuLoadResult } from '../types/loadResult'
import { CATEGORIES, type MenuItem } from '../types/menu'

const SHEET_URL = import.meta.env.VITE_SHEET_CSV_URL?.trim()

/** Chiave della copia salvata nel browser. Il suffisso di versione permette di invalidarla se il formato cambia. */
const CACHE_KEY = 'menu-sheet-last-good-v1'

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function download(signal?: AbortSignal) {
  let response: Response
  try {
    response = await fetch(SHEET_URL!, { signal, cache: 'no-cache' })
  } catch (error) {
    if (isAbort(error)) throw error
    // Un blocco CORS del browser arriva qui come un normale errore di rete: i dettagli sono in console.
    console.error('[menu] richiesta al foglio fallita', error)
    throw new Error('Impossibile contattare Google Fogli. Controlla la connessione e riprova.')
  }

  if (!response.ok) {
    throw new Error(
      `Google Fogli ha risposto con errore ${response.status}. Controlla che il foglio sia pubblicato sul web.`,
    )
  }
  // Un foglio non pubblicato risponde con una pagina HTML (login), non con un CSV.
  if ((response.headers.get('content-type') ?? '').includes('text/html')) {
    throw new Error('Il link del foglio non restituisce un CSV. Il foglio è pubblicato sul web in formato CSV?')
  }

  return parseMenuSheet(await response.text())
}

/** Controllo minimo che i dati letti dal browser abbiano la forma di un piatto. */
function looksLikeMenuItem(value: unknown): value is MenuItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    typeof item.available === 'boolean' &&
    Array.isArray(item.allergens) &&
    CATEGORIES.includes(item.category as never)
  )
}

function saveCache(items: MenuItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items))
  } catch {
    // Memoria piena, navigazione privata o storage bloccato: il menù funziona lo stesso.
  }
}

function readCache(): MenuItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 && parsed.every(looksLikeMenuItem) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Legge il menù dal foglio. Se non ci riesce (rete, Google, foglio rotto) ma sul dispositivo
 * c'è l'ultima versione valida, mostra quella segnalando che è "datata": meglio un menù
 * vecchio di qualche ora che una pagina vuota al tavolo.
 */
export async function fetchMenuFromSheet(signal?: AbortSignal): Promise<MenuLoadResult> {
  if (!SHEET_URL) {
    throw new Error('Indirizzo del foglio non configurato: manca VITE_SHEET_CSV_URL in .env.sheet.local.')
  }

  try {
    const { items, problems } = await download(signal)
    saveCache(items)
    return { items, problems, stale: false }
  } catch (error) {
    if (isAbort(error)) throw error
    const cached = readCache()
    if (!cached) throw error
    const message = error instanceof Error ? error.message : 'Errore sconosciuto.'
    return { items: cached, problems: [{ row: 0, level: 'error', message }], stale: true }
  }
}
