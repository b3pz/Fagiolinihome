# Fagiolini V12.2 — Home Nav Hard Reset + Desktop Landscape

Patch mirata sulla V12.1.

## Correzione Home mobile
La voce Home della bottom navigation usa ora una classe mobile dedicata (`navHomeTab`) e non eredita più nessuna delle vecchie regole `navHomeCenter` accumulate nelle versioni precedenti.

- niente cerchio
- niente pulsante floating
- niente icona che esce dal contenitore
- icona Home 25×25 px come le altre
- Home evidenziata soltanto da una pillola morbida quando attiva
- barra 5 voci compatta e fissa

## Desktop
Mantiene il layout landscape della V12.1:
- larghezza ampia
- dashboard a griglia
- navigazione desktop separata
- bottom navigation mobile nascosta su desktop

## Cache
`style.css?v=12.2.0` e `app.js?v=12.2.0`.

Nessuna modifica alla logica di login, Supabase, Telegram o dati famiglia.
