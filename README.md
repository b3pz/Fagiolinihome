# Fagiolini V6

Versione più completa e più leggibile.

## Novità
- layout e pulsanti più grandi
- Caty, Kiko e Astro nella Home
- Assistente Menu locale e gratuito
- profili alimentari con età, gusti, cibi non graditi e allergeni/esclusioni
- menu settimanale variabile
- adattamenti indicativi per Caty e Kiko
- visite mediche / appuntamenti
- medicine
- calendario mensile che raccoglie menu, salute e registrazioni dei piccoli
- Casa
- Spesa
- Soldi con storico mensile e categorie

## Importante
L'Assistente Menu è locale e basato su regole: non usa API esterne e non invia dati fuori dal telefono.
Per bambini piccoli, allergie o esigenze sanitarie, le proposte alimentari vanno verificate con pediatra/professionista sanitario.

## GitHub Pages
Metti direttamente nella root:
- index.html
- style.css
- app.js
- manifest.json
- sw.js
- README.md

Nessuna sottocartella.

## V6.1
- date di nascita reali: Caty 10/12/2024, Kiko 11/02/2026, Astro 19/10/2025
- età calcolata automaticamente
- sezione "Noi" per JJ e Kiki
- scheda personale adulti con visite, medicine, calendario e alimentazione

## V6.2
- JJ: 31/05/1991
- Kiki: 24/08/1990
- età adulti calcolata automaticamente
- pulsante "Annulla ultima generazione" nel menu
- se un piatto viene modificato a mano, il vecchio commento/adattamento viene rimosso automaticamente

## V6.3
- spese personali per JJ e Kiki
- categorie: pranzo lavoro, caffè/bar, trasporti, acquisti personali, svago, altro
- totale mensile personale nella scheda
- riepilogo per categoria
- tutte le spese personali confluiscono nel totale famiglia
- bilancio generale mostra separatamente JJ e Kiki


## V7 - Supabase
- Login JJ / Kiki con Supabase Authentication
- Database condiviso `family_state`
- sincronizzazione automatica tra telefoni
- aggiornamento realtime quando disponibile
- controllo periodico ogni 8 secondi come fallback
- sincronizzazione quando l'app torna in primo piano
- localStorage mantenuto come cache/offline
- migrazione automatica: se Supabase è vuoto, il primo telefono autenticato carica i dati locali
- se Supabase contiene già dati, il database condiviso ha priorità sul localStorage

Project URL e Publishable Key sono valori pubblici client-side.
NON inserire mai una Secret key o service_role nel repository GitHub.

Nota: lo stato familiare è salvato in un unico record JSON; se due telefoni modificano esattamente nello stesso istante, prevale l'ultimo salvataggio.

## STABLE DIRECT SUPABASE
- family_id fisso verificato: 8e7df5f2-7339-48dd-96db-dec7a04b070e
- eliminato il passaggio family_members dal login
- login chiuso immediatamente dopo autenticazione riuscita
- errore family_state non può più rimandare alla login
- service worker/cache disattivati durante lo sviluppo

## Functional Upgrade
BASE: STABLE DIRECT SUPABASE. Autenticazione, family_id e sincronizzazione non modificati.

Aggiunto:
- Routine Casa semplice: spazzare, mocio, lavatrice, asciugatrice, lenzuola, asciugamani
- Fatto adesso + inserimento/modifica retroattiva di chi/data/ora/nota
- modifica degli eventi Caty/Kiko/Astro
- Astro: traversina al posto delle passeggiate
- modifica visite/medicine esistenti
- lista spesa con URL prodotto, prezzo previsto e modifica
- acquisto con prezzo effettivo e registrazione automatica nelle spese
- bollette/abbonamenti con costo, scadenza, frequenza, destinatario reminder
- ricette apribili dal menu + ingredienti nella spesa
- calendario arricchito con routine casa e scadenze

## HOTFIX KIKI LOGIN
Corretto riferimento legacy `houseDone` rimasto nella Home dopo il passaggio alla nuova Routine Casa.
Autenticazione, family_id e sincronizzazione Supabase NON modificati.

## V8.1 — Casa + Auto
Baseline: V8 Functional Stable HOTFIX houseDone.

Aggiunto:
- Manutenzioni Casa: caldaia, climatizzatore, idraulico, elettricista, elettrodomestici, altro
- data/ora, costo previsto/effettivo, ricorrenza, stato, note e reminder
- completamento manutenzione → spesa automatica in categoria Casa
- Auto: benzina, parcheggi, pedaggi, lavaggi, riparazioni, accessori
- spesa auto → Soldi/Auto automaticamente
- Auto: assicurazione, bollo, revisione, tagliando, gomme e manutenzione
- scadenze auto → Calendario
- pagamento/completamento → Soldi/Auto
- ricorrenze automatiche di manutenzioni/scadenze
- Calendario riscritto come aggregatore: visite, medicine, bambini/Astro, routine, abbonamenti, manutenzioni casa e auto

IMPORTANTE:
Autenticazione, Supabase, family_id e sincronizzazione sono rimasti invariati.


## V8.1.1 — Salute + Maps
Micro-upgrade della V8.1 stabile.

Aggiunto:
- etichette visibili per Data e Ora nelle visite
- etichette visibili per Data e Ora nelle medicine
- campo Luogo / indirizzo per visite
- campo link mappa opzionale
- pulsanti Apple Maps e Google Maps generati automaticamente dal luogo
- link mappa salvato, se incollato
- luogo mostrato nella lista Salute
- luogo mostrato nel Calendario
- Maps apribili anche dal dettaglio del Calendario
- modifica visita mantiene luogo e link mappa

Autenticazione, Supabase, family_id e sincronizzazione non modificati.


## V8.2 — Menu finale
Il modulo Menu è stato chiuso come funzione completa prima di proseguire con la roadmap.

Funzioni:
- ricettario iniziale con oltre 40 piatti reali e ingredienti
- proposta settimanale con varietà tra legumi, pesce, uova, carne, vegetariani e formaggi
- preferenze, cibi non graditi e allergeni/esclusioni
- feedback ricette: Preferita, Piaciuta, Non riproporre
- JJ + Kiki: colazione, pranzo e cena
- Caty: colazione, merenda mattina, pranzo, merenda pomeriggio, cena
- Kiko: colazione, merenda mattina, pranzo, merenda pomeriggio, cena
- proposte molto semplici per la fase di svezzamento
- OGNI campo è sempre modificabile direttamente a mano
- cambio di un singolo pasto con pulsante 🔄
- ricetta disponibile con 👨‍🍳
- indicatore di varietà settimanale
- lista spesa generata dall'intera settimana
- ingredienti delle ricette accorpati quando possibile
- pasti manuali non riconosciuti vengono aggiunti alla spesa con il loro nome
- il calendario continua a mostrare i pasti principali e ora anche la colazione

Nota: l'indicatore è pensato per varietà organizzativa, non come prescrizione dietetica o calorica.

Autenticazione, Supabase, family_id e sincronizzazione non modificati.


## V8.3 — Calendario + Promemoria

### Calendario
- continua ad aggregare automaticamente Salute, Menu, Routine Casa, Abbonamenti, Manutenzioni e Auto
- include ora anche i promemoria manuali
- dagli eventi del calendario si può aprire direttamente la sezione di origine
- visite con luogo mantengono Apple Maps / Google Maps

### Promemoria
- nuovo Centro Promemoria sincronizzato via stato Fagiolini
- raccoglie automaticamente:
  - visite e medicine
  - bollette / abbonamenti
  - manutenzioni casa
  - assicurazione, bollo, revisione, tagliando e altre scadenze auto
- mostra "da vedere", scaduti e prossimi
- destinatario JJ / Kiki / entrambi
- anticipo: giorno stesso / 1 / 3 / 7 / 30 giorni dove previsto
- possibilità di creare promemoria manuali
- possibilità di archiviare un avviso già visto
- i promemoria manuali possono essere modificati, completati o eliminati
- la Home segnala quanti promemoria sono da vedere

Nota tecnica: in V8.3 i promemoria sono gestiti e sincronizzati dentro Fagiolini.
L'invio automatico fuori dall'app è previsto nella V8.4 con Telegram.

### Fix Menu V8.3
- "Genera tutta la settimana" chiede conferma se esistono già pasti compilati
- "Completa solo i campi vuoti" preserva integralmente tutto ciò che JJ/Kiki hanno scritto manualmente
- rimangono disponibili modifica diretta e cambio del singolo pasto
- nessuna modalità manuale separata: ogni campo resta sempre editabile

### Roadmap
- V8 Stable: base Supabase
- V8.1: Casa + Auto
- V8.1.1: Salute + Maps
- V8.2: Menu completo
- V8.3: Calendario + Promemoria + fix Menu
- V8.4: Telegram
- V9: restyling mobile-first
- V9.1: test e pulizia
- V10: release stabile

Autenticazione, Supabase, family_id e sincronizzazione non modificati.


## V8.4 — Restyle Home + Login

Restyling grafico basato sui mockup approvati:
- Login fotografico a tutto schermo con card sovrapposta
- Home "La nostra giornata" in palette verde / crema / arancio
- foto famiglia integrata localmente
- ritratti di Caty, Kiko, Astro, JJ e Kiki integrati localmente
- famiglia in una sola striscia compatta
- menu principale a card 2 colonne
- Routine Casa riportata tra le funzioni principali
- Manutenzioni e Auto compatti nello stesso blocco
- riepilogo rapido: impegni, menu di oggi, casa, spese mese
- campanella promemoria in header con indicatore
- bottom navigation ridisegnata
- stile generale delle sezioni riallineato alla nuova palette

Asset tutti nel root:
family-hero.jpg
caty-avatar.jpg
kiko-avatar.jpg
astro-avatar.jpg
jj-avatar.jpg
kiki-avatar.jpg

Nessun link immagine esterno.

Autenticazione, Supabase, family_id, sincronizzazione e service worker non modificati.


## V8.4.1 — Piano Casa + Soldi Smart + Timeout

### Piano Casa
- le routine diventano vere task pending
- generazione dei prossimi 7 giorni
- "Completa ciò che manca" senza sovrascrivere task già presenti
- tutte le task sono modificabili, spostabili ed eliminabili
- task manuali straordinarie
- assegnazione JJ / Kiki / entrambi
- Fatto → task completata + registrazione nello storico
- Rimanda → +1 giorno
- frequenze modificabili:
  - ogni giorno
  - giorni alterni
  - ogni 3 giorni
  - 2 volte/settimana
  - 3 volte/settimana
  - settimanale
  - solo manuale
- Lavatrice → Asciugatrice è una dipendenza strutturale:
  - ogni lavatrice generata crea la sua asciugatrice
  - asciugatrice bloccata finché la lavatrice non è completata
  - se la lavatrice viene rimandata, l'asciugatrice collegata segue
  - asciugatrice non può essere programmata prima della lavatrice
- le task Casa compaiono nel Calendario
- le task pending entrano anche nel Centro Promemoria
- Home Casa usa il numero reale delle task pending di oggi

### Soldi Smart
Macro categorie:
- Casa
- Spesa
- Bollette
- Auto
- Bambini
- Salute
- Svago
- Personali
- Altro

Aggiunto:
- grafico a torta mensile
- importo e percentuale per macro gruppo
- classificazione automatica delle spese esistenti
- filtro cliccabile per macro categoria
- dettaglio delle voci filtrate
- compatibilità con spesa, auto, manutenzioni, abbonamenti e spese personali già esistenti

### Sicurezza Login
- timeout sessione: 3 ore di INATTIVITÀ
- ogni utilizzo dell'app rinnova il timer
- se Fagiolini resta inattiva per 3 ore, alla riapertura richiede nuovamente il login
- messaggio "Sessione scaduta dopo 3 ore di inattività"
- logout Supabase reale
- nessun dato familiare viene cancellato

Il collegamento diretto al family_id e la sincronizzazione family_state restano invariati.


## V8.5 — Family-first UX

Questa build parte dalla V8.4.1 stabile e mantiene login, Supabase, sessione 3 ore, Piano Casa, Menu, Calendario, Salute, Auto, Spesa e Soldi.

Novità principali:
- Home ridisegnata come riepilogo familiare.
- Bottom bar fissa: Home, Oggi, Casa, Pasti, Organizza.
- Testi e controlli più grandi.
- Nuova pagina Oggi con agenda aggregata.
- Nuova pagina Organizza con accesso a Spesa, Risparmi, Salute, Auto, manutenzioni, Promemoria e Calendario.
- Soldi diventa Risparmi: entrate, obiettivo mensile, confronto con mese precedente e grafico spese esistente.
- Profili bambini/animale con mini andamento cacche 7/30 giorni.
- Stato Telegram visibile in app (backend e Cron rimangono esterni e non contengono segreti nel repository).
- Raccolta differenziata predisposta, turni da configurare successivamente.

Nota: i controlli Telegram restano lato backend; questa build mostra lo stato del collegamento senza esporre token o secret.

## V8.5 / V8.5.1 — Family First + Fagiolini Bank
- Home e navigazione ripensate in macrosezioni con bottom bar fissa: Home, Oggi, Casa, Pasti, Organizza
- riepiloghi immediati e testi più grandi
- grafico andamento cacca 7/30 giorni nei profili
- Telegram mostrato come collegato senza esporre secret nel client
- raccolta differenziata predisposta, turni da configurare
- sezione Risparmi evoluta in **Fagiolini Bank**
  - un unico totale mensile dato da Entrate JJ + Entrate Kiki + Entrate Famiglia
  - spese sottratte al totale per ottenere il risparmio reale
  - obiettivo mensile di risparmio
  - confronto con il mese precedente
  - grafico spese per macro-categoria
- obiettivi speciali permanenti ma attivabili solo quando servono:
  - Vacanze
  - Natale
  - target, importo già messo da parte e nota libera
- per JJ e Kiki è possibile segnare:
  - Smart working
  - Ferie
  - Malattia
  - intervallo di date e nota
  - le giornate compaiono in Home, Oggi e Calendario

La logica stabile di login, Supabase, family_id fisso, sessione 3 ore, Piano Casa e sincronizzazione non è stata sostituita.

## V8.5.2 — UX più semplice + Calendario rapido

Questa build corregge i punti emersi dai test reali su iPhone.

### Navigazione
- bottom bar più grande e leggibile
- ordine: Oggi · Casa · HOME · Pasti · Organizza
- Home centrale, rialzata e graficamente diversa dagli altri tasti
- barra sempre fissa durante scroll e zoom
- maggiore distanza dalla status bar di iPhone / Safari

### Home e profili
- rimossi dalla Home i badge fisiologici tipo “Caty 💩 / Kiko 🍼 / Astro 💩”
- la Home mostra solo informazioni utili del giorno: lavoro, visite, compleanni vicini
- profili Caty/Kiko/Astro e JJ/Kiki usano la foto vera nell’intestazione, non l’emoji come identità principale
- per Astro il mini andamento usa le traversine; per i bambini rimane il grafico cacche 7/30 giorni

### Calendario
- tocco diretto su un giorno → apre subito la giornata selezionata
- grande pulsante “+ Aggiungi qualcosa” con la data già precompilata
- scelte rapide:
  - Appuntamento
  - Calcetto JJ
  - Compleanno
  - Promemoria
  - Lavoro / ferie / smart working / malattia
  - Salute
  - Faccenda di casa
  - Altro
- eventi/appuntamenti creati dal calendario usano il sistema Promemoria esistente e restano quindi compatibili con Telegram

### Compleanni
- archivio semplice per amici e parenti
- ricorrenza automatica ogni anno nel Calendario
- anteprima dei prossimi compleanni in Organizza
- segnalazione nell’app da 7 giorni prima

### Casa
- pagina accorciata: prima ciò che c’è da fare oggi, mentre settimana/regole/storico si aprono solo quando servono
- vincolo Lavatrice → Asciugatrice mantenuto
- nuovo vincolo Spazzare → Lavare pavimenti: il mocio resta bloccato finché non è stato completato Spazzare nello stesso giorno
- eliminato definitivamente il testo “asciugaculo”: resta solo “Cambio asciugamani”

### Eventi personali
- Calcetto aggiunto come evento rapido per JJ
- Smart working, ferie e malattia restano disponibili e finiscono in Oggi + Calendario

Login, Supabase, family_id, sincronizzazione, timeout 3 ore e backend Telegram non sono stati riscritti.


## V9 — Family First XL + Rifiuti reali

Baseline: V8.5.2 stabile. Login, Supabase, family_id, timeout 3 ore, sincronizzazione, Piano Casa, Fagiolini Bank e backend Telegram non sono stati riscritti.

### Interfaccia XL
- testi, titoli, pulsanti, card, campi e aree touch sensibilmente più grandi
- bottom bar ancora più alta e leggibile
- Home centrale da 80+ px, rialzata e nettamente diversa dagli altri tasti
- maggiore spazio utile su iPhone / Safari e safe-area mantenuta
- Login riassestato per evitare sovrapposizioni e tagli strani su iPhone

### Rifiuti — calendario reale Figline e Incisa Valdarno
Valido dal 5 gennaio 2026:
- lunedì: Organico
- martedì: Imballaggi e contenitori
- mercoledì: Carta e cartone
- giovedì: Organico
- venerdì: Residuo non differenziabile
- vetro: contenitori stradali, fuori dal normale porta a porta
- supporti igienici: servizio separato, non mostrato come turno standard

La Home mostra cosa si butta oggi e il prossimo ritiro. È presente anche una pagina Rifiuti completa e un accesso diretto da Organizza.

### Funzioni V8.5.2 mantenute
- Calendario cliccabile: tocco sul giorno → aggiungi evento con data già compilata
- Calcetto JJ
- Compleanni amici e parenti ricorrenti ogni anno
- Smart working / ferie / malattia
- vincoli Casa: Lavatrice → Asciugatrice e Spazzare → Lavare pavimenti
- niente testo “asciugaculo”: resta Cambio asciugamani
- foto vere nei profili
- nessun badge fisiologico nella Home famiglia
