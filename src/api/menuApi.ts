import type { MenuData, MenuItem, MenuItemInput } from '../types/menu'
import { jsonRequest, request } from './http'

export { ApiError } from './http'

export function fetchMenu(signal?: AbortSignal): Promise<MenuData> {
  return request<MenuData>('/api/menu', { signal })
}

/** Crea un piatto: l'id lo assegna il backend, che restituisce il piatto salvato. */
export function createItem(input: MenuItemInput): Promise<MenuItem> {
  return request<MenuItem>('/api/menu/items', jsonRequest('POST', input))
}

/** Sostituisce i dati di un piatto (l'id nel body, se presente, viene ignorato dal backend). */
export function updateItem(id: string, input: MenuItemInput): Promise<MenuItem> {
  return request<MenuItem>(`/api/menu/items/${encodeURIComponent(id)}`, jsonRequest('PUT', input))
}

/** Toggle rapido disponibile/esaurito, senza reinviare tutto il piatto. */
export function setAvailability(id: string, available: boolean): Promise<MenuItem> {
  return request<MenuItem>(
    `/api/menu/items/${encodeURIComponent(id)}/availability`,
    jsonRequest('PATCH', { available }),
  )
}

export function deleteItem(id: string): Promise<void> {
  return request<void>(`/api/menu/items/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
