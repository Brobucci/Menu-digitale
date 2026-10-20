export function LoadingState() {
  return (
    <ul className="space-y-3 p-4" aria-busy="true" aria-label="Caricamento del menù">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="h-24 animate-pulse rounded-xl bg-stone-200" />
      ))}
    </ul>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
      <p className="font-semibold text-red-900">Non riesco a caricare il menù</p>
      <p className="mt-1 text-sm text-red-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
      >
        Riprova
      </button>
    </div>
  )
}
