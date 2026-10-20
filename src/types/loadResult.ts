import type { MenuItem } from './menu'

/** Un problema trovato leggendo il foglio. `row` è il numero di riga come lo vede l'utente nel foglio (0 = problema generale). */
export interface RowProblem {
  row: number
  /** 'error' = riga scartata; 'warning' = riga mantenuta ma con un valore corretto in modo prudente. */
  level: 'error' | 'warning'
  message: string
}

/** Risultato del caricamento del menù, qualunque sia la sorgente (backend o foglio). */
export interface MenuLoadResult {
  items: MenuItem[]
  problems: RowProblem[]
  /** true = non siamo riusciti ad aggiornare e mostriamo l'ultima copia salvata sul dispositivo. */
  stale: boolean
}
