# Decisioni tecniche

Registro delle scelte di progetto e dei motivi. Per ognuna sono indicate le alternative scartate e i
compromessi accettati.

## 1. Due modalità di gestione dei dati in un solo codice
**Decisione.** Il frontend supporta due sorgenti dati, scelte in fase di build con le modalità di
Vite: **A** (API Spring Boot su `menu.json`, pannello `/admin` con login) e **B** (Foglio Google
pubblicato come CSV, nessun backend).
**Motivo.** Locali piccoli con budget minimo: la modalità B non ha costi di server e il ristoratore
modifica un foglio che già sa usare. La modalità A resta per chi vuole un pannello dedicato.
**Alternative scartate.** Due progetti separati (codice duplicato da mantenere due volte); una scelta
a runtime (aggiunge codice che il cliente non userebbe mai).
**Compromesso.** Nella modalità B non esiste `/admin`: la rotta non viene registrata.

## 2. Il foglio si legge per nome di colonna
**Decisione.** Le colonne si trovano dal nome dell'intestazione, normalizzato (maiuscole, accenti,
trattini), non dalla posizione.
**Motivo.** Chi usa il foglio può spostare o aggiungere colonne senza rompere il menù.
**Compromesso.** Rinominare o cancellare un'intestazione obbligatoria ferma l'aggiornamento (vedi 3).

## 3. Lettura prudente: nel dubbio, il valore più sicuro per il cliente finale
**Decisione.**
- un allergene con valore dubbio è considerato **presente**;
- «Senza glutine» con valore dubbio è considerato **no**;
- un piatto segnato insieme «senza glutine» e con glutine è mostrato **con glutine**;
- una riga con prezzo o categoria non validi viene **saltata**, le altre funzionano;
- se manca una colonna obbligatoria il menù **non si aggiorna**.
**Motivo.** Un errore su un allergene è più grave di un piatto nascosto. Meglio un'informazione in
più che una mancante.
**Compromesso.** Un valore scritto male nel foglio può far comparire un allergene in più.

## 4. Ultima versione valida salvata sul telefono
**Decisione.** Il menù letto correttamente viene salvato nel `localStorage`. Se il foglio non è
raggiungibile o è rotto, il cliente vede l'ultima versione valida con un avviso.
**Motivo.** In sala la rete è spesso debole, e un foglio modificato male non deve lasciare il
cliente senza menù.
**Compromesso.** Il menù mostrato può essere indietro rispetto al foglio: per questo l'avviso è esplicito.

## 5. Diagnostica con `?diagnostica`
**Decisione.** Aggiungendo `?diagnostica` all'indirizzo compare l'elenco dei problemi del foglio, con
il numero di riga.
**Motivo.** Chi gestisce il sistema deve capire perché una riga non compare, senza aprire il codice.

## 6. Tema con token semantici
**Decisione.** I colori sono nomi semantici (`brand`, `danger`, `warning`, `success`) definiti in un
solo blocco `@theme` di Tailwind 4. I componenti non usano colori grezzi.
**Motivo.** Personalizzare un nuovo locale richiede di cambiare poche righe. Gli errori restano rossi
anche se il colore del marchio cambia.
**Alternativa scartata.** Colori scritti nelle classi dei componenti: ogni personalizzazione toccherebbe
decine di file.
**Nota.** Il testo bianco sul colore del marchio deve avere contrasto almeno 4,5:1.

## 7. Interfaccia accessibile con elementi nativi
**Decisione.** Finestre con `<dialog>` nativo, schede con ruoli e attributi ARIA, navigazione da tastiera,
interruttori con `role="switch"`.
**Motivo.** Meno codice da mantenere e un comportamento coerente per tastiera e lettori di schermo.

## 8. Stato modellato come unione discriminata
**Decisione.** Il caricamento del menù è un'unione discriminata (caricamento, errore, successo) invece
di booleani separati.
**Motivo.** Rende impossibili le combinazioni incoerenti, per esempio «caricamento e errore insieme».

## 9. Aggiornamento ottimistico nel pannello (modalità A)
**Decisione.** Il cambio di disponibilità di un piatto si vede subito e viene annullato se il salvataggio fallisce.
**Motivo.** Durante il servizio l'interruttore deve sembrare immediato.
**Compromesso.** Per un attimo l'interfaccia può mostrare un valore non ancora confermato dal server.

## 10. Accesso al pannello (modalità A)
**Decisione.**
- una sola password condivisa, salvata come hash **BCrypt**;
- dopo il login il server emette un **token casuale** a durata limitata, e conserva solo il suo hash SHA-256;
- il token viaggia in `Authorization: Bearer`, **senza cookie**, quindi non serve la protezione CSRF;
- i token stanno in memoria; un riavvio del server richiede un nuovo accesso;
- troppi tentativi falliti dallo stesso IP bloccano quell'indirizzo per un periodo;
- se manca l'hash della password l'applicazione **non parte**.
**Motivo.** Un solo utente e budget minimo: niente database e niente librerie di sessione complesse.
**Compromessi.** Il token nel `sessionStorage` è esposto a un eventuale XSS: la difesa è non usare
script di terzi né `dangerouslySetInnerHTML`. I token in memoria funzionano con una sola istanza del backend.

## 11. Backend (repository separato)
**Decisione.** I dati stanno in un file JSON; scrittura atomica (file temporaneo e poi spostamento),
lock di lettura/scrittura nel servizio, prezzo come `BigDecimal`, errori nel formato Problem Details (RFC 9457).
**Motivo.** Evitare un database per un menù di poche decine di voci, senza rischiare file corrotti
in caso di interruzione o di scritture concorrenti.

## 12. Hosting statico e dominio proprio
**Decisione.** Il frontend è un sito statico su un hosting gratuito, con una regola che serve
`index.html` per ogni indirizzo. Per il QR definitivo serve un dominio, così il codice stampato non cambia
anche se si cambia hosting.
**Motivo.** Costi minimi per il cliente.
**Compromesso.** Il ritardo tra una modifica del foglio e la sua comparsa sul sito dipende dalla pubblicazione di Google.

## Limiti noti
- Il ristoratore è responsabile della correttezza degli allergeni inseriti.
- Le diciture come «senza glutine» vanno concordate con il locale.
- Modalità A: token in memoria e una sola istanza del backend.
