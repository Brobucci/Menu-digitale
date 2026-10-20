/**
 * Tipi del menù digitale.
 * Devono restare allineati al modello Java (MenuItem, Category, Allergen, MenuData)
 * e alla struttura di menu.json.
 */
 
/** Categorie del menù. L'ordine dell'array è l'ordine di visualizzazione delle schede. */
export const CATEGORIES = ['antipasti', 'pizze', 'bevande'] as const;
export type Category = (typeof CATEGORIES)[number];
 
export const CATEGORY_LABELS: Record<Category, string> = {
  antipasti: 'Antipasti',
  pizze: 'Pizze',
  bevande: 'Bevande',
};
 
/** I 14 allergeni a dichiarazione obbligatoria (Reg. UE 1169/2011). */
export const ALLERGENS = [
  'glutine',
  'crostacei',
  'uova',
  'pesce',
  'arachidi',
  'soia',
  'latte',
  'frutta_a_guscio',
  'sedano',
  'senape',
  'sesamo',
  'solfiti',
  'lupini',
  'molluschi',
] as const;
export type Allergen = (typeof ALLERGENS)[number];
 
export const ALLERGEN_LABELS: Record<Allergen, string> = {
  glutine: 'Glutine',
  crostacei: 'Crostacei',
  uova: 'Uova',
  pesce: 'Pesce',
  arachidi: 'Arachidi',
  soia: 'Soia',
  latte: 'Latte',
  frutta_a_guscio: 'Frutta a guscio',
  sedano: 'Sedano',
  senape: 'Senape',
  sesamo: 'Sesamo',
  solfiti: 'Solfiti',
  lupini: 'Lupini',
  molluschi: 'Molluschi',
};
 
/** Un piatto o una bevanda del menù. */
export interface MenuItem {
  /** Generato dal backend alla creazione. */
  id: string;
  title: string;
  description: string;
  /** Prezzo in euro (es. 7.5). */
  price: number;
  category: Category;
  isGlutenFree: boolean;
  isVegetarian: boolean;
  /** false = esaurito/non disponibile: resta nel menù ma viene segnalato al cliente. */
  available: boolean;
  allergens: Allergen[];
}
 
/** Payload per creare un piatto (l'id lo assegna il backend). */
export type MenuItemInput = Omit<MenuItem, 'id'>;
 
/** Radice del file menu.json e risposta di GET /api/menu. */
export interface MenuData {
  items: MenuItem[];
}