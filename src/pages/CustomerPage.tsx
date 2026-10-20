import { MenuPage } from './MenuPage'

// Per ora il nome è fisso; se serve per più locali lo spostiamo nella configurazione.
const RESTAURANT_NAME = 'Il nostro menù'

export function CustomerPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-red-700 px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-bold">{RESTAURANT_NAME}</h1>
      </header>
      <main className="mx-auto max-w-2xl">
        <MenuPage />
      </main>
    </div>
  )
}
