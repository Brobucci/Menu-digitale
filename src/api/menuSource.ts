import { MENU_SOURCE } from '../config'
import type { MenuLoadResult } from '../types/loadResult'
import { fetchMenu } from './menuApi'
import { fetchMenuFromSheet } from './sheetSource'

/**
 * Unico punto in cui l'app decide da dove leggere il menù. Il resto dell'interfaccia
 * (hook, pagine, componenti) non sa se i dati vengono dal backend o dal foglio.
 */
export async function loadMenu(signal?: AbortSignal): Promise<MenuLoadResult> {
  if (MENU_SOURCE === 'sheet') return fetchMenuFromSheet(signal)

  const menu = await fetchMenu(signal)
  return { items: menu.items, problems: [], stale: false }
}
