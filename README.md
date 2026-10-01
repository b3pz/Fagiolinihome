# Fagiolini — V21

Sito della famiglia con calendario, diari, pasti, spesa e gestione della casa.

## Una pagina, uno scopo

- Inizio: quattro collegamenti ad Agenda, Diari, Pasti e Spesa. Nessun contenuto operativo duplicato.
- Agenda: appuntamenti e faccende con caselle giornaliere grandi; i dati dei diari e del menu rimangono nelle loro pagine.
- Diari: scelta di Caty, Kiko o Astro, poi registrazione e lettura nel diario individuale. Riepiloghi e grafici sono richiudibili.
- Pasti: giorno selezionato e pianificazione del menu, senza ripetere il riepilogo di oggi.
- Ricette: pagina dedicata al ricettario, raggiungibile da Pasti.
- Spesa: aggiunta e spunta degli acquisti.
- Altre sezioni: salute, rifiuti, soldi, scadenze e impostazioni, raggiungibili dal pulsante nell’intestazione.

Le vecchie destinazioni Oggi e Casa rimandano all’agenda, che contiene già il piano delle faccende. Login, modello dei dati e sincronizzazione restano invariati.

## Avvio locale

```sh
python3 -m http.server 8765
```

Aprire `http://localhost:8765`. Per usare i dati sincronizzati è necessario un account famiglia valido.

## Pubblicazione

File statici nella root, compatibili con GitHub Pages. Versione degli asset: `21.0.0`. Il service worker resta inattivo.

## Accesso e durata della sessione

Accesso con email e password degli account famiglia esistenti su Supabase. Il sito richiede un nuovo accesso dopo 3 giorni di inattività; usare il sito rinnova il periodo. Le credenziali possono essere compilate dal gestore password del telefono.

La durata locale non sostituisce revoche o limiti configurati su Supabase. Non vengono inviati link email dal modulo di accesso.

## App sul telefono

Manifest configurato per l’apertura standalone. Le istruzioni sono in Altro → Fagiolini sul tuo telefono. Il pulsante di installazione appare quando il browser lo rende disponibile. Non è una pubblicazione su App Store o Play Store.

Per completare le icone con il logo originale, salvarlo nella cartella del progetto e usare su macOS:

```sh
python3 scripts/build-icons.py logo-fagiolini.png
```

Il comando crea favicon PNG 32 px, apple-touch-icon 180 px e icone app 192/512 px; aggiorna manifest e HTML. Il logo originale è disponibile in `logo-fagiolini.png`; favicon e icone generate sono in `assets/icons/` e collegate a HTML e manifest.

Le frequenze delle pulizie si impostano direttamente nell’agenda. “Programma i prossimi 7 giorni” aggiunge le attività mancanti senza rimuovere quelle già registrate. Il bucato crea lavatrice e asciugatrice collegate: l’asciugatrice si può completare dopo la lavatrice.
