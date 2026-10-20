/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend, senza slash finale (es. http://localhost:8080). Solo modalità 'api'. */
  readonly VITE_API_BASE_URL?: string
  /** 'sheet' = legge il menù da un foglio Google; qualunque altro valore = backend. */
  readonly VITE_MENU_SOURCE?: string
  /** Indirizzo CSV del foglio pubblicato sul web. Solo modalità 'sheet'. */
  readonly VITE_SHEET_CSV_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}