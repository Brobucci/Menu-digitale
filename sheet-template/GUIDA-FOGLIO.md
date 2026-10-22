# Guida al foglio del menù (versione B)

Il menù viene letto da un Foglio Google pubblicato sul web come CSV. Non c'è backend e non c'è
login: chi modifica il foglio modifica il menù. Questa guida ha due parti: la **preparazione del
foglio** (la fai tu, una volta sola) e la **scheda per il ristoratore** (da dargli stampata o
incollata in una scheda a parte del foglio).

> I nomi dei comandi di Google Fogli possono cambiare leggermente da una versione all'altra.
> Se una voce non si trova, cerca quella più simile.

---

## Parte 1 — Preparare il foglio

### 1. Creare il foglio
1. Crealo con l'**account Google del ristoratore** (o crealo tu e poi trasferisci la proprietà):
   se il foglio resta a tuo nome e un giorno lasci il progetto, il cliente perde il controllo del suo menù.
2. **File → Impostazioni → Impostazioni internazionali → Italia.** Senza questo passaggio il prezzo
   `7,50` viene letto come testo invece che come numero.
3. **File → Importa → Carica** il file `menu-template.csv` → *Sostituisci foglio di lavoro*.
4. Controlla la colonna **Prezzo**: i numeri devono essere allineati a destra. Se sono a sinistra
   sono testo e il passaggio 2 non ha funzionato.

### 2. Caselle di controllo (colonne E–U)
Le colonne sono: A Nome · B Categoria · C Prezzo · D Descrizione · E Disponibile · F Vegetariano ·
G Senza glutine · H–U i 14 allergeni (da Glutine a Molluschi).

Seleziona **E2:U500** → **Inserisci → Casella di controllo**. I valori TRUE/FALSE importati
diventano caselle spuntate o vuote.

### 3. Menu a tendina per la Categoria
Seleziona **B2:B500** → **Dati → Convalida dei dati → Aggiungi regola** → *Menu a discesa* con i
valori `Antipasti`, `Pizze`, `Bevande` → in *Opzioni avanzate* scegli **Rifiuta l'input**.
Così il cliente non può scrivere «Pizza» o «Dolci» (che l'app non riconoscerebbe).

### 4. Prezzo valido
Seleziona **C2:C500** → **Convalida dei dati** → *Numero* maggiore o uguale a 0 → **Rifiuta l'input**.
Formato → Numero → 2 decimali (o Valuta). L'app accetta `7,50`, `7.5`, `€ 7,50` e `7,50 €`.

### 5. Proteggere la riga delle intestazioni
- **Visualizza → Blocca → 1 riga**, così resta sempre visibile.
- Seleziona la **riga 1** → **Dati → Proteggi fogli e intervalli** → *Imposta autorizzazioni* →
  *Limita chi può modificare questo intervallo* → solo il proprietario.

L'app trova le colonne **per nome**: se il cliente cancella o rinomina una intestazione, il menù
smette di caricarsi (vedi «Cosa succede se il foglio è rotto» più sotto).

### 6. Pubblicare solo il foglio del menù
**File → Condividi → Pubblica sul web** → scheda *Link* → scegli la scheda del menù (**non**
«Intero documento») e il formato **Valori separati da virgola (.csv)** → *Pubblica*.
Copia l'indirizzo: deve finire con `output=csv`.

### 7. Condivisione
- **Condividi → Accesso generale: Limitato.** La pubblicazione sul web funziona anche così.
- Non impostare mai «Chiunque abbia il link: Editor»: chiunque potrebbe cambiare gli allergeni.
- Attiva la **verifica in due passaggi** sull'account Google del ristoratore: è l'unica
  protezione del menù.

### 8. Collegare l'app
Crea il file `.env.sheet.local` (è ignorato da Git) con una riga sola:

```
VITE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv
```

```bash
npm run dev:sheet       # sviluppo, su http://localhost:5173
npm run build:sheet     # produce la cartella dist/ da pubblicare su un hosting statico
```

Per vederlo dal telefono in sviluppo (stessa rete Wi-Fi): `npm run dev:sheet -- --host`
e apri sul telefono l'indirizzo di rete che Vite stampa nel terminale.

### 9. Da verificare con il foglio vero (non l'ho potuto provare)
- **Quanto tempo passa** tra una modifica nel foglio e la sua comparsa nel menù. Cambia un prezzo
  e cronometra.
- Che il **browser possa leggere il CSV** direttamente. Se la pagina dice «Impossibile contattare
  Google Fogli» pur con la rete funzionante, apri la console del browser (F12): potrebbe essere
  un blocco di accesso (CORS) e servirebbe un piccolo intermediario.
- **Come compaiono i prezzi** nel CSV pubblicato. L'app accetta le forme più comuni.

---

## Cosa succede se il foglio è rotto
| Situazione | Effetto |
|---|---|
| Una riga con prezzo o categoria sbagliati | Quella riga è saltata, le altre funzionano |
| Una colonna obbligatoria (o un allergene) cancellata o rinominata | Il menù **non si aggiorna**; i clienti vedono l'ultima versione salvata sul loro telefono con un avviso, oppure un errore se non ne hanno una |
| Valore strano in una colonna allergene (es. «forse») | Considerato **presente** |
| Valore strano in «Senza glutine» | Considerato **no** |
| «Senza glutine» e «Glutine» spuntati insieme | Il piatto è mostrato **con glutine** |

Per scoprire il motivo, apri il menù aggiungendo `?diagnostica` all'indirizzo
(es. `https://tuomenu.it/?diagnostica`): compare l'elenco dei problemi con il numero di riga.

---

## Parte 2 — Scheda per il ristoratore

**Come si modifica il menù**

1. Apri il foglio dal telefono o dal computer. Ogni **riga è un piatto**.
2. **Cambiare un prezzo:** tocca la cella del prezzo e scrivi, ad esempio, `7,50`.
3. **Piatto esaurito:** togli la spunta da **Disponibile**. Rimettila quando torna disponibile.
4. **Nuovo piatto:** scrivi in una riga libera in fondo. Scegli la categoria dal menu a tendina.
5. **Allergeni:** spunta tutti quelli presenti. **Nel dubbio, spunta.**
6. **Togliere un piatto per sempre:** elimina la riga.

**Da non fare mai**
- Non cancellare e non rinominare le colonne della prima riga.
- Non scrivere la categoria a mano: usa il menu a tendina.
- Non lasciare «Senza glutine» spuntato se nel piatto c'è glutine.

Le modifiche compaiono nel menù dei clienti dopo qualche istante. Se non compare qualcosa,
contatta [CONTATTO DI CHI GESTISCE IL SISTEMA: nome e telefono].
