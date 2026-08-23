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

## AUTH FIX definitivo
- la schermata login viene mostrata solo se non esiste una sessione valida
- dopo `signInWithPassword` riuscito si entra immediatamente nell'app
- errori su family_members / family_state / RLS non rimandano più alla login
- `onAuthStateChange` riapre la login esclusivamente su SIGNED_OUT
- Supabase può fallire senza bloccare l'interfaccia

## LOGIN HARD FIX
La UI di login non dipende più dagli eventi Auth di Supabase.
Dopo una sessione valida l'app resta aperta anche in caso di refresh token,
errore RLS, errore family_state o perdita temporanea di rete.

## AUTH/UI SEPARATION FIX
- autenticazione e rendering UI hanno catch separati
- un errore in renderAll non viene più interpretato come login fallito
- dopo una sessione valida la schermata login non può essere riaperta da errori UI/cloud
