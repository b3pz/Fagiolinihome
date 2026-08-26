# Fagiolini V18 — Family First

Revisione UX, leggibilità e linguaggio quotidiano, mantenendo il visual elegante della V17.1.

## Cosa cambia
- **Bank più chiara**: soldi del mese, entrate, uscite, quanto resta e obiettivo mensile sono separati dai salvadanai.
- **Salvadanai Vacanze/Natale**: indicano quanto vogliamo accumulare prima della spesa, quanto è già stato messo da parte e quanto manca. Non sono budget da spendere durante la vacanza.
- **Auto a pulsanti**: Benzina, Meccanico, Autostrada, Accessori, Manutenzione, Bollo, Assicurazione, Revisione.
- **Bollo/Assicurazione**: data attivazione/pagamento, fine validità, rinnovo e costo.
- **Casa & lavori a pulsanti**: Bollette, Intervento, Da comprare.
- **Bollette a pulsanti**: Luce, Gas, Acqua, Internet, Telefono, Abbonamenti; il modulo usa domande esplicite e leggibili.
- **Interventi casa**: chi è venuto, cosa ha fatto, quanto è costato, stato e promemoria.
- **Spese collegate alla Banca**: Auto, manutenzioni casa, bollette pagate e acquisti registrati confluiscono nelle uscite.
- **Lista acquisti a categorie**: Alimentari, Bambini, Astro, Casa, Regali, Wishlist. Il form appare solo quando si aggiunge qualcosa.
- **Astro**: Cacca resta una registrazione principale insieme a Pappa/Pipì/cure; Traversina non compare più tra le nuove registrazioni.
- **Rifiuti**: icona bidone riconoscibile, nomi testuali e colori usati solo come supporto.
- **Calendario**: azioni esplicite “Vedi dettagli”, “Aggiungi al giorno”, “Aggiungi a questo giorno”.
- **Pasti**: rimossi contatori e frasi impersonali come “12 pasti scelti / 9 da decidere”.
- **Linguaggio**: ripuliti CTA e testi troppo tecnici/da gestionale o da AI.
- **Desktop**: dimensioni attuali preservate; il pieno utilizzo della larghezza resta un perfezionamento futuro.
- **iPhone/Safari**: testo, metadati, pulsanti, form e touch target più grandi; input a 16px+ per evitare zoom automatico.
- **Dark mode**: contrasto rivisto in Rifiuti, Bank, Calendario, input, pulsanti e nuove griglie.

## Tecnico
- cache busting `18.0.0`
- struttura tutta nella root per GitHub Pages
- `sw.js` resta volutamente inattivo/unregister
- login, Supabase, sessione, Telegram e Cron non modificati
