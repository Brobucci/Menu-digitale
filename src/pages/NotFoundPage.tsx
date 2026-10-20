import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-stone-900">Pagina non trovata</h1>
      <p className="text-stone-600">L'indirizzo che hai aperto non esiste.</p>
      <Link to="/" className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800">
        Vai al menù
      </Link>
    </main>
  )
}
