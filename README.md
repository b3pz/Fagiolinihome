# Fagiolini V9.4 — FINAL STABLE

Release finale progettata come app familiare semplice, leggibile e mobile-first.

## Novità V9.4
- iPhone: testi realmente più grandi, icone della barra ridimensionate e Home centrale proporzionata.
- Mac/PC: layout desktop landscape, con contenuti più larghi e griglie a 2–3 colonne.
- Tema: Chiaro / Scuro / Sistema, memorizzato sul dispositivo e cambio rapido dall'header.
- Compleanni della famiglia: nel giorno del compleanno la Home mostra un augurio dedicato. Le date dei profili vengono usate automaticamente.
- Fagiolini Bank: schermata principale breve; Dove spendiamo, Salvadanai, Bollette e Movimenti sono pagine interne vere, non popup lunghi.
- Pasti: prima si vede oggi, poi un solo giorno della settimana alla volta. Rimossa la pagina infinita con tutti i campi aperti.
- Ricettario di famiglia: Kiki/JJ possono aggiungere ricette reali con ingredienti e preparazione. Le ricette salvate vengono preferite dal generatore settimanale.
- Auto: niente più “Spesa veloce auto” aperta. La pagina mostra riepilogo e azioni; il form si apre solo con “Aggiungi spesa”.
- Popup: restano solo per azioni brevi e sono centrati correttamente su iPhone.

## Funzioni preservate
Login e sincronizzazione Supabase, sessione 3 ore, Telegram backend, Calendario interattivo, compleanni amici/parenti, ferie/smart working/malattia, calcetto, Piano Casa, vincoli Spazzare→Lavare pavimenti e Lavatrice→Asciugatrice, raccolta rifiuti, Salute, Spesa e Promemoria.

## Deploy GitHub Pages
Caricare tutti i file direttamente nella root del repository, senza creare sottocartelle.

## V9.4.1 UI FIX
- Dark mode rebuilt for real contrast: no white/light cards with faded text.
- Pasti dark-mode inputs/cards/tabs corrected.
- iPhone bottom navigation redesigned smaller and more iOS-like.
- Home remains central but no longer oversized.
- Desktop floating navigation preserved, with extra content clearance so it does not hide forms.
- No auth, Supabase, Telegram or data model changes.
