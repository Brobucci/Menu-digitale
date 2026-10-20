import { jsonRequest, request } from './http'
import { clearSession, setSession } from './tokenStorage'

interface LoginResponse {
  token: string
  expiresAt: string
}

/** Verifica la password; se è giusta salva il token (e la UI passa al pannello). */
export async function login(password: string): Promise<void> {
  const result = await request<LoginResponse>('/api/auth/login', jsonRequest('POST', { password }))
  setSession(result.token, result.expiresAt)
}

/** Esce: invalida il token sul server (se raggiungibile) e comunque lo dimentica qui. */
export async function logout(): Promise<void> {
  try {
    await request<void>('/api/auth/logout', { method: 'POST' })
  } catch {
    /* server irraggiungibile o token già scaduto: l'uscita locale basta */
  } finally {
    clearSession()
  }
}

/** All'apertura del pannello: se il token non vale più, request() riporta al login da solo. */
export async function checkSession(): Promise<void> {
  await request<void>('/api/auth/session')
}
