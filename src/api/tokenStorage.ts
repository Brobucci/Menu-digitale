/**
 * Dove vive il token di accesso dell'admin.
 *
 * - sessionStorage: sopravvive al ricarico della pagina ma sparisce chiudendo la scheda.
 *   (Non è invulnerabile: uno script malevolo nella pagina potrebbe leggerlo. La difesa vera è
 *   non avere script di terzi e non usare dangerouslySetInnerHTML; vedi README-STEP5A.)
 * - Se sessionStorage non è disponibile (navigazione privata restrittiva) il token resta solo in
 *   memoria: il login funziona, ma un ricarico richiede di rientrare.
 *
 * Lo stato è osservabile (subscribe/getSnapshot) così React lo legge con useSyncExternalStore.
 */

const STORAGE_KEY = 'menu-admin-session-v1'

export interface SessionState {
  token: string | null
  /** true se l'ultima uscita è avvenuta perché il server ha rifiutato il token (scaduto). */
  expired: boolean
}

interface StoredSession {
  token: string
  expiresAt: number // millisecondi
}

function readStored(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (typeof parsed.token !== 'string' || typeof parsed.expiresAt !== 'number') return null
    if (parsed.expiresAt <= Date.now()) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed.token
  } catch {
    return null
  }
}

let state: SessionState = { token: readStored(), expired: false }
const listeners = new Set<() => void>()

function publish(next: SessionState) {
  state = next
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): SessionState {
  return state
}

export function getToken(): string | null {
  return state.token
}

/** `expiresAt`: ISO 8601 restituito dal backend. */
export function setSession(token: string, expiresAt: string): void {
  const expiresMs = Date.parse(expiresAt)
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, expiresAt: Number.isNaN(expiresMs) ? Date.now() + 3600_000 : expiresMs }),
    )
  } catch {
    /* solo in memoria */
  }
  publish({ token, expired: false })
}

/** `expired`: passa true quando è il server a non accettare più il token. */
export function clearSession(expired = false): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* niente da fare */
  }
  if (state.token === null && state.expired === expired) return
  publish({ token: null, expired })
}
