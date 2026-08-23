# Fagiolini V8 FINAL LOGIC

Build funzionale congelata. Da qui in poi modificare soprattutto grafica/UX.

## Incluso
- Supabase JJ/Kiki
- Caty, Kiko, Astro
- date di nascita ed età automatiche
- registrazioni pappa/pannolino/cacca/nanna/bagnetto
- Astro: traversina, pipì, pappa, farmaco, toeletta
- JJ/Kiki: spese personali
- menu settimanale + profili alimentari + allergeni/preferenze
- ricette + ingredienti nella spesa
- visite e medicine
- calendario unico
- routine casa
- ciclo bucato collegato
- spesa
- bilancio mensile
- bollette/abbonamenti con scadenza, frequenza e pagamento
- reminder con destinatario JJ/Kiki/entrambi
- struttura Telegram pronta nei dati

## Telegram
L'invio reale richiede ancora:
1. bot BotFather
2. token salvato come Secret Supabase
3. chat ID di JJ e Kiki
4. Edge Function / scheduler Supabase

Non inserire il token del bot nel repository GitHub.


## LOGIN FIX
- dopo login riuscito l'app entra immediatamente
- Supabase viene inizializzato dopo l'ingresso
- un errore cloud non lascia più l'utente bloccato sulla schermata di login
- messaggi espliciti per account non associato / errore RLS / errore database
- uso della cache locale come fallback
