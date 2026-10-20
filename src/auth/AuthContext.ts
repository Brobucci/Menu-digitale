import { createContext } from 'react'

export interface AuthContextValue {
  isAuthenticated: boolean
  /** true se l'utente è stato disconnesso perché la sessione è scaduta. */
  sessionExpired: boolean
  login: (password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
