import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/http'
import { useAuth } from './useAuth'

export function LoginForm() {
  const { login, sessionExpired } = useAuth()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    if (!password) {
      setError('Inserisci la password.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await login(password)
      // Se riesce, AuthGate mostra il pannello: questo componente sparisce.
    } catch (e) {
      setError(
        e instanceof ApiError && (e as ApiError).status === 401
          ? 'Password non corretta.'
          : e instanceof Error
            ? e.message
            : 'Accesso non riuscito.',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-stone-900">Accesso gestione menù</h1>

        {sessionExpired && !error && (
          <p role="status" className="mt-3 rounded-lg bg-warning-soft p-3 text-sm text-warning-strong">
            La sessione è scaduta. Accedi di nuovo.
          </p>
        )}

        <label htmlFor="admin-password" className="mt-5 block text-sm font-medium text-stone-800">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'admin-password-error' : undefined}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring"
        />
        {error && (
          <p id="admin-password-error" role="alert" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
        >
          {submitting ? 'Accesso…' : 'Accedi'}
        </button>
        <Link to="/" className="mt-4 block text-center text-sm text-stone-600 underline">
          ← Torna al menù
        </Link>
      </form>
    </div>
  )
}
