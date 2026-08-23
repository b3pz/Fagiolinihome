
const SUPABASE_URL='https://xkiruygivdkqgbmldtow.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_p9dN7dsr55WqxH0kS-QX0g_hQY_uxqc';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
let cloudSession=null;
let cloudFamilyId=null;
let cloudMemberName='';
let cloudReady=false;
let applyingRemote=false;
let uploadTimer=null;
let cloudPollTimer=null;
let realtimeChannel=null;
let lastCloudUpdatedAt=null;

const KEY='familyHubV2';
const DEFAULT={
 children:[
  {id:'caty',name:'Caty',emoji:'👧',type:'child',birthDate:'2024-12-10'},
  {id:'kiko',name:'Kiko',emoji:'👶',type:'child',birthDate:'2026-02-11'},
  {id:'astro',name:'Astro',emoji:'🐶',type:'dog',birthDate:'2025-10-19'}
 ],
 events:[],tasks:[],house:[
  {id:crypto.randomUUID(),text:'Riordinare cucina',owner:'Famiglia',frequency:'giornaliera',done:[]},
  {id:crypto.randomUUID(),text:'Pulire bagno',owner:'Famiglia',frequency:'settimanale',done:[]}
 ],
 shopping:[],menu:{},expenses:[],health:[],
 menuBackup:null,
 profiles:{
  caty:{ageMonths:20,likes:'',dislikes:'',allergens:''},
  kiko:{ageMonths:6,likes:'',dislikes:'',allergens:''},
  jj:{ageMonths:420,likes:'',dislikes:'',allergens:''},
  kiki:{ageMonths:420,likes:'',dislikes:'',allergens:''}
 }
};
const ADULTS={
 jj:{name:'JJ',emoji:'👨',birthDate:'1991-05-31'},
 kiki:{name:'Kiki',emoji:'👩',birthDate:'1990-08-24'}
};
const META={
 pappa:['🍼','Pappa'],pannolino:['🚼','Pannolino'],cacca:['💩','Cacca'],nanna:['😴','Nanna'],bagnetto:['🛁','Bagnetto'],
 traversina:['🐾','Traversina'],pipi:['💧','Pipì'],farmaco:['💊','Farmaco'],toeletta:['🛁','Toeletta']
};
let s=load(),current='caty',currentAdult='jj',dayOffset=0,quickPerson='caty',pendingPerson=null,moneyOffset=0,calOffset=0,selectedDate=dateKey(),editingEventId=null,editingHouseId=null,editingShopId=null,buyingShopId=null,editingMaintenanceId=null,editingAutoDeadlineId=null;

function load(){
 let out=structuredClone(DEFAULT);
 try{const raw=localStorage.getItem(KEY);if(raw)out={...out,...JSON.parse(raw)}}catch{}
 out.children=(out.children||[]).map(c=>{
  if(c.id==='domenico'||c.name==='Domenico')return {...c,id:'kiko',name:'Kiko',emoji:'👶',type:'child'};
  if(c.id==='astro')return {...c,name:'Astro',emoji:'🐶',type:'dog',birthDate:'2025-10-19'};
  if(c.id==='caty')return {...c,name:'Caty',emoji:'👧',type:'child',birthDate:'2024-12-10'};
  if(c.id==='kiko')return {...c,name:'Kiko',emoji:'👶',type:'child',birthDate:'2026-02-11'};
  return c
 });
 if(!out.children.some(c=>c.id==='astro'))out.children.push({id:'astro',name:'Astro',emoji:'🐶',type:'dog',birthDate:'2025-10-19'});
 out.events=(out.events||[]).map(e=>e.childId==='domenico'?{...e,childId:'kiko'}:e);
 out.health=Array.isArray(out.health)?out.health:[];
 out.expenses=Array.isArray(out.expenses)?out.expenses:[];
 out.profiles={...DEFAULT.profiles,...(out.profiles||{})};
 out.house=Array.isArray(out.house)?out.house:[];
 out.shopping=Array.isArray(out.shopping)?out.shopping:[];
 out.tasks=Array.isArray(out.tasks)?out.tasks:[];
 out.menu=out.menu||{};
 out.menuBackup=out.menuBackup||null;
 out.profiles.caty.ageMonths=monthsFromBirth('2024-12-10');
 out.profiles.kiko.ageMonths=monthsFromBirth('2026-02-11');
 out.profiles.jj.ageMonths=monthsFromBirth('1991-05-31');
 out.profiles.kiki.ageMonths=monthsFromBirth('1990-08-24');
 out.houseLogs=Array.isArray(out.houseLogs)?out.houseLogs:[];
 out.subscriptions=Array.isArray(out.subscriptions)?out.subscriptions:[];
 out.maintenance=Array.isArray(out.maintenance)?out.maintenance:[];
 out.autoDeadlines=Array.isArray(out.autoDeadlines)?out.autoDeadlines:[];
 out.autoExpenses=Array.isArray(out.autoExpenses)?out.autoExpenses:[];
 out.shopping=(out.shopping||[]).map(x=>({...x,text:x.text||x.name||'',qty:x.qty||'',category:x.category||'Altro',url:x.url||'',expectedPrice:Number(x.expectedPrice||0),actualPrice:Number(x.actualPrice||0)}));
  return out
}
function save(){
 localStorage.setItem(KEY,JSON.stringify(s));
 renderAll();
 if(cloudReady&&!applyingRemote)scheduleCloudUpload()
}
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dateObj(k){let [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d,12)}
function offsetDate(n){let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d}
function longDate(d=new Date()){return new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(d)}
function timeLabel(iso){return new Date(iso).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}
function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function events(person,d=new Date()){let k=dateKey(d);return s.events.filter(e=>e.childId===person&&dateKey(new Date(e.at))===k).sort((a,b)=>new Date(b.at)-new Date(a.at))}
function count(person,type,d=new Date()){return events(person,d).filter(e=>e.type===type).length}
function sleepActive(person){return [...s.events].reverse().find(e=>e.childId===person&&e.type==='nanna'&&!e.endAt)}
function sleepMinutes(person,d=new Date()){let k=dateKey(d),t=0;s.events.filter(e=>e.childId===person&&e.type==='nanna'&&dateKey(new Date(e.at))===k).forEach(e=>t+=Math.max(0,((e.endAt?new Date(e.endAt):new Date())-new Date(e.at))/60000));return Math.round(t)}
function duration(m){let h=Math.floor(m/60),r=m%60;return h?`${h}h${r?' '+r+'m':''}`:`${r}m`}
function monthsFromBirth(k){let b=dateObj(k),n=new Date(),months=(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth();if(n.getDate()<b.getDate())months--;return Math.max(0,months)}
function ageFromBirth(k){let b=dateObj(k),n=new Date(),months=(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth();if(n.getDate()<b.getDate())months--;months=Math.max(0,months);return months<24?`${months} mesi`:`${Math.floor(months/12)} anni${months%12?` e ${months%12} mesi`:''}`}
function birthLabel(k){return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'}).format(dateObj(k))}
function personName(id){return ({caty:'Caty',kiko:'Kiko',astro:'Astro',jj:'JJ',kiki:'Kiki',family:'Famiglia'})[id]||id}



const HOUSE_ROUTINES=[
 {id:'sweep',emoji:'🧹',name:'Spazzare'},
 {id:'mop',emoji:'🧽',name:'Dare il mocio'},
 {id:'washer',emoji:'🧺',name:'Lavatrice'},
 {id:'dryer',emoji:'♨️',name:'Asciugatrice'},
 {id:'sheets',emoji:'🛏️',name:'Cambio lenzuola'},
 {id:'towels',emoji:'🚿',name:'Cambio asciugamani / asciugaculo'}
];
const RECIPE_DETAILS={
 'Pasta al pomodoro':{time:'20 min',ingredients:['Pasta','Passata di pomodoro','Olio EVO','Parmigiano'],steps:['Cuoci la pasta.','Scalda la passata con poco olio.','Scola e condisci.']},
 'Pasta e lenticchie':{time:'35 min',ingredients:['Pasta piccola','Lenticchie','Passata di pomodoro','Olio EVO'],steps:['Cuoci le lenticchie.','Aggiungi pomodoro e acqua.','Unisci la pasta e porta a cottura.']},
 'Risotto con zucchine':{time:'30 min',ingredients:['Riso','Zucchine','Brodo vegetale','Parmigiano'],steps:['Cuoci le zucchine.','Aggiungi il riso.','Porta a cottura con il brodo e manteca.']},
 'Riso con verdure e pollo':{time:'35 min',ingredients:['Riso','Verdure','Pollo','Olio EVO'],steps:['Cuoci pollo e verdure.','Cuoci il riso.','Unisci e servi.']},
 'Frittata con verdure':{time:'25 min',ingredients:['Uova','Verdure','Parmigiano'],steps:['Cuoci le verdure.','Sbatti le uova.','Unisci e cuoci bene.']},
 'Pesce al forno con patate':{time:'45 min',ingredients:['Pesce','Patate','Olio EVO'],steps:['Taglia le patate.','Aggiungi il pesce.','Cuoci completamente in forno.']},
 'Pasta con crema di zucchine':{time:'25 min',ingredients:['Pasta','Zucchine','Olio EVO','Parmigiano'],steps:['Cuoci le zucchine.','Frullale.','Condisci la pasta.']},
 'Riso con piselli':{time:'30 min',ingredients:['Riso','Piselli','Brodo vegetale'],steps:['Cuoci i piselli.','Aggiungi il riso.','Porta a cottura.']}
};
function isoFromLocal(date,time){return new Date(`${date}T${time||'12:00'}:00`).toISOString()}
function localDateFromIso(iso){return dateKey(new Date(iso))}
function localTimeFromIso(iso){return new Date(iso).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}
function latestHouse(id){return [...s.houseLogs].filter(x=>x.routineId===id).sort((a,b)=>new Date(b.at)-new Date(a.at))[0]}
function houseName(id){return HOUSE_ROUTINES.find(x=>x.id===id)?.name||id}
function houseIcon(id){return HOUSE_ROUTINES.find(x=>x.id===id)?.emoji||'🏠'}
function nextSubDate(k,f){let d=dateObj(k);if(f==='monthly')d.setMonth(d.getMonth()+1);else if(f==='bimonthly')d.setMonth(d.getMonth()+2);else if(f==='quarterly')d.setMonth(d.getMonth()+3);else if(f==='semiannual')d.setMonth(d.getMonth()+6);else if(f==='annual')d.setFullYear(d.getFullYear()+1);return dateKey(d)}
function openRecipe(name){let r=RECIPE_DETAILS[name]||{time:'30 min',ingredients:[name,'Olio EVO','Ingredienti a piacere'],steps:['Prepara gli ingredienti.','Cuoci completamente.','Servi.']};recipeDialog.dataset.recipe=name;recipeTitle.textContent=name;recipeBody.innerHTML=`<div class="recipeTime">⏱️ ${esc(r.time)}</div><h4>Ingredienti</h4><ul>${r.ingredients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>Preparazione</h4><ol>${r.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="adaptation"><b>👧👶 Bambini</b><br>Adatta sale, consistenza e dimensione dei pezzi all’età di Caty e Kiko.</div>`;recipeDialog.showModal()}

function maintenanceIcon(type){return ({Caldaia:'🔥',Climatizzatore:'❄️',Idraulico:'🚰',Elettricista:'⚡',Elettrodomestico:'🔌','Manutenzione generica':'🧰',Altro:'🏠'})[type]||'🧰'}
function autoIcon(type){return ({Assicurazione:'🛡️',Bollo:'📄',Revisione:'🔍',Tagliando:'🔧',Gomme:'🛞',Manutenzione:'🧰',Benzina:'⛽',Parcheggio:'🅿️',Pedaggio:'🛣️',Lavaggio:'🧼',Riparazione:'🔧',Accessorio:'🛒',Altro:'🚗'})[type]||'🚗'}
function nextRecurringDate(k,f){let d=dateObj(k);if(f==='monthly')d.setMonth(d.getMonth()+1);else if(f==='semiannual')d.setMonth(d.getMonth()+6);else if(f==='annual')d.setFullYear(d.getFullYear()+1);else if(f==='biennial')d.setFullYear(d.getFullYear()+2);return dateKey(d)}
function ensureExpenseOnce(source,sourceId,name,amount,category,date,person=null){
 if(!Number(amount)||Number(amount)<=0)return;
 if(s.expenses.some(x=>x.source===source&&x.sourceId===sourceId))return;
 s.expenses.push({id:crypto.randomUUID(),name,amount:Number(amount),category,person,month:monthKey(dateObj(date)),date,recurring:false,source,sourceId});
}
function setCloudStatus(mode,text){
 if(!cloudStatus)return;
 cloudStatus.className='cloudStatus '+mode;
 cloudStatus.querySelector('small').textContent=text;
}

function isMeaningfulState(data){
 if(!data||typeof data!=='object')return false;
 return ['events','shopping','expenses','health'].some(k=>Array.isArray(data[k])&&data[k].length)
   || (data.menu&&Object.keys(data.menu).length)
   || (Array.isArray(data.house)&&data.house.length)
   || (Array.isArray(data.tasks)&&data.tasks.length);
}

function normalizeRemoteState(data){
 let out={...structuredClone(DEFAULT),...(data||{})};
 out.children=(out.children||[]).map(c=>{
  if(c.id==='domenico'||c.name==='Domenico')return {...c,id:'kiko',name:'Kiko',emoji:'👶',type:'child',birthDate:'2026-02-11'};
  if(c.id==='caty')return {...c,name:'Caty',emoji:'👧',type:'child',birthDate:'2024-12-10'};
  if(c.id==='kiko')return {...c,name:'Kiko',emoji:'👶',type:'child',birthDate:'2026-02-11'};
  if(c.id==='astro')return {...c,name:'Astro',emoji:'🐶',type:'dog',birthDate:'2025-10-19'};
  return c
 });
 if(!out.children.some(c=>c.id==='astro'))out.children.push({id:'astro',name:'Astro',emoji:'🐶',type:'dog',birthDate:'2025-10-19'});
 out.events=Array.isArray(out.events)?out.events:[];
 out.tasks=Array.isArray(out.tasks)?out.tasks:[];
 out.house=Array.isArray(out.house)?out.house:[];
 out.shopping=Array.isArray(out.shopping)?out.shopping:[];
 out.expenses=Array.isArray(out.expenses)?out.expenses:[];
 out.health=Array.isArray(out.health)?out.health:[];
 out.menu=out.menu||{};
 out.profiles={...DEFAULT.profiles,...(out.profiles||{})};
 out.menuBackup=out.menuBackup||null;
 out.houseLogs=Array.isArray(out.houseLogs)?out.houseLogs:[];
 out.subscriptions=Array.isArray(out.subscriptions)?out.subscriptions:[];
 out.maintenance=Array.isArray(out.maintenance)?out.maintenance:[];
 out.autoDeadlines=Array.isArray(out.autoDeadlines)?out.autoDeadlines:[];
 out.autoExpenses=Array.isArray(out.autoExpenses)?out.autoExpenses:[];
 out.shopping=(out.shopping||[]).map(x=>({...x,text:x.text||x.name||'',qty:x.qty||'',category:x.category||'Altro',url:x.url||'',expectedPrice:Number(x.expectedPrice||0),actualPrice:Number(x.actualPrice||0)}));
 return out
}

async function cloudLogin(email,password){
 loginMessage.textContent='';
 loginButton.disabled=true;
 loginButton.textContent='Accesso...';

 try{
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error)throw error;
  if(!data?.session)throw new Error('Sessione Supabase non ricevuta');

  cloudSession=data.session;

  // Da qui il login è riuscito: entra subito.
  loginScreen.classList.add('hidden');
  renderAll();

  // La sincronizzazione è separata.
  await initializeCloud();

 }catch(err){
  console.error('Auth error:',err);
  loginScreen.classList.remove('hidden');
  loginMessage.textContent='Accesso non riuscito: '+(err.message||'controlla email e password.');
 }finally{
  loginButton.disabled=false;
  loginButton.textContent='Accedi';
 }
}

async function initializeCloud(){
 if(!cloudSession){
  const {data}=await sb.auth.getSession();
  cloudSession=data.session;
 }
 if(!cloudSession){
  loginScreen.classList.remove('hidden');
  setCloudStatus('offline','Locale');
  return;
 }

 // Login riuscito: la schermata login viene chiusa SUBITO.
 loginScreen.classList.add('hidden');
 loginMessage.textContent='';
 setCloudStatus('syncing','Connessione…');

 cloudFamilyId='8e7df5f2-7339-48dd-96db-dec7a04b070e';
 cloudMemberName=cloudSession.user.user_metadata?.display_name ||
   (cloudSession.user.email?.toLowerCase().includes('federica')?'Kiki':'JJ');

 try{
  const {data:row,error}=await sb
   .from('family_state')
   .select('data,updated_at')
   .eq('family_id',cloudFamilyId)
   .maybeSingle();

  if(error)throw error;

  const remote=row?.data||{};
  lastCloudUpdatedAt=row?.updated_at||null;

  if(isMeaningfulState(remote)){
   applyingRemote=true;
   s=normalizeRemoteState(remote);
   localStorage.setItem(KEY,JSON.stringify(s));
   renderAll();
   applyingRemote=false;
  }else{
   await uploadCloudState(true);
  }

  cloudReady=true;
  updateAccountInfo();
  setCloudStatus('online','Sincronizzato');
  startCloudWatch();

 }catch(err){
  console.error('Supabase family_state error:',err);
  // Non tornare MAI alla login: l'utente è già autenticato.
  cloudReady=false;
  setCloudStatus('error','Solo locale');
  renderAll();
 }
}

function scheduleCloudUpload(){
 clearTimeout(uploadTimer);
 setCloudStatus('syncing','Salvataggio…');
 uploadTimer=setTimeout(()=>uploadCloudState(false),450);
}

async function uploadCloudState(force=false){
 if(!cloudFamilyId||!cloudSession)return;
 try{
  const payload=JSON.parse(JSON.stringify(s));
  const now=new Date().toISOString();
  const {data,error}=await sb
   .from('family_state')
   .update({data:payload,updated_at:now})
   .eq('family_id',cloudFamilyId)
   .select('updated_at')
   .single();
  if(error)throw error;
  lastCloudUpdatedAt=data?.updated_at||now;
  setCloudStatus('online','Sincronizzato');
 }catch(err){
  console.error('Cloud upload error',err);
  setCloudStatus('error','Da sincronizzare');
 }
}

async function pullCloudState(silent=true){
 if(!cloudReady||!cloudFamilyId)return;
 try{
  const {data:row,error}=await sb
   .from('family_state')
   .select('data,updated_at')
   .eq('family_id',cloudFamilyId)
   .single();
  if(error)throw error;
  if(row?.updated_at&&row.updated_at!==lastCloudUpdatedAt){
   applyingRemote=true;
   s=normalizeRemoteState(row.data);
   localStorage.setItem(KEY,JSON.stringify(s));
   lastCloudUpdatedAt=row.updated_at;
   renderAll();
   applyingRemote=false;
  }
  setCloudStatus('online','Sincronizzato');
 }catch(err){
  if(!silent)console.error('Cloud pull error',err);
  setCloudStatus('error','Offline');
 }
}

function startCloudWatch(){
 if(cloudPollTimer)clearInterval(cloudPollTimer);
 cloudPollTimer=setInterval(()=>pullCloudState(true),8000);

 if(realtimeChannel)sb.removeChannel(realtimeChannel);
 realtimeChannel=sb.channel('fagiolini-family-state')
  .on('postgres_changes',{
   event:'UPDATE',schema:'public',table:'family_state',
   filter:`family_id=eq.${cloudFamilyId}`
  },payload=>{
   const row=payload.new;
   if(row?.updated_at===lastCloudUpdatedAt)return;
   applyingRemote=true;
   s=normalizeRemoteState(row.data);
   localStorage.setItem(KEY,JSON.stringify(s));
   lastCloudUpdatedAt=row.updated_at||null;
   renderAll();
   applyingRemote=false;
   setCloudStatus('online','Aggiornato');
  })
  .subscribe();
}

function updateAccountInfo(){
 if(!accountInfo)return;
 const email=cloudSession?.user?.email||'';
 accountInfo.innerHTML=`<div class="accountAvatar">${cloudMemberName==='Kiki'?'👩':'👨'}</div>
 <div><b>${esc(cloudMemberName||'Fagiolini')}</b><div class="meta">${esc(email)}</div><div class="meta">Famiglia: Fagiolini</div></div>`;
}

async function cloudLogout(){
 cloudReady=false;
 cloudFamilyId=null;
 cloudMemberName='';
 if(cloudPollTimer)clearInterval(cloudPollTimer);
 if(realtimeChannel){sb.removeChannel(realtimeChannel);realtimeChannel=null}
 await sb.auth.signOut();
 cloudSession=null;
 accountDialog.close();
 loginScreen.classList.remove('hidden');
 setCloudStatus('offline','Locale');
}

async function bootCloud(){
 if(!navigator.onLine)setCloudStatus('error','Offline');
 const {data}=await sb.auth.getSession();
 cloudSession=data.session;
 if(cloudSession)await initializeCloud();
 else loginScreen.classList.remove('hidden');

 sb.auth.onAuthStateChange(async(event,session)=>{
  cloudSession=session;
  if(event==='SIGNED_OUT'){
   cloudReady=false;
   loginScreen.classList.remove('hidden');
  }
 });
}

function go(id){
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
 document.getElementById(id).classList.add('on');
 const titles={home:'La nostra giornata',person:'Registro',adult:'Noi',menu:'Menu famiglia',profiles:'Profili alimentari',health:'Visite e medicine',calendar:'Calendario',house:'Casa',shop:'Spesa',money:'Soldi',maintenance:'Manutenzioni casa',auto:'Auto'};
 pageTitle.textContent=titles[id]||'Fagiolini';
 if(id==='home')renderHome();if(id==='adult')renderAdult();if(id==='menu')renderMenu();if(id==='profiles')renderProfiles();if(id==='health')renderHealth();if(id==='calendar')renderCalendar();if(id==='house')renderHouse();if(id==='shop')renderShop();if(id==='money'){renderMoney();renderSubscriptions();}if(id==='maintenance')renderMaintenance();if(id==='auto')renderAuto();
 scrollTo(0,0)
}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());

function renderHome(){
 todayLabel.textContent=longDate();
 peopleCards.innerHTML=s.children.map(c=>{
  if(c.type==='dog'){
   let ev=events(c.id),walk=ev.find(e=>e.type==='traversina');
   return `<button class="personCard pet" data-person="${c.id}"><i>${c.emoji}</i><b>${c.name}</b><span class="muted">🎂 ${birthLabel(c.birthDate)} · ${ageFromBirth(c.birthDate)}<br>🐾 ${walk?timeLabel(walk.at):'—'} · 💩 ${count(c.id,'cacca')}</span></button>`
  }
  return `<button class="personCard" data-person="${c.id}"><i>${c.emoji}</i><b>${c.name}</b><span class="muted">🎂 ${birthLabel(c.birthDate)} · ${ageFromBirth(c.birthDate)}<br>💩 ${count(c.id,'cacca')} · 🚼 ${count(c.id,'pannolino')} · 🍼 ${count(c.id,'pappa')}</span></button>`
 }).join('');
 peopleCards.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>openPerson(b.dataset.person));
 document.querySelectorAll('[data-adult]').forEach(b=>b.onclick=()=>{currentAdult=b.dataset.adult;go('adult')});

 const healthToday=s.health.filter(h=>h.date===dateKey());
 const dueHouse=HOUSE_ROUTINES.filter(r=>{
  const last=latestHouse(r.id);
  if(!last)return true;
  const days=(Date.now()-new Date(last.at).getTime())/86400000;
  const limits={sweep:1,mop:2,washer:3,dryer:3,sheets:7,towels:3};
  return days>=(limits[r.id]||7);
}).map(r=>({emoji:r.emoji,title:r.name,freq:'Routine casa',owner:'Famiglia'}));
 todayOverview.innerHTML=[
  healthToday.length?`<div class="row">❤️<div class="grow"><b>${healthToday.length} evento salute</b><div class="meta">${healthToday.map(h=>esc(h.title||h.name)).join(' · ')}</div></div></div>`:'',
  `<div class="row">🧹<div class="grow"><b>${dueHouse.length} attività di casa</b><div class="meta">Ancora da completare</div></div></div>`,
  `<div class="row">🛒<div class="grow"><b>${s.shopping.filter(x=>!x.done).length} cose da comprare</b><div class="meta">Lista della spesa</div></div></div>`
 ].join('');

 let md=s.menu[dateKey()]||{};
 menuToday.innerHTML=`<div class="mealBox"><span>🍝 PRANZO</span><b>${esc(md.lunch||'Non impostato')}</b></div><div class="mealBox"><span>🌙 CENA</span><b>${esc(md.dinner||'Non impostata')}</b></div>`;

 let due=dueHouse.slice(0,3);
 houseToday.innerHTML=due.length?due.map(h=>`<div class="row"><span>🧹</span><div class="grow"><b>${esc(h.text)}</b><div class="meta">${h.frequency} · ${h.owner}</div></div></div>`).join(''):'<div class="muted">Tutto fatto per ora.</div>';

 let mk=monthKey(new Date()),ex=s.expenses.filter(x=>x.month===mk),tot=ex.reduce((a,x)=>a+Number(x.amount||0),0);
 moneyToday.innerHTML=`<div class="row"><span>💶</span><div class="grow"><b>${euro(tot)}</b><div class="meta">${ex.length} voci registrate questo mese</div></div></div>`
}

function openPerson(id){current=id;dayOffset=0;go('person');renderPerson()}
function personActionKeys(c){return c.type==='dog'?['pappa','traversina','cacca','pipi','farmaco','toeletta']:['pappa','pannolino','cacca','nanna','bagnetto']}
function actionIcon(type,person){if(type==='pappa'&&person==='astro')return '🍽️';return META[type]?.[0]||'•'}
function renderPerson(){
 let c=s.children.find(x=>x.id===current);personTitle.textContent=`${c.emoji} ${c.name}`;
 if(c.type==='dog')personStats.innerHTML=[['🦮 Passeggiate',count(current,'passeggiata')],['🍽️ Pappe',count(current,'pappa')],['💩 Cacche',count(current,'cacca')],['💧 Pipì',count(current,'pipi')]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
 else personStats.innerHTML=[['💩 Cacche',count(current,'cacca')],['🚼 Pannolini',count(current,'pannolino')],['🍼 Pappe',count(current,'pappa')],['😴 Sonno',duration(sleepMinutes(current))]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
 personActions.innerHTML=personActionKeys(c).map(k=>`<button data-action="${k}">${actionIcon(k,current)}<small>${META[k][1]}</small></button>`).join('');
 personActions.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>handleAction(current,b.dataset.action));
 let d=offsetDate(dayOffset);dayLabel.textContent=dayOffset===0?'Oggi':longDate(d);dayNext.disabled=dayOffset>=0;
 let a=events(current,d);personTimeline.innerHTML=a.length?a.map(e=>{let m=META[e.type]||['•',e.type],note=e.note||'';if(e.type==='nanna')note=e.endAt?`Fine ${timeLabel(e.endAt)} · ${duration(Math.round((new Date(e.endAt)-new Date(e.at))/60000))}`:'In corso';return `<div class="row"><b>${timeLabel(e.at)}</b><span>${actionIcon(e.type,current)}</span><div class="grow"><b>${m[1]}</b><div class="meta">${esc(note)}</div></div><button class="del" data-del-event="${e.id}">✕</button></div>`}).join(''):'<div class="muted">Niente registrato in questa giornata.</div>';
 personTimeline.querySelectorAll('[data-del-event]').forEach(b=>b.onclick=()=>{s.events=s.events.filter(e=>e.id!==b.dataset.delEvent);save()})
}
dayPrev.onclick=()=>{dayOffset--;renderPerson()};dayNext.onclick=()=>{if(dayOffset<0){dayOffset++;renderPerson()}};

function handleAction(person,type){
 if(type==='cacca'){pendingPerson=person;poopType.value='Normale';poopNote.value='';poopDialog.showModal();return}
 if(type==='nanna'){pendingPerson=person;let a=sleepActive(person);sleepMessage.textContent=a?'La nanna è in corso. Segno il risveglio adesso?':'Segno l’inizio della nanna adesso?';sleepDialog.showModal();return}
 s.events.push({id:crypto.randomUUID(),childId:person,type,at:new Date().toISOString(),note:''});save()
}
poopForm.onsubmit=e=>{e.preventDefault();s.events.push({id:crypto.randomUUID(),childId:pendingPerson,type:'cacca',at:new Date().toISOString(),note:[poopType.value,poopNote.value.trim()].filter(Boolean).join(' · ')});poopDialog.close();save()};
sleepForm.onsubmit=e=>{e.preventDefault();let a=sleepActive(pendingPerson);if(a)a.endAt=new Date().toISOString();else s.events.push({id:crypto.randomUUID(),childId:pendingPerson,type:'nanna',at:new Date().toISOString(),endAt:null,note:''});sleepDialog.close();save()};



function adultMonthExpenses(id=currentAdult){
 let k=monthKey(new Date());
 return s.expenses.filter(x=>x.month===k && x.person===id);
}
function adultExpenseIcon(cat){
 return ({'Pranzo lavoro':'🍝','Caffè / Bar':'☕️','Trasporti':'🚆','Acquisti personali':'🛍️','Svago':'🎬','Altro':'💳'})[cat]||'💳'
}
function renderAdult(){
 let a=ADULTS[currentAdult];
 adultTitle.textContent=`${a.emoji} ${a.name}`;
 let upcoming=s.health.filter(h=>h.person===currentAdult&&h.date>=dateKey()).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time));
 let meds=upcoming.filter(h=>h.kind==='medicine').length;
 let visits=upcoming.filter(h=>h.kind==='visit').length;
 let personal=adultMonthExpenses(currentAdult);
 let totalPersonal=personal.reduce((q,x)=>q+Number(x.amount||0),0);

 adultSummary.innerHTML=`
  <div class="stat"><span>ETÀ</span><b>${ageFromBirth(a.birthDate)}</b><div class="meta">🎂 ${birthLabel(a.birthDate)}</div></div>
  <div class="stat"><span>SPESO QUESTO MESE</span><b>${euro(totalPersonal)}</b></div>
  <div class="stat"><span>PROSSIME VISITE</span><b>${visits}</b></div>
  <div class="stat"><span>MEDICINE / PROMEMORIA</span><b>${meds}</b></div>`;

 adultExpenseTotal.textContent=euro(totalPersonal);

 let cats={};
 personal.forEach(x=>{
  let c=x.personalCategory||x.category||'Altro';
  cats[c]=(cats[c]||0)+Number(x.amount||0)
 });

 adultExpenseBreakdown.innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>
  `<div class="moneyCategory"><span>${adultExpenseIcon(cat)} ${esc(cat)}</span><b>${euro(val)}</b></div>`
 ).join('')||'<div class="muted">Ancora nessuna spesa personale questo mese.</div>';

 adultExpenseList.innerHTML=personal.length?personal.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(x=>
  `<div class="row">
    <span>${adultExpenseIcon(x.personalCategory||x.category)}</span>
    <div class="grow"><b>${esc(x.name)}</b><div class="meta">${esc(x.personalCategory||x.category||'Altro')}${x.date?' · '+longDate(dateObj(x.date)):''}</div></div>
    <b>${euro(x.amount)}</b>
    <button class="del" data-pdel="${x.id}">✕</button>
  </div>`
 ).join(''):'';

 adultExpenseList.querySelectorAll('[data-pdel]').forEach(b=>b.onclick=()=>{
  s.expenses=s.expenses.filter(x=>x.id!==b.dataset.pdel);
  save();
  renderAdult()
 });

 adultHealth.innerHTML=upcoming.length?upcoming.slice(0,8).map(h=>
  `<div class="row"><span>${h.kind==='visit'?'🩺':'💊'}</span><div class="grow"><b>${esc(h.title)}</b><div class="meta">${longDate(dateObj(h.date))}${h.time?' · '+h.time:''}${h.dose?' · '+esc(h.dose):''}</div></div></div>`
 ).join(''):'<div class="muted">Nessun impegno programmato.</div>';
}
adultVisit.onclick=()=>{go('health');visitPerson.value=currentAdult;visitTitle.focus()};
adultMedicine.onclick=()=>{go('health');medPerson.value=currentAdult;medName.focus()};

adultExpenseForm.onsubmit=e=>{
 e.preventDefault();
 let name=adultExpenseName.value.trim();
 let amount=Number(adultExpenseAmount.value);
 if(!name||!Number.isFinite(amount)||amount<0)return;
 let now=new Date();
 s.expenses.push({
  id:crypto.randomUUID(),
  name,
  amount,
  category:'Personale',
  personalCategory:adultExpenseCat.value,
  person:currentAdult,
  month:monthKey(now),
  date:dateKey(now),
  recurring:false
 });
 adultExpenseName.value='';
 adultExpenseAmount.value='';
 save();
 renderAdult()
};


function renderQuick(){
 quickPeople.innerHTML=s.children.map(c=>`<button class="personCard ${c.type==='dog'?'pet':''}" data-qp="${c.id}"><i>${c.emoji}</i><b>${c.name}</b></button>`).join('');
 quickPeople.querySelectorAll('[data-qp]').forEach(b=>b.onclick=()=>{quickPerson=b.dataset.qp;renderQuick()});
 let c=s.children.find(x=>x.id===quickPerson);
 quickActions.innerHTML=personActionKeys(c).map(k=>`<button data-qa="${k}">${actionIcon(k,quickPerson)}<small>${META[k][1]}</small></button>`).join('');
 quickActions.querySelectorAll('[data-qa]').forEach(b=>b.onclick=()=>{quickDialog.close();handleAction(quickPerson,b.dataset.qa)})
}
function openQuick(){quickPerson='caty';renderQuick();quickDialog.showModal()}
navQuick.onclick=openQuick;quickRecord.onclick=openQuick;

const RECIPES=[
 {name:'Pasta al pomodoro',tags:['pasta','pomodoro'],min:12,allergens:['glutine']},
 {name:'Pasta e lenticchie',tags:['pasta','legumi','lenticchie'],min:10,allergens:['glutine']},
 {name:'Risotto con zucchine',tags:['riso','zucchine'],min:8,allergens:[]},
 {name:'Riso con verdure e pollo',tags:['riso','verdure','pollo'],min:10,allergens:[]},
 {name:'Polpette di tacchino e patate',tags:['tacchino','patate'],min:10,allergens:[]},
 {name:'Frittata con verdure',tags:['uova','verdure'],min:10,allergens:['uova']},
 {name:'Pesce al forno con patate',tags:['pesce','patate'],min:10,allergens:['pesce']},
 {name:'Minestra di verdure e cereali',tags:['verdure','cereali'],min:10,allergens:['glutine']},
 {name:'Gnocchi al pomodoro',tags:['patate','pomodoro'],min:12,allergens:['glutine']},
 {name:'Cous cous con verdure',tags:['cous cous','verdure'],min:12,allergens:['glutine']},
 {name:'Vellutata di zucca e patate',tags:['zucca','patate'],min:6,allergens:[]},
 {name:'Crema di mais e tapioca con verdure',tags:['mais','tapioca','verdure'],min:6,allergens:[]},
 {name:'Crema di riso con verdure',tags:['riso','verdure'],min:6,allergens:[]},
 {name:'Passato di verdure con patata',tags:['verdure','patate'],min:6,allergens:[]},
 {name:'Pasta con crema di zucchine',tags:['pasta','zucchine'],min:10,allergens:['glutine']},
 {name:'Riso con piselli',tags:['riso','piselli'],min:10,allergens:[]},
 {name:'Hamburger di legumi e patate',tags:['legumi','patate'],min:12,allergens:[]},
 {name:'Pasta con ricotta e verdure',tags:['pasta','ricotta','verdure'],min:12,allergens:['glutine','latte']}
];
function csv(v){return String(v||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean)}
function profileAllowed(recipe,p){
 let dislikes=csv(p.dislikes),allergens=csv(p.allergens);
 if(recipe.allergens.some(a=>allergens.some(x=>a.includes(x)||x.includes(a))))return false;
 if(dislikes.some(d=>recipe.tags.some(t=>t.includes(d)||d.includes(t))||recipe.name.toLowerCase().includes(d)))return false;
 return true
}
function familyRecipePool(){
 let profiles=[s.profiles.caty,s.profiles.kiko,s.profiles.jj,s.profiles.kiki].filter(Boolean);
 return RECIPES.filter(r=>profiles.every(p=>profileAllowed(r,p)))
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function adaptation(recipe,id){
 let p=s.profiles[id]||{},age=Number(p.ageMonths||0);
 if(age<8)return `Per ${personName(id)}: consistenza e ingredienti da adattare alla fase alimentare indicata dal pediatra.`;
 if(age<12)return `Per ${personName(id)}: porzione morbida/sminuzzata e senza aggiunte non adatte all’età.`;
 if(age<24)return `Per ${personName(id)}: stessa base familiare, taglio e consistenza adatti.`;
 return `Per ${personName(id)}: porzione familiare adeguata all’età.`
}
generateMenu.onclick=()=>{
 s.menuBackup=JSON.parse(JSON.stringify(s.menu));
 let pool=familyRecipePool();if(pool.length<5){alert('Con i filtri attuali rimangono poche ricette. Controlla allergeni e cibi non graditi nei profili.');return}
 let choices=shuffle(pool),idx=0;
 for(let i=0;i<7;i++){let d=offsetDate(i),k=dateKey(d);if(idx>=choices.length){choices=shuffle(pool);idx=0}let lunch=choices[idx++];if(idx>=choices.length){choices=shuffle(pool);idx=0}let dinner=choices[idx++];s.menu[k]={lunch:lunch.name,dinner:dinner.name,lunchAdapt:{caty:adaptation(lunch,'caty'),kiko:adaptation(lunch,'kiko')},dinnerAdapt:{caty:adaptation(dinner,'caty'),kiko:adaptation(dinner,'kiko')}}}
 save();renderMenu()
};
undoMenu.onclick=()=>{
 if(!s.menuBackup){alert('Non c’è ancora un menu precedente da ripristinare.');return}
 s.menu=JSON.parse(JSON.stringify(s.menuBackup));
 s.menuBackup=null;
 save();
 renderMenu();
};
function renderMenu(){
 menuWeek.innerHTML='';
 for(let i=0;i<7;i++){let d=offsetDate(i),k=dateKey(d),m=s.menu[k]||{};let el=document.createElement('div');el.className='menuDay'+(i===0?' today':'');el.innerHTML=`<h3>${i===0?'Oggi · ':''}${longDate(d)}</h3>
 <div class="mealEdit recipeMeal"><label>🍝 Pranzo</label><input data-menu="${k}" data-meal="lunch" value="${esc(m.lunch||'')}" placeholder="Cosa mangiamo?"><button data-recipe="${esc(m.lunch||'')}">👨‍🍳</button></div>
 ${m.lunchAdapt?.caty?`<div class="adaptation"><b>Adattamento generato</b><br>👧 ${esc(m.lunchAdapt.caty)}<br>👶 ${esc(m.lunchAdapt.kiko)}</div>`:''}
 <div class="mealEdit recipeMeal"><label>🌙 Cena</label><input data-menu="${k}" data-meal="dinner" value="${esc(m.dinner||'')}" placeholder="Cosa mangiamo?"><button data-recipe="${esc(m.dinner||'')}">👨‍🍳</button></div>
 ${m.dinnerAdapt?.caty?`<div class="adaptation"><b>Adattamento generato</b><br>👧 ${esc(m.dinnerAdapt.caty)}<br>👶 ${esc(m.dinnerAdapt.kiko)}</div>`:''}`;menuWeek.appendChild(el)}
 menuWeek.querySelectorAll('[data-menu]').forEach(inp=>inp.onchange=()=>{
 let k=inp.dataset.menu,meal=inp.dataset.meal;
 s.menu[k]=s.menu[k]||{};
 s.menu[k][meal]=inp.value.trim();
 if(meal==='lunch')delete s.menu[k].lunchAdapt;
 if(meal==='dinner')delete s.menu[k].dinnerAdapt;
 save();
 renderMenu();
})

 menuWeek.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{if(b.dataset.recipe)openRecipe(b.dataset.recipe)});
}
function renderProfiles(){
 let people=[['caty','👧 Caty'],['kiko','👶 Kiko'],['jj','👨 JJ'],['kiki','👩 Kiki']];
 profileForms.innerHTML=people.map(([id,label])=>{let p=s.profiles[id]||{};return `<form class="profileCard" data-profile="${id}"><h3>${label}</h3><div class="profileGrid"><label>Età in mesi<input name="age" type="number" min="0" value="${Number(p.ageMonths||0)}"></label><label>Piace<input name="likes" value="${esc(p.likes||'')}" placeholder="es. pasta, zucchine"></label><label>Non piace<input name="dislikes" value="${esc(p.dislikes||'')}" placeholder="es. piselli, pesce"></label><label>Allergeni / esclusioni<input name="allergens" value="${esc(p.allergens||'')}" placeholder="es. latte, uova"></label></div><button class="primary">Salva profilo</button></form>`}).join('');
 profileForms.querySelectorAll('[data-profile]').forEach(f=>f.onsubmit=e=>{e.preventDefault();let id=f.dataset.profile,d=new FormData(f);s.profiles[id]={ageMonths:Number(d.get('age')||0),likes:d.get('likes').trim(),dislikes:d.get('dislikes').trim(),allergens:d.get('allergens').trim()};save();alert('Profilo salvato')})
}

function fillHealthPeople(){let opts=[['caty','👧 Caty'],['kiko','👶 Kiko'],['astro','🐶 Astro'],['jj','👨 JJ'],['kiki','👩 Kiki']].map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('');visitPerson.innerHTML=opts;medPerson.innerHTML=opts}
visitForm.onsubmit=e=>{e.preventDefault();let payload={kind:'visit',person:visitPerson.value,title:visitTitle.value.trim(),date:visitDate.value,time:visitTime.value,note:visitNote.value.trim()};if(visitForm.dataset.edit){let x=s.health.find(v=>v.id===visitForm.dataset.edit);Object.assign(x,payload);delete visitForm.dataset.edit}else s.health.push({id:crypto.randomUUID(),...payload});visitForm.reset();save();renderHealth()};
medicineForm.onsubmit=e=>{e.preventDefault();let payload={kind:'medicine',person:medPerson.value,name:medName.value.trim(),title:medName.value.trim(),dose:medDose.value.trim(),date:medDate.value,time:medTime.value,note:medNote.value.trim()};if(medicineForm.dataset.edit){let x=s.health.find(v=>v.id===medicineForm.dataset.edit);Object.assign(x,payload);delete medicineForm.dataset.edit}else s.health.push({id:crypto.randomUUID(),...payload});medicineForm.reset();save();renderHealth()};
function renderHealth(){
 fillHealthPeople();let today=dateKey(),a=[...s.health].filter(h=>h.date>=today).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time));
 healthList.innerHTML=a.length?a.map(h=>`<div class="row"><span>${h.kind==='visit'?'🩺':'💊'}</span><div class="grow"><b>${esc(h.title)}</b><div class="meta">${personName(h.person)} · ${longDate(dateObj(h.date))}${h.time?' · '+h.time:''}${h.dose?' · '+esc(h.dose):''}${h.note?' · '+esc(h.note):''}</div></div><button class="editBtn" data-health-edit="${h.id}">✎</button><button class="del" data-health="${h.id}">✕</button></div>`).join(''):'<div class="muted">Nessun evento programmato.</div>';
 healthList.querySelectorAll('[data-health]').forEach(b=>b.onclick=()=>{s.health=s.health.filter(h=>h.id!==b.dataset.health);save();renderHealth()});
 healthList.querySelectorAll('[data-health-edit]').forEach(b=>b.onclick=()=>{let h=s.health.find(x=>x.id===b.dataset.healthEdit);if(!h)return;if(h.kind==='visit'){visitPerson.value=h.person;visitTitle.value=h.title;visitDate.value=h.date;visitTime.value=h.time||'';visitNote.value=h.note||'';visitForm.dataset.edit=h.id;visitTitle.focus();scrollTo(0,0)}else{medPerson.value=h.person;medName.value=h.title;medDose.value=h.dose||'';medDate.value=h.date;medTime.value=h.time||'';medNote.value=h.note||'';medicineForm.dataset.edit=h.id;medName.focus();scrollTo(0,0)}})
}


function renderMaintenance(){
 let a=[...s.maintenance].sort((x,y)=>x.date.localeCompare(y.date));
 maintenanceList.innerHTML=a.length?a.map(x=>`<div class="row ${x.status==='done'?'done':''}"><span>${maintenanceIcon(x.type)}</span><div class="grow"><b>${esc(x.title)}</b><div class="meta">${longDate(dateObj(x.date))}${x.time?' · '+x.time:''} · ${x.status==='done'?'✅ Completata':'⏳ Da fare'}${x.expectedCost?` · Prev. ${euro(x.expectedCost)}`:''}${x.actualCost?` · Eff. ${euro(x.actualCost)}`:''}</div>${x.note?`<div class="meta">${esc(x.note)}</div>`:''}</div><button class="editBtn" data-maint-edit="${x.id}">✎</button><button class="del" data-maint-del="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna manutenzione programmata.</div>';
 maintenanceList.querySelectorAll('[data-maint-edit]').forEach(b=>b.onclick=()=>openMaintenance(b.dataset.maintEdit));
 maintenanceList.querySelectorAll('[data-maint-del]').forEach(b=>b.onclick=()=>{s.maintenance=s.maintenance.filter(x=>x.id!==b.dataset.maintDel);save();renderMaintenance()})
}
function openMaintenance(id=null){
 editingMaintenanceId=id;let x=id?s.maintenance.find(v=>v.id===id):null;
 maintType.value=x?.type||'Caldaia';maintTitle.value=x?.title||'';maintDate.value=x?.date||dateKey();maintTime.value=x?.time||'';
 maintExpected.value=x?.expectedCost||'';maintActual.value=x?.actualCost||'';maintFrequency.value=x?.frequency||'once';maintStatus.value=x?.status||'planned';
 maintReminder.value=String(x?.reminderDays??7);maintNotify.value=x?.notify||'both';maintNote.value=x?.note||'';maintenanceDialog.showModal()
}
addMaintenanceBtn.onclick=()=>openMaintenance();
maintenanceForm.onsubmit=e=>{
 e.preventDefault();
 let payload={type:maintType.value,title:maintTitle.value.trim(),date:maintDate.value,time:maintTime.value,expectedCost:Number(maintExpected.value||0),actualCost:Number(maintActual.value||0),frequency:maintFrequency.value,status:maintStatus.value,reminderDays:Number(maintReminder.value),notify:maintNotify.value,note:maintNote.value.trim()};
 let x;
 if(editingMaintenanceId){x=s.maintenance.find(v=>v.id===editingMaintenanceId);Object.assign(x,payload)}else{x={id:crypto.randomUUID(),...payload};s.maintenance.push(x)}
 if(x.status==='done'){
  ensureExpenseOnce('maintenance',x.id,x.title,x.actualCost||x.expectedCost,'Casa',x.date);
  if(x.frequency!=='once'&&!x.nextCreated){
   s.maintenance.push({...x,id:crypto.randomUUID(),date:nextRecurringDate(x.date,x.frequency),status:'planned',actualCost:0,nextCreated:false});
   x.nextCreated=true;
  }
 }
 maintenanceDialog.close();save();renderMaintenance()
};

function renderAuto(){
 fuelDate.value=fuelDate.value||dateKey();fuelTime.value=fuelTime.value||new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
 let d=[...s.autoDeadlines].sort((x,y)=>x.date.localeCompare(y.date));
 autoDeadlineList.innerHTML=d.length?d.map(x=>`<div class="row ${x.status==='done'?'done':''}"><span>${autoIcon(x.type)}</span><div class="grow"><b>${esc(x.title)}</b><div class="meta">${x.type} · ${longDate(dateObj(x.date))}${x.time?' · '+x.time:''}${x.km?` · ${x.km} km`:''}${x.cost?` · ${euro(x.cost)}`:''} · ${x.status==='done'?'✅ Fatto':'⏳ Da fare'}</div>${x.note?`<div class="meta">${esc(x.note)}</div>`:''}</div><button class="editBtn" data-auto-edit="${x.id}">✎</button><button class="del" data-auto-del="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna scadenza auto.</div>';
 autoDeadlineList.querySelectorAll('[data-auto-edit]').forEach(b=>b.onclick=()=>openAutoDeadline(b.dataset.autoEdit));
 autoDeadlineList.querySelectorAll('[data-auto-del]').forEach(b=>b.onclick=()=>{s.autoDeadlines=s.autoDeadlines.filter(x=>x.id!==b.dataset.autoDel);save();renderAuto()});
 let e=[...s.autoExpenses].sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,30);
 autoExpenseHistory.innerHTML=e.length?e.map(x=>`<div class="row"><span>${autoIcon(x.type)}</span><div class="grow"><b>${esc(x.type)} · ${euro(x.amount)}</b><div class="meta">${longDate(new Date(x.at))} · ${localTimeFromIso(x.at)}${x.km?` · ${x.km} km`:''}${x.note?' · '+esc(x.note):''}</div></div><button class="editBtn" data-fuel-edit="${x.id}">✎</button><button class="del" data-fuel-del="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna spesa auto registrata.</div>';
 autoExpenseHistory.querySelectorAll('[data-fuel-del]').forEach(b=>b.onclick=()=>{let id=b.dataset.fuelDel;s.autoExpenses=s.autoExpenses.filter(x=>x.id!==id);s.expenses=s.expenses.filter(x=>!(x.source==='autoExpense'&&x.sourceId===id));save();renderAuto()});
 autoExpenseHistory.querySelectorAll('[data-fuel-edit]').forEach(b=>b.onclick=()=>{let x=s.autoExpenses.find(v=>v.id===b.dataset.fuelEdit);if(!x)return;fuelForm.dataset.edit=x.id;fuelType.value=x.type;fuelAmount.value=x.amount;fuelKm.value=x.km||'';fuelNote.value=x.note||'';fuelDate.value=localDateFromIso(x.at);fuelTime.value=localTimeFromIso(x.at);fuelAmount.focus();scrollTo(0,0)})
}
fuelForm.onsubmit=e=>{
 e.preventDefault();let id=fuelForm.dataset.edit||crypto.randomUUID();let payload={id,type:fuelType.value,amount:Number(fuelAmount.value),km:Number(fuelKm.value||0),note:fuelNote.value.trim(),at:isoFromLocal(fuelDate.value,fuelTime.value)};
 if(fuelForm.dataset.edit){let x=s.autoExpenses.find(v=>v.id===id);Object.assign(x,payload);let exp=s.expenses.find(v=>v.source==='autoExpense'&&v.sourceId===id);if(exp){exp.name=payload.type;exp.amount=payload.amount;exp.date=fuelDate.value;exp.month=monthKey(dateObj(fuelDate.value))}}else{s.autoExpenses.push(payload);ensureExpenseOnce('autoExpense',id,payload.type,payload.amount,'Auto',fuelDate.value)}
 delete fuelForm.dataset.edit;fuelForm.reset();save();renderAuto()
};
function openAutoDeadline(id=null){
 editingAutoDeadlineId=id;let x=id?s.autoDeadlines.find(v=>v.id===id):null;
 autoDeadlineType.value=x?.type||'Assicurazione';autoDeadlineTitle.value=x?.title||'';autoDeadlineDate.value=x?.date||dateKey();autoDeadlineTime.value=x?.time||'';autoDeadlineCost.value=x?.cost||'';autoDeadlineKm.value=x?.km||'';autoDeadlineFrequency.value=x?.frequency||'once';autoDeadlineStatus.value=x?.status||'planned';autoDeadlineReminder.value=String(x?.reminderDays??7);autoDeadlineNotify.value=x?.notify||'both';autoDeadlineNote.value=x?.note||'';autoDeadlineDialog.showModal()
}
addAutoDeadlineBtn.onclick=()=>openAutoDeadline();
autoDeadlineForm.onsubmit=e=>{
 e.preventDefault();let payload={type:autoDeadlineType.value,title:autoDeadlineTitle.value.trim(),date:autoDeadlineDate.value,time:autoDeadlineTime.value,cost:Number(autoDeadlineCost.value||0),km:Number(autoDeadlineKm.value||0),frequency:autoDeadlineFrequency.value,status:autoDeadlineStatus.value,reminderDays:Number(autoDeadlineReminder.value),notify:autoDeadlineNotify.value,note:autoDeadlineNote.value.trim()};let x;
 if(editingAutoDeadlineId){x=s.autoDeadlines.find(v=>v.id===editingAutoDeadlineId);Object.assign(x,payload)}else{x={id:crypto.randomUUID(),...payload};s.autoDeadlines.push(x)}
 if(x.status==='done'){
  ensureExpenseOnce('autoDeadline',x.id,x.title,x.cost,'Auto',x.date);
  if(x.frequency!=='once'&&!x.nextCreated){s.autoDeadlines.push({...x,id:crypto.randomUUID(),date:nextRecurringDate(x.date,x.frequency),status:'planned',nextCreated:false});x.nextCreated=true}
 }
 autoDeadlineDialog.close();save();renderAuto()
};
function monthBase(offset=0){let d=new Date();d.setDate(1);d.setMonth(d.getMonth()+offset);d.setHours(12,0,0,0);return d}
function dayData(k){
 let out=[];
 let menu=s.menu[k];if(menu?.lunch)out.push({icon:'🍝',text:'Pranzo: '+menu.lunch,source:'menu'});if(menu?.dinner)out.push({icon:'🌙',text:'Cena: '+menu.dinner,source:'menu'});

 // SALUTE: visite e medicine sempre nel calendario
 s.health.filter(h=>h.date===k).forEach(h=>out.push({icon:h.kind==='visit'?'🩺':'💊',text:`${personName(h.person)}: ${h.title}${h.time?' · '+h.time:''}`,source:'health',id:h.id}));

 // Bambini / Astro
 s.events.filter(e=>dateKey(new Date(e.at))===k).forEach(e=>out.push({icon:META[e.type]?.[0]||'•',text:`${personName(e.childId)}: ${META[e.type]?.[1]||e.type} · ${timeLabel(e.at)}`,source:'event',id:e.id}));

 // Routine casa registrate
 s.houseLogs.filter(x=>dateKey(new Date(x.at))===k).forEach(x=>out.push({icon:houseIcon(x.routineId),text:`${houseName(x.routineId)} · ${personName(x.by)} · ${localTimeFromIso(x.at)}`,source:'house',id:x.id}));

 // Bollette / abbonamenti
 s.subscriptions.filter(x=>x.dueDate===k).forEach(x=>out.push({icon:'⏰',text:`${x.name} · ${euro(x.amount)}`,source:'subscription',id:x.id}));

 // Manutenzioni casa
 s.maintenance.filter(x=>x.date===k).forEach(x=>out.push({icon:maintenanceIcon(x.type),text:`${x.title}${x.time?' · '+x.time:''}${x.status==='done'?' · ✅':' · ⏳'}`,source:'maintenance',id:x.id}));

 // Scadenze auto
 s.autoDeadlines.filter(x=>x.date===k).forEach(x=>out.push({icon:autoIcon(x.type),text:`${x.title}${x.time?' · '+x.time:''}${x.status==='done'?' · ✅':' · ⏳'}`,source:'auto',id:x.id}));

 return out
}
function renderCalendar(){
 let base=monthBase(calOffset),y=base.getFullYear(),m=base.getMonth();calMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(base);
 let first=new Date(y,m,1,12),start=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),prevDays=new Date(y,m,0).getDate(),cells=[];
 for(let i=0;i<42;i++){let num=i-start+1,other=false,d;if(num<1){d=new Date(y,m-1,prevDays+num,12);other=true}else if(num>days){d=new Date(y,m+1,num-days,12);other=true}else d=new Date(y,m,num,12);let k=dateKey(d),has=dayData(k).length;cells.push(`<button class="calDay ${other?'other':''} ${k===dateKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}">${d.getDate()}${has?`<div class="dots">${Array.from({length:Math.min(has,4)},()=>'<i class="dot"></i>').join('')}</div>`:''}</button>`)}
 calendarGrid.innerHTML=cells.join('');calendarGrid.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selectedDate=b.dataset.date;renderCalendarDetails();renderCalendar()});renderCalendarDetails()
}
function renderCalendarDetails(){let d=dateObj(selectedDate),a=dayData(selectedDate);selectedDateTitle.textContent=longDate(d);calendarDetails.innerHTML=a.length?a.map(x=>`<div class="row"><span>${x.icon}</span><div class="grow">${esc(x.text)}</div></div>`).join(''):'<div class="muted">Niente in programma o registrato.</div>'}
calPrev.onclick=()=>{calOffset--;renderCalendar()};calNext.onclick=()=>{calOffset++;renderCalendar()};


function renderHouse(){
 houseRoutineGrid.innerHTML=HOUSE_ROUTINES.map(r=>{
  let last=latestHouse(r.id);
  return `<div class="houseRoutineCard"><div class="houseRoutineHead"><span>${r.emoji}</span><div><b>${esc(r.name)}</b><small>${last?`Ultima: ${longDate(new Date(last.at))} · ${localTimeFromIso(last.at)} · ${personName(last.by)}`:'Mai registrata'}</small></div></div><div class="houseRoutineActions"><button class="primary" data-hnow="${r.id}">✓ Fatto adesso</button><button data-hmanual="${r.id}">✎ Inserisci</button></div></div>`
 }).join('');
 houseRoutineGrid.querySelectorAll('[data-hnow]').forEach(b=>b.onclick=()=>{s.houseLogs.push({id:crypto.randomUUID(),routineId:b.dataset.hnow,by:(cloudMemberName==='Kiki'?'kiki':'jj'),at:new Date().toISOString(),note:''});save();renderHouse()});
 houseRoutineGrid.querySelectorAll('[data-hmanual]').forEach(b=>b.onclick=()=>openHouseEdit(null,b.dataset.hmanual));
 let logs=[...s.houseLogs].sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,30);
 houseHistory.innerHTML=logs.length?logs.map(x=>`<div class="row"><span>${houseIcon(x.routineId)}</span><div class="grow"><b>${esc(houseName(x.routineId))}</b><div class="meta">${personName(x.by)} · ${longDate(new Date(x.at))} · ${localTimeFromIso(x.at)}${x.note?' · '+esc(x.note):''}</div></div><button class="editBtn" data-hedit="${x.id}">✎</button><button class="del" data-hlogdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna attività registrata.</div>';
 houseHistory.querySelectorAll('[data-hedit]').forEach(b=>b.onclick=()=>openHouseEdit(b.dataset.hedit));
 houseHistory.querySelectorAll('[data-hlogdel]').forEach(b=>b.onclick=()=>{s.houseLogs=s.houseLogs.filter(x=>x.id!==b.dataset.hlogdel);save();renderHouse()})
}
function openHouseEdit(logId,routineId){
 editingHouseId=logId||null;let x=logId?s.houseLogs.find(v=>v.id===logId):null;let rid=x?.routineId||routineId;
 houseEditDialog.dataset.routine=rid;houseEditTitle.textContent=`${houseIcon(rid)} ${houseName(rid)}`;
 houseEditWho.value=x?.by||(cloudMemberName==='Kiki'?'kiki':'jj');let now=x?new Date(x.at):new Date();
 houseEditDate.value=dateKey(now);houseEditTime.value=now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});houseEditNote.value=x?.note||'';
 houseEditDialog.showModal()
}
houseEditForm.onsubmit=e=>{e.preventDefault();let rid=houseEditDialog.dataset.routine,payload={routineId:rid,by:houseEditWho.value,at:isoFromLocal(houseEditDate.value,houseEditTime.value),note:houseEditNote.value.trim()};if(editingHouseId){let x=s.houseLogs.find(v=>v.id===editingHouseId);Object.assign(x,payload)}else s.houseLogs.push({id:crypto.randomUUID(),...payload});houseEditDialog.close();save();renderHouse()};

shopForm.onsubmit=e=>{e.preventDefault();s.shopping.push({id:crypto.randomUUID(),text:shopText.value.trim(),qty:shopQty.value.trim(),category:shopCat.value,url:shopUrl.value.trim(),expectedPrice:Number(shopExpected.value||0),actualPrice:0,done:false});shopForm.reset();save();renderShop()};
function renderShop(){
 let a=[...s.shopping].sort((a,b)=>Number(a.done)-Number(b.done));
 shopList.innerHTML=a.length?a.map(x=>`<div class="shopRow ${x.done?'done':''}"><button data-buy="${x.id}">${x.done?'✅':'⬜️'}</button><div class="grow"><b>${esc(x.text)}</b><div class="meta">${esc(x.category)}${x.qty?' · '+esc(x.qty):''}${x.expectedPrice?` · Previsto ${euro(x.expectedPrice)}`:''}${x.actualPrice?` · Pagato ${euro(x.actualPrice)}`:''}</div></div>${x.url?`<a class="linkBtn" href="${esc(x.url)}" target="_blank" rel="noopener">🔗</a>`:''}<button class="editBtn" data-sedit="${x.id}">✎</button><button class="del" data-sdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Lista vuota.</div>';
 shopList.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{let x=s.shopping.find(i=>i.id===b.dataset.buy);if(x.done){x.done=false;x.actualPrice=0;save();renderShop();return}buyingShopId=x.id;boughtName.textContent=x.text;boughtPrice.value=x.expectedPrice||'';boughtDate.value=dateKey();boughtWho.value='';boughtDialog.showModal()});
 shopList.querySelectorAll('[data-sedit]').forEach(b=>b.onclick=()=>{let x=s.shopping.find(i=>i.id===b.dataset.sedit);editingShopId=x.id;shopEditText.value=x.text;shopEditQty.value=x.qty||'';shopEditCat.value=x.category||'Altro';shopEditUrl.value=x.url||'';shopEditExpected.value=x.expectedPrice||'';shopEditDialog.showModal()});
 shopList.querySelectorAll('[data-sdel]').forEach(b=>b.onclick=()=>{s.shopping=s.shopping.filter(x=>x.id!==b.dataset.sdel);save();renderShop()})
}
shopEditForm.onsubmit=e=>{e.preventDefault();let x=s.shopping.find(i=>i.id===editingShopId);if(!x)return;x.text=shopEditText.value.trim();x.qty=shopEditQty.value.trim();x.category=shopEditCat.value;x.url=shopEditUrl.value.trim();x.expectedPrice=Number(shopEditExpected.value||0);shopEditDialog.close();save();renderShop()};
boughtForm.onsubmit=e=>{e.preventDefault();let x=s.shopping.find(i=>i.id===buyingShopId);if(!x)return;let price=Number(boughtPrice.value||0);x.done=true;x.actualPrice=price;x.boughtDate=boughtDate.value;if(price>0)s.expenses.push({id:crypto.randomUUID(),name:x.text,amount:price,category:x.category==='Alimentari'?'Spesa':x.category,person:boughtWho.value||null,month:monthKey(dateObj(boughtDate.value)),date:boughtDate.value,recurring:false,source:'shopping',sourceId:x.id});boughtDialog.close();save();renderShop()};
function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function moneyDate(){return monthBase(moneyOffset)}
function euro(v){return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(v)||0)}
function ensureRecurring(){let k=monthKey(moneyDate()),sources=s.expenses.filter(x=>x.recurring&&!x.sourceId),existing=new Set(s.expenses.filter(x=>x.month===k&&x.sourceId).map(x=>x.sourceId));sources.forEach(x=>{if(x.month!==k&&!existing.has(x.id))s.expenses.push({...x,id:crypto.randomUUID(),month:k,sourceId:x.id,date:k+'-01'})})}
moneyForm.onsubmit=e=>{e.preventDefault();let d=moneyDate(),k=monthKey(d);s.expenses.push({id:crypto.randomUUID(),name:moneyName.value.trim(),amount:Number(moneyAmount.value),category:moneyCat.value,recurring:moneyRecurring.checked,month:k,date:moneyOffset===0?dateKey():k+'-01'});moneyName.value='';moneyAmount.value='';moneyRecurring.checked=false;save();renderMoney()};
function renderMoney(){
 ensureRecurring();
 let d=moneyDate(),k=monthKey(d),a=s.expenses.filter(x=>x.month===k);
 let tot=a.reduce((q,x)=>q+Number(x.amount||0),0);
 let fixed=a.filter(x=>x.recurring).reduce((q,x)=>q+Number(x.amount||0),0);
 let jj=a.filter(x=>x.person==='jj').reduce((q,x)=>q+Number(x.amount||0),0);
 let kiki=a.filter(x=>x.person==='kiki').reduce((q,x)=>q+Number(x.amount||0),0);
 let personal=jj+kiki;

 moneyMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(d);
 moneyNext.disabled=moneyOffset>=0;

 moneyStats.innerHTML=[
  ['Totale famiglia',euro(tot)],
  ['Ricorrenti',euro(fixed)],
  ['JJ personale',euro(jj)],
  ['Kiki personale',euro(kiki)]
 ].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');

 moneyList.innerHTML=a.length?a.map(x=>{
  let who=x.person?` · ${personName(x.person)}`:'';
  let cat=x.personalCategory||x.category||'Altro';
  let icon=x.person?adultExpenseIcon(cat):'💶';
  return `<div class="row">
   <span>${icon}</span>
   <div class="grow"><b>${esc(x.name)}</b><div class="meta">${esc(cat)}${who}${x.recurring?' · mensile':''}</div></div>
   <b>${euro(x.amount)}</b>
   <button class="del" data-exp="${x.id}">✕</button>
  </div>`
 }).join(''):'<div class="muted">Nessuna spesa.</div>';

 moneyList.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{
  s.expenses=s.expenses.filter(x=>x.id!==b.dataset.exp);
  save();
  renderMoney()
 });

 let cats={};
 a.forEach(x=>{
  let c=x.person?`Personale ${personName(x.person)}`:(x.category||'Altro');
  cats[c]=(cats[c]||0)+Number(x.amount||0)
 });
 moneyCategories.innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,v])=>
  `<div class="moneyCategory"><span>${esc(c)}</span><b>${euro(v)}</b></div>`
 ).join('')||'<div class="muted">Nessun dato.</div>';
}
moneyPrev.onclick=()=>{moneyOffset--;renderMoney()};moneyNext.onclick=()=>{if(moneyOffset<0){moneyOffset++;renderMoney()}};



function renderSubscriptions(){
 let a=[...s.subscriptions].sort((x,y)=>x.dueDate.localeCompare(y.dueDate));
 let soon=a.filter(x=>{let d=Math.ceil((dateObj(x.dueDate)-dateObj(dateKey()))/86400000);return d>=0&&d<=7});
 subscriptionStats.innerHTML=`<div class="stat"><span>ATTIVE</span><b>${a.length}</b></div><div class="stat"><span>ENTRO 7 GIORNI</span><b>${soon.length}</b></div>`;
 subscriptionList.innerHTML=a.length?a.map(x=>`<div class="row ${x.dueDate<dateKey()?'overdue':''}"><span>${x.category==='Trasporti'?'🚆':'💳'}</span><div class="grow"><b>${esc(x.name)}</b><div class="meta">${personName(x.owner)} · ${birthLabel(x.dueDate)} · ${esc(x.frequency)} · 🔔 ${x.reminderDays}g</div></div><b>${euro(x.amount)}</b><button class="primary smallBtn" data-subpay="${x.id}">Pagata</button><button class="del" data-subdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna scadenza registrata.</div>';
 subscriptionList.querySelectorAll('[data-subpay]').forEach(b=>b.onclick=()=>{let x=s.subscriptions.find(v=>v.id===b.dataset.subpay);s.expenses.push({id:crypto.randomUUID(),name:x.name,amount:Number(x.amount),category:x.category,person:x.owner==='family'?null:x.owner,month:monthKey(new Date()),date:dateKey(),recurring:false,source:'subscription',sourceId:x.id});if(x.frequency==='once')s.subscriptions=s.subscriptions.filter(v=>v.id!==x.id);else{x.lastPaid=dateKey();x.dueDate=nextSubDate(x.dueDate,x.frequency)}save();renderMoney();renderSubscriptions()});
 subscriptionList.querySelectorAll('[data-subdel]').forEach(b=>b.onclick=()=>{s.subscriptions=s.subscriptions.filter(x=>x.id!==b.dataset.subdel);save();renderSubscriptions()})
}
addSubscriptionBtn.onclick=()=>{subDue.value=dateKey();subscriptionDialog.showModal()};
subscriptionForm.onsubmit=e=>{e.preventDefault();s.subscriptions.push({id:crypto.randomUUID(),name:subName.value.trim(),amount:Number(subAmount.value),owner:subOwner.value,category:subCategory.value,dueDate:subDue.value,frequency:subFreq.value,reminderDays:Number(subReminder.value),notify:subNotify.value});subscriptionForm.reset();subscriptionDialog.close();save();renderMoney();renderSubscriptions()};
recipeToShop.onclick=()=>{let r=RECIPE_DETAILS[recipeDialog.dataset.recipe];if(r)r.ingredients.forEach(name=>{if(!s.shopping.some(x=>x.text.toLowerCase()===name.toLowerCase()&&!x.done))s.shopping.push({id:crypto.randomUUID(),text:name,qty:'',category:'Alimentari',url:'',expectedPrice:0,actualPrice:0,done:false})});recipeDialog.close();save();go('shop')};
loginForm.onsubmit=e=>{
 e.preventDefault();
 cloudLogin(loginEmail.value.trim(),loginPassword.value)
};
accountBtn.onclick=()=>{updateAccountInfo();accountDialog.showModal()};
logoutBtn.onclick=cloudLogout;
syncNowBtn.onclick=async()=>{
 syncNowBtn.disabled=true;
 syncNowBtn.textContent='Sincronizzo...';
 await pullCloudState(false);
 await uploadCloudState(true);
 syncNowBtn.disabled=false;
 syncNowBtn.textContent='🔄 Sincronizza adesso';
};
window.addEventListener('online',()=>{setCloudStatus('syncing','Online…');if(cloudSession)initializeCloud()});
window.addEventListener('offline',()=>setCloudStatus('error','Offline'));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&cloudReady)pullCloudState(true)});

resetBtn.onclick=()=>{if(confirm('Vuoi davvero azzerare i dati di Fagiolini? Se sei connesso, il reset verrà sincronizzato anche sugli altri dispositivi.')){localStorage.removeItem(KEY);s=structuredClone(DEFAULT);save();go('home')}};
function renderAll(){renderHome();if(person.classList.contains('on'))renderPerson();if(adult.classList.contains('on'))renderAdult();if(menu.classList.contains('on'))renderMenu();if(profiles.classList.contains('on'))renderProfiles();if(health.classList.contains('on'))renderHealth();if(calendar.classList.contains('on'))renderCalendar();if(house.classList.contains('on'))renderHouse();if(shop.classList.contains('on'))renderShop();if(money.classList.contains('on')){renderMoney();renderSubscriptions()}if(document.getElementById('maintenance').classList.contains('on'))renderMaintenance();if(document.getElementById('auto').classList.contains('on'))renderAuto()}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
renderHome();fillHealthPeople();bootCloud();
