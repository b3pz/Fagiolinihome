# Fagiolini V13.2 — Real Mobile Device Fix

Patch mirata alla resa iPhone/Safari.

## Problema individuato
La V13.1 conteneva il CSS corretto, ma sul dispositivo mobile alcune regole `@media (max-width:699px)` non risultavano applicate: lo si vedeva sia dalla bottom bar gigante sia da “Segna al volo” disposto su 6 colonne invece di 3.

## Fix
- mobile rilevato anche tramite `hover:none` + `pointer:coarse`, non solo tramite larghezza viewport;
- quick actions forzate a 3 colonne su touch/mobile;
- bottom nav completamente resettata e ridimensionata;
- icone 25×25 px reali;
- Home come tab/pill, senza elemento floating;
- desktop nav nascosta su dispositivo touch/mobile;
- cache busting `13.2.0`.

Nessuna modifica alla logica Supabase/Telegram/dati.
