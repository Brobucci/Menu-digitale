/**
 * Parser CSV (RFC 4180) minimale ma corretto per i casi che Google Fogli può produrre:
 * - campi tra virgolette che contengono virgole o a capo;
 * - virgolette doppie ("") dentro un campo tra virgolette;
 * - fine riga \n oppure \r\n;
 * - BOM iniziale.
 *
 * Restituisce una lista di righe, ciascuna lista di celle (sempre stringhe, mai tagliate).
 */
export function parseCsv(text: string): string[][] {
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"' // "" dentro le virgolette = una virgoletta vera
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"' && field === '') {
      // Le virgolette aprono un campo solo se sono il suo primo carattere.
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  // Ultima riga senza a capo finale.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}
