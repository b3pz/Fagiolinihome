# Fagiolini — V19

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

`friendly.css` definisce la nuova interfaccia dopo gli stili storici. Gli ID dei moduli e i flussi di registrazione esistenti sono preservati. Login, modello dei dati, sincronizzazione Supabase e notifiche non sono stati modificati.

## Avvio locale

```sh
python3 -m http.server 8765
```

Aprire `http://localhost:8765`. Per usare i dati sincronizzati è necessario un account famiglia valido.

## Pubblicazione

File statici nella root, compatibili con GitHub Pages. Versione degli asset: `19.0.0`. Il service worker resta inattivo.
