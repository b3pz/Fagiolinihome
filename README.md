# Fagiolini V12 — Complete Mobile Nav Fix

Questa V12 corregge il pacchetto precedente, che non includeva tutti gli asset necessari.

## Fix principale
- ZIP completo con `style.css`, `app.js`, `icons.svg`, `manifest.json` e `sw.js`.
- Bottom bar iPhone con geometria compatta e Home centrale in modalità pillola, non cerchio flottante.
- Cache busting aggiornato a `v=12.0.1` per forzare Safari/GitHub Pages a caricare CSS e JS nuovi.

## Importante
Per aggiornare GitHub Pages, sostituire tutti i file della root con quelli presenti in questo ZIP, non solo `index.html`.
