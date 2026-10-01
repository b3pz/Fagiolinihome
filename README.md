# Fagiolini — V19.3

Sito della famiglia con calendario, diari, pasti, spesa e gestione della casa.

## Interfaccia pensata per il telefono

- Home con accesso immediato al calendario e pulsante per aggiungere un impegno.
- Diari di Caty, Kiko, Astro, JJ e Kiki raggiungibili da schede con foto e nomi leggibili.
- Registrazioni rapide di pappa, cacca, sonno e pannolino a due colonne sul telefono.
- Collegamenti espliciti alla lista della spesa, ai pasti e alle faccende.
- Navigazione persistente: Inizio, Calendario, Spesa, Pasti, Altro.
- Schede su una colonna, moduli con input di almeno 17 px e pulsanti grandi.
- Focus visibile, indicazione della pagina corrente e rispetto delle preferenze di movimento ridotto.
- Tema chiaro e scuro; account e notifiche disponibili nell’intestazione.

`friendly.css` definisce la nuova interfaccia dopo gli stili storici. Gli ID dei moduli e i flussi di registrazione esistenti sono preservati. Modello dei dati, sincronizzazione Supabase e notifiche sono preservati.

## Avvio locale

```sh
python3 -m http.server 8765
```

Aprire `http://localhost:8765`. Per usare i dati sincronizzati è necessario un account famiglia valido.

## Pubblicazione

File statici nella root, compatibili con GitHub Pages. Versione degli asset: `19.3.0`. Il service worker resta inattivo.

## Accesso e durata della sessione

Accesso con email e password degli account famiglia esistenti su Supabase. Il sito richiede un nuovo accesso dopo 3 giorni di inattività; usare il sito rinnova il periodo. Le credenziali possono essere compilate dal gestore password del telefono.

La durata locale non sostituisce revoche o limiti configurati su Supabase. Non vengono inviati link email dal modulo di accesso.

## App sul telefono

Manifest configurato per l’apertura standalone. Le istruzioni sono in Altro → Fagiolini sul tuo telefono. Il pulsante di installazione appare quando il browser lo rende disponibile. Non è una pubblicazione su App Store o Play Store.

Per completare le icone con il logo originale, salvarlo nella cartella del progetto e usare su macOS:

```sh
python3 scripts/build-icons.py logo-fagiolini.png
```

Il comando crea favicon PNG 32 px, apple-touch-icon 180 px e icone app 192/512 px; aggiorna manifest e HTML. Finché il logo non è disponibile, non vengono introdotti collegamenti a immagini mancanti.
