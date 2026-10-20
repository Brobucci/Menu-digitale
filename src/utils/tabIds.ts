import type { Category } from '../types/menu'

/** Id condivisi tra schede e pannello, per collegarli ad assistive technology (aria-controls/labelledby). */
export const tabId = (category: Category) => `tab-${category}`
export const PANEL_ID = 'menu-panel'
