import { useSearchParams } from 'react-router'
import type { RowProblem } from '../types/loadResult'

interface MenuNoticesProps {
  stale: boolean
  problems: RowProblem[]
}

/**
 * Avvisi sotto le schede:
 * - "menù datato" per tutti i clienti, se non siamo riusciti ad aggiornarlo;
 * - la diagnostica del foglio SOLO aprendo l'indirizzo con ?diagnostica, pensata per chi
 *   gestisce il menù e si chiede "perché il mio piatto non compare?".
 */
export function MenuNotices({ stale, problems }: MenuNoticesProps) {
  const [params] = useSearchParams()
  const showDiagnostics = params.has('diagnostica')

  return (
    <>
      {stale && (
        <p role="status" className="mx-4 mt-4 rounded-xl bg-warning-soft p-3 text-sm text-warning-strong">
          Non riesco ad aggiornare il menù. Ti mostro l’ultima versione salvata su questo dispositivo:
          alcuni piatti o prezzi potrebbero essere cambiati.
        </p>
      )}

      {showDiagnostics && (
        <section
          aria-label="Diagnostica del foglio"
          className="mx-4 mt-4 rounded-xl border border-stone-300 bg-white p-4 text-sm"
        >
          <h2 className="font-semibold text-stone-900">Diagnostica del foglio</h2>
          {problems.length === 0 ? (
            <p className="mt-2 text-success-text">Nessun problema trovato: tutte le righe sono state lette.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {problems.map((problem, index) => (
                <li key={index} className={problem.level === 'error' ? 'text-danger-strong' : 'text-warning-strong'}>
                  <span className="font-semibold">
                    {problem.row === 0 ? 'Generale' : `Riga ${problem.row}`}
                    {problem.level === 'error' ? ' (errore)' : ' (avviso)'}:
                  </span>{' '}
                  {problem.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  )
}
