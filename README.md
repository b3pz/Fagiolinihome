# Fagiolini — V19.1

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

File statici nella root, compatibili con GitHub Pages. Versione degli asset: `19.1.0`. Il service worker resta inattivo.

## Accesso senza password

Gli account famiglia esistenti entrano tramite un link inviato alla propria email. Non vengono creati nuovi account dal modulo. La sessione locale dura fino a 30 giorni di inattività, salvo revoca o scadenze configurate su Supabase.

In Supabase → Authentication → URL Configuration, autorizzare l’URL del sito pubblicato (`https://b3pz.github.io/Fagiolinihome/`, se si usa GitHub Pages) fra i redirect consentiti. Verificare che il provider Email e l’invio dei magic link siano attivi. Queste impostazioni richiedono accesso al progetto Supabase e non sono verificabili dal repository.
