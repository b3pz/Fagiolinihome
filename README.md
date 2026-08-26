# Fagiolini V17.1 — Hard Visual Reset

Correzione della V17: la palette nuova era contenuta in un foglio CSS separato e, se quel file non veniva caricato/pubblicato correttamente, l'app ricadeva visivamente sul vecchio verde/crema.

In V17.1 il visual reset è **fuso direttamente in `style.css`**, quindi non dipende più da un secondo stylesheet.

## Identità chiara
- background Stone freddo
- superfici Porcelain
- testo Ink / grafite
- accent principale Slate Blue
- Terracotta per Bank e ricorrenze
- Sage solo secondario
- Home con hero Oggi scura e pannelli chiaramente differenziati

## Dark mode rifatta
- charcoal quasi nero
- superfici graphite
- testo avorio
- slate + terracotta + sage come accenti
- niente verde-nero dominante
- calendario, modali, input e bottom nav dedicati

## Funzioni
Nessuna modifica intenzionale a Supabase, login, sincronizzazione, Telegram, Cron, reminder, Bank, Diario, Casa o dati.

Cache busting: 17.1.0
