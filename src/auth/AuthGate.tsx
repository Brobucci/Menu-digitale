import { useEffect, type ReactNode } from 'react'
import { checkSession } from '../api/authApi'
import { LoginForm } from './LoginForm'
import { useAuth } from './useAuth'

/** Mostra i figli solo se l'utente è autenticato, altrimenti il form di login. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  // Un token ritrovato nella scheda potrebbe essere scaduto o revocato: lo verifichiamo una volta
  // appena il pannello si apre. Se non vale più, la richiesta stessa riporta al login.
  useEffect(() => {
    if (isAuthenticated) checkSession().catch(() => {})
    // Solo all'apertura: non serve rifarlo a ogni cambio di stato.
  }, [])

  return isAuthenticated ? <>{children}</> : <LoginForm />
}
