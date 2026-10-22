/**
 * Da dove arrivano i dati del menù:
 * - 'api'   = backend Spring Boot (versione A, con pannello /admin)
 * - 'sheet' = foglio Google pubblicato come CSV (versione B, senza backend)
 *
 * Si sceglie all'avvio con la modalità di Vite:  `npm run dev`  oppure  `npm run dev:sheet`.
 */
export type MenuSource = 'api' | 'sheet'

export const MENU_SOURCE: MenuSource = import.meta.env.VITE_MENU_SOURCE === 'sheet' ? 'sheet' : 'api'
