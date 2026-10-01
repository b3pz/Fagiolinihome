# Fagiolini — V20.1

Sito della famiglia con calendario, diari, pasti, spesa e gestione della casa.

## Organizzazione della giornata

- Oggi: primi tre impegni dei prossimi sette giorni, diario selezionabile di Caty/Kiko/Astro e pasti di oggi.
- Agenda: grandi caselle giornaliere con appuntamenti e faccende. Sul telefono si scorrono i giorni in orizzontale; da ogni casella si aggiungono scopa, bucato e lenzuola e si spuntano le attività. Il mese resta apribile, con icone delle faccende.
- Diari: tutti i diari con ultime registrazioni e pulsanti di inserimento già associati alla persona.
- Pasti: pianificazione esistente e lista della spesa raggiungibile dalla home.
- Altro: acquisti, salute, rifiuti e casa; spese, auto e scadenze raccolte in una sezione richiudibile.

Ogni diario mostra data e ora dell’ultima pappa, cacca e sonno; per Astro, pipì al posto del sonno e cure al posto del pannolino. L’assenza di registrazioni è esplicita. I moduli propongono i tipi adatti al bambino o al cane.

`friendly.css` definisce l’interfaccia dopo gli stili storici. Modello dei dati, sincronizzazione Supabase e notifiche sono preservati.

## Avvio locale

```sh
python3 -m http.server 8765
```

Aprire `http://localhost:8765`. Per usare i dati sincronizzati è necessario un account famiglia valido.

## Pubblicazione

File statici nella root, compatibili con GitHub Pages. Versione degli asset: `20.1.0`. Il service worker resta inattivo.

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
