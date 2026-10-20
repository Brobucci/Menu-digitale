import { clearSession, getToken } from './tokenStorage'

export const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** Forma della risposta d'errore del backend (RFC 9457 Problem Details). */
interface ProblemDetail {
  title?: string
  detail?: string
  /** Presente nei 400 di validazione: campo -> messaggio. */
  errors?: Record<string, string>
}

/** Errore "atteso" delle API: il messaggio è pensato per essere mostrato all'utente. */
export class ApiError extends Error {
  status?: number
  fieldErrors?: Record<string, string>

  constructor(message: string, status?: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/**
 * Wrapper unico di fetch: tutte le chiamate passano da qui, così gestione errori, token e
 * sessione scaduta stanno in un solo posto.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    })
  } catch (error) {
    // Una richiesta annullata (AbortController) non è un errore da mostrare: la rilanciamo com'è.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('Impossibile contattare il server. Controlla la connessione e riprova.')
  }

  // 401 con un token inviato = sessione scaduta o revocata: si torna alla schermata di login.
  // (Un 401 senza token, cioè una password sbagliata al login, non tocca nulla.)
  if (response.status === 401 && token) {
    clearSession(true)
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ProblemDetail | null
    throw new ApiError(
      response.status === 401 && token
        ? 'Sessione scaduta: accedi di nuovo.'
        : (problem?.detail ?? problem?.title ?? `Errore del server (${response.status})`),
      response.status,
      problem?.errors,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Opzioni fetch per una richiesta con body JSON. */
export function jsonRequest(method: 'POST' | 'PUT' | 'PATCH', body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}
