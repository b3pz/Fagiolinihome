# Fagiolini V17 — Editorial Family UI

V17 è un visual reset completo costruito sopra la logica stabile della V16.

## Direzione grafica
- nuova palette **Ink / Porcelain / Clay / Sage**: niente più verde-crema dominante;
- tipografia di sistema, niente serif da dashboard;
- Home con gerarchia reale: Oggi è il focus, Casa/Pasti sono riepiloghi tonali, Bank e Rifiuti hanno identità distinte;
- quick action mobile in griglia 3×2 compatta;
- calendario ridisegnato come mese minimale, con oggi e selezione chiari;
- pagina Oggi trasformata in feed di sezioni, non elenco gestionale;
- Organizza in gruppi/lista su iPhone e griglia su desktop;
- Fagiolini Bank con hero scuro dedicato;
- modali mobile come bottom sheet;
- login ridisegnato;
- emoji decorative rimosse dai principali controlli e sostituite con sprite SVG coerenti.

## Dark mode
Tema scuro dedicato charcoal/ink, non inversione del tema chiaro. Superfici, input, calendario, modali, navigation e Bank hanno colori specifici.

## Funzioni preservate
Nessuna modifica intenzionale a Supabase, autenticazione, timeout sessione, sincronizzazione, Telegram/Cron, reminder, dati, Bank, calendario o dipendenze delle faccende.

## Deploy GitHub Pages
Caricare **tutti i file direttamente nella root** del repository. `index.html` usa cache busting `17.0.0` e carica `v17.css` dopo lo stylesheet storico.
