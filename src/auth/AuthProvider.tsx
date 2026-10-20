import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { login, logout } from '../api/authApi'
import { getSnapshot, subscribe } from '../api/tokenStorage'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSnapshot) as {
    token: string | null
    expired: boolean
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: session.token !== null,
      sessionExpired: session.expired,
      login,
      logout,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
