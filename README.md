# Menù digitale QR

Menù digitale per ristoranti e pizzerie, pensato per essere aperto da telefono scansionando un
codice QR. Mobile-first, accessibile, con **filtri per dieta e allergeni** e un'area di gestione
per il ristoratore.

Il progetto nasce da un'esigenza concreta: un locale con budget ridotto, nessun reparto IT e la
necessità che il personale possa aggiornare prezzi e disponibilità da solo. Per questo il codice
supporta **due modi di gestire i dati**, scelti al momento della build.

## Funzionalità

**Per il cliente**
- Schede per categoria fisse in alto durante lo scorrimento
- Filtri *Vegetariano* e *Senza glutine*
- Dettaglio del piatto con i 14 allergeni a dichiarazione obbligatoria (Reg. UE 1169/2011)
- Piatti esauriti segnalati e non nascosti
- Layout pensato per il telefono, modali nativi (`<dialog>`), schede navigabili da tastiera (ARIA)

**Per il ristoratore (modalità A)**
- Accesso protetto da password in `/admin`
- Aggiunta, modifica ed eliminazione dei piatti con validazione dei campi
- Interruttore rapido *disponibile / esaurito* con aggiornamento immediato e ripristino se il salvataggio fallisce
- Controllo di coerenza: un piatto non può essere insieme «con glutine» e «senza glutine»

## Le due modalità

| | **A — Backend** | **B — Foglio Google** |
|---|---|---|
| Dati | `menu.json` gestito da un'API Spring Boot | Foglio Google pubblicato come CSV |
| Modifica | Pannello `/admin` con login | Il ristoratore modifica il foglio |
| Costi | Serve un server sempre acceso | Solo hosting statico gratuito |
| Build | `npm run build` | `npm run build:sheet` |

La modalità si decide in fase di build tramite le modalità di Vite (`--mode sheet` legge
`.env.sheet`). Il codice è unico: nella modalità B la pagina `/admin` non esiste.

```
Cliente ──► Frontend statico (React) ──┬─► modalità A: API Spring Boot ── menu.json
                                       └─► modalità B: CSV del Foglio Google
```

Il backend della modalità A è in un **repository separato** (Spring Boot, Java).

### Scelte progettuali
- **Lettura prudente del foglio.** Le colonne si trovano per *nome*, non per posizione. Una riga con
  dati errati viene saltata, ma se manca una colonna obbligatoria il menù non si aggiorna:
  i clienti vedono l'ultima versione salvata con un avviso. Un valore dubbio in una colonna
  allergeni è trattato come *presente*; uno dubbio in «Senza glutine» come *no*.
- **Diagnostica.** Aprendo il sito con `?diagnostica` si vede l'elenco dei problemi del foglio con il
  numero di riga.
- **Autenticazione senza cookie** (modalità A): token casuale a durata limitata, memorizzato dal
  server solo come hash; password con BCrypt; blocco dei tentativi ripetuti per indirizzo IP.
- **Tema in un solo punto.** I colori sono token semantici (`bg-brand`, `text-danger`…) definiti
  in `src/index.css`.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · Vitest · oxlint

## Avvio in locale

Requisiti: Node.js recente (22 o superiore) e npm.

```bash
npm install

# Modalità B (foglio): crea .env.sheet.local con l'indirizzo CSV del foglio
echo "VITE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv" > .env.sheet.local
npm run dev:sheet

# Modalità A (backend): servono il backend in esecuzione su http://localhost:8080
npm run dev
```

| Comando | Cosa fa |
|---|---|
| `npm run dev` / `npm run dev:sheet` | Sviluppo, modalità A / B |
| `npm run build` / `npm run build:sheet` | Build di produzione in `dist/` |
| `npm test` | Test (parsing del CSV e del foglio) |
| `npm run lint` | Controllo statico con oxlint |

## Preparare il foglio (modalità B)
Il file `sheet-template/menu-template.csv` è il modello di partenza e
[`sheet-template/GUIDA-FOGLIO.md`](sheet-template/GUIDA-FOGLIO.md) spiega come configurarlo
(caselle di controllo, menu a tendina, pubblicazione) e include una scheda pronta per il ristoratore.

## Pubblicazione
Il sito è statico: va bene qualunque hosting statico (Cloudflare Pages, Netlify…).
Impostazioni per la modalità B:

- Build command: `npm run build:sheet`
- Output directory: `dist`
- Variabile d'ambiente: `VITE_SHEET_CSV_URL` (indirizzo CSV del foglio)

Il file `public/_redirects` fa servire `index.html` per qualunque indirizzo, così le rotte
dell'app funzionano anche se la pagina viene ricaricata.

## Usarlo come modello per un nuovo locale
Il progetto è pensato per essere copiato per ogni cliente. Cosa cambiare:

1. **Colori** — blocco «Colore del marchio» in `src/index.css`. Controlla il contrasto (almeno 4,5:1).
   Cambia anche `theme-color` in `index.html`.
2. **Nome del locale** — costante in `src/pages/CustomerPage.tsx` e `<title>` in `index.html`.
3. **Logo e icona** — `public/favicon.svg` e, se serve, il logo nella testata.
4. **Categorie** — `src/types/menu.ts` (`CATEGORIES` e `CATEGORY_LABELS`) e il menu a tendina nel foglio.
5. **Indirizzo del foglio** — variabile `VITE_SHEET_CSV_URL` sull'hosting.

Non inserire in un repository pubblico dati del cliente (menù reale, logo, indirizzi): per ogni
cliente usa una copia privata.

## Struttura

```
src/
  api/          accesso ai dati (API, foglio) e autenticazione
  auth/         login e protezione di /admin
  components/   interfaccia del menù e del pannello
  hooks/        useMenu
  pages/        CustomerPage, AdminPage, NotFoundPage
  types/        tipi condivisi con il backend
  utils/          parsing CSV, mappatura del foglio, prezzi, validazione
sheet-template/ modello del foglio e guida
```

## Limiti noti
- Il ritardo tra una modifica del foglio e la sua comparsa sul sito dipende dalla pubblicazione di Google.
- La responsabilità della correttezza degli allergeni resta del ristoratore: l'app mostra ciò che è nel foglio o nel menù.
- Modalità A: i token vivono in memoria del server (un riavvio richiede un nuovo accesso) e l'app è pensata per una sola istanza.

## Licenza
MIT — vedi [LICENSE](LICENSE).
