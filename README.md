# Fagiolini V6

Versione più completa e più leggibile.

## Novità
- layout e pulsanti più grandi
- Caty, Kiko e Astro nella Home
- Assistente Menu locale e gratuito
- profili alimentari con età, gusti, cibi non graditi e allergeni/esclusioni
- menu settimanale variabile
- adattamenti indicativi per Caty e Kiko
- visite mediche / appuntamenti
- medicine
- calendario mensile che raccoglie menu, salute e registrazioni dei piccoli
- Casa
- Spesa
- Soldi con storico mensile e categorie

## Importante
L'Assistente Menu è locale e basato su regole: non usa API esterne e non invia dati fuori dal telefono.
Per bambini piccoli, allergie o esigenze sanitarie, le proposte alimentari vanno verificate con pediatra/professionista sanitario.

## GitHub Pages
Metti direttamente nella root:
- index.html
- style.css
- app.js
- manifest.json
- sw.js
- README.md

Nessuna sottocartella.

## V6.1
- date di nascita reali: Caty 10/12/2024, Kiko 11/02/2026, Astro 19/10/2025
- età calcolata automaticamente
- sezione "Noi" per JJ e Kiki
- scheda personale adulti con visite, medicine, calendario e alimentazione

## V6.2
- JJ: 31/05/1991
- Kiki: 24/08/1990
- età adulti calcolata automaticamente
- pulsante "Annulla ultima generazione" nel menu
- se un piatto viene modificato a mano, il vecchio commento/adattamento viene rimosso automaticamente

## V6.3
- spese personali per JJ e Kiki
- categorie: pranzo lavoro, caffè/bar, trasporti, acquisti personali, svago, altro
- totale mensile personale nella scheda
- riepilogo per categoria
- tutte le spese personali confluiscono nel totale famiglia
- bilancio generale mostra separatamente JJ e Kiki


## V7 - Supabase
- Login JJ / Kiki con Supabase Authentication
- Database condiviso `family_state`
- sincronizzazione automatica tra telefoni
- aggiornamento realtime quando disponibile
- controllo periodico ogni 8 secondi come fallback
- sincronizzazione quando l'app torna in primo piano
- localStorage mantenuto come cache/offline
- migrazione automatica: se Supabase è vuoto, il primo telefono autenticato carica i dati locali
- se Supabase contiene già dati, il database condiviso ha priorità sul localStorage

Project URL e Publishable Key sono valori pubblici client-side.
NON inserire mai una Secret key o service_role nel repository GitHub.

Nota: lo stato familiare è salvato in un unico record JSON; se due telefoni modificano esattamente nello stesso istante, prevale l'ultimo salvataggio.

## STABLE DIRECT SUPABASE
- family_id fisso verificato: 8e7df5f2-7339-48dd-96db-dec7a04b070e
- eliminato il passaggio family_members dal login
- login chiuso immediatamente dopo autenticazione riuscita
- errore family_state non può più rimandare alla login
- service worker/cache disattivati durante lo sviluppo

## Functional Upgrade
BASE: STABLE DIRECT SUPABASE. Autenticazione, family_id e sincronizzazione non modificati.

Aggiunto:
- Routine Casa semplice: spazzare, mocio, lavatrice, asciugatrice, lenzuola, asciugamani
- Fatto adesso + inserimento/modifica retroattiva di chi/data/ora/nota
- modifica degli eventi Caty/Kiko/Astro
- Astro: traversina al posto delle passeggiate
- modifica visite/medicine esistenti
- lista spesa con URL prodotto, prezzo previsto e modifica
- acquisto con prezzo effettivo e registrazione automatica nelle spese
- bollette/abbonamenti con costo, scadenza, frequenza, destinatario reminder
- ricette apribili dal menu + ingredienti nella spesa
- calendario arricchito con routine casa e scadenze

## HOTFIX KIKI LOGIN
Corretto riferimento legacy `houseDone` rimasto nella Home dopo il passaggio alla nuova Routine Casa.
Autenticazione, family_id e sincronizzazione Supabase NON modificati.
