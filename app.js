
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


const SESSION_TIMEOUT_MS=3*60*60*1000;
const SESSION_ACTIVITY_KEY='fagioliniSessionActivityV1';
let sessionExpiryTimer=null;
let lastActivityWrite=0;
function sessionLastActivity(){return Number(localStorage.getItem(SESSION_ACTIVITY_KEY)||0)}
function sessionIsExpired(){let last=sessionLastActivity();return !!last&&(Date.now()-last>=SESSION_TIMEOUT_MS)}
function scheduleSessionExpiry(){
 if(sessionExpiryTimer)clearTimeout(sessionExpiryTimer);
 if(!cloudSession)return;
 let last=sessionLastActivity()||Date.now(),remaining=Math.max(500,SESSION_TIMEOUT_MS-(Date.now()-last));
 sessionExpiryTimer=setTimeout(()=>checkSessionExpiry(true),remaining+250)
}
function markSessionActivity(){
 if(!cloudSession||!loginScreen.classList.contains('hidden'))return;
 let now=Date.now();
 if(now-lastActivityWrite<30000)return;
 lastActivityWrite=now;localStorage.setItem(SESSION_ACTIVITY_KEY,String(now));scheduleSessionExpiry()
}
async function checkSessionExpiry(force=false){
 if(!cloudSession)return false;
 if(sessionIsExpired()){
  if(sessionExpiryTimer)clearTimeout(sessionExpiryTimer);
  localStorage.removeItem(SESSION_ACTIVITY_KEY);
  await cloudLogout();
  loginMessage.textContent='Sessione scaduta dopo 3 ore di inattività. Accedi nuovamente.';
  return true
 }
 if(force)scheduleSessionExpiry();
 return false
}
function startSessionActivityTracking(){
 ['pointerdown','keydown','touchstart'].forEach(evt=>document.addEventListener(evt,markSessionActivity,{passive:true}));
 window.addEventListener('focus',()=>checkSessionExpiry(true));
}

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
 shopping:[],menu:{},expenses:[],incomes:[],health:[],manualReminders:[],dismissedReminders:[],
 houseTasks:[],
 savingsGoal:500,
 savingsGoals:{},
 savingsProjects:{
  vacation:{label:'Vacanze',icon:'🏖️',active:false,target:0,saved:0,note:''},
  christmas:{label:'Natale',icon:'🎄',active:false,target:0,saved:0,note:''}
 },
 workStatus:[],
 birthdays:[],
 customRecipes:[],
 wasteSchedule:{},
 housePlanRules:{sweep:'daily',mop:'alternate',washer:'threeWeek',sheets:'weekly',towels:'every3'},
 menuBackup:null,
 recipeFeedback:{},
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
 traversina:['🐾','Traversina'],pipi:['💧','Pipì'],farmaco:['💊','Medicina'],toeletta:['🛁','Toeletta'],crescita:['','Crescita'],nota:['','Nota']
};
let s=load(),current='caty',currentAdult='jj',dayOffset=0,personInsightDays=7,menuSelectedDay=0,quickPerson='caty',pendingPerson=null,moneyOffset=0,calOffset=0,selectedDate=dateKey(),editingEventId=null,editingHouseId=null,editingShopId=null,buyingShopId=null,editingMaintenanceId=null,editingAutoDeadlineId=null,editingReminderId=null,editingHouseTaskId=null,moneyMacroFilter=null;

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
 out.incomes=Array.isArray(out.incomes)?out.incomes:[];
 out.savingsGoal=Number(out.savingsGoal||500);
 out.savingsGoals=out.savingsGoals&&typeof out.savingsGoals==='object'?out.savingsGoals:{};
 out.savingsProjects={...DEFAULT.savingsProjects,...(out.savingsProjects||{}),vacation:{...DEFAULT.savingsProjects.vacation,...(out.savingsProjects?.vacation||{})},christmas:{...DEFAULT.savingsProjects.christmas,...(out.savingsProjects?.christmas||{})}};
 out.workStatus=Array.isArray(out.workStatus)?out.workStatus:[];
 out.birthdays=Array.isArray(out.birthdays)?out.birthdays:[];
 out.customRecipes=Array.isArray(out.customRecipes)?out.customRecipes:[];
 out.wasteSchedule=out.wasteSchedule&&typeof out.wasteSchedule==='object'?out.wasteSchedule:{};
 out.profiles={...DEFAULT.profiles,...(out.profiles||{})};
 out.house=Array.isArray(out.house)?out.house:[];
 out.shopping=Array.isArray(out.shopping)?out.shopping:[];
 out.tasks=Array.isArray(out.tasks)?out.tasks:[];
 out.menu=out.menu||{};
 out.menuBackup=out.menuBackup||null;
 out.recipeFeedback=out.recipeFeedback&&typeof out.recipeFeedback==='object'?out.recipeFeedback:{};
 out.profiles.caty.ageMonths=monthsFromBirth('2024-12-10');
 out.profiles.kiko.ageMonths=monthsFromBirth('2026-02-11');
 out.profiles.jj.ageMonths=monthsFromBirth('1991-05-31');
 out.profiles.kiki.ageMonths=monthsFromBirth('1990-08-24');
 out.houseLogs=Array.isArray(out.houseLogs)?out.houseLogs:[];
 out.subscriptions=Array.isArray(out.subscriptions)?out.subscriptions:[];
 out.maintenance=Array.isArray(out.maintenance)?out.maintenance:[];
 out.autoDeadlines=Array.isArray(out.autoDeadlines)?out.autoDeadlines:[];
 out.autoExpenses=Array.isArray(out.autoExpenses)?out.autoExpenses:[];
 out.manualReminders=Array.isArray(out.manualReminders)?out.manualReminders:[];
 out.dismissedReminders=Array.isArray(out.dismissedReminders)?out.dismissedReminders:[];
 out.houseTasks=Array.isArray(out.houseTasks)?out.houseTasks:[];
 out.housePlanRules={...DEFAULT.housePlanRules,...(out.housePlanRules||{})};
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

const THEME_KEY='fagioliniTheme';
function resolvedTheme(pref=localStorage.getItem(THEME_KEY)||'system'){
 if(pref==='dark'||pref==='light')return pref;
 return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'
}
function applyTheme(pref=localStorage.getItem(THEME_KEY)||'system',persist=true){
 if(!['light','dark','system'].includes(pref))pref='system';
 if(persist)localStorage.setItem(THEME_KEY,pref);
 document.documentElement.dataset.theme=pref;
 document.documentElement.classList.toggle('themeDark',resolvedTheme(pref)==='dark');
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=resolvedTheme(pref)==='dark'?'#101713':'#f4f1e9';
 document.querySelectorAll('[data-theme-choice]').forEach(b=>b.classList.toggle('active',b.dataset.themeChoice===pref));
 const quick=document.getElementById('themeQuickBtn');if(quick){quick.innerHTML=`<svg class="uiIcon" aria-hidden="true"><use href="icons.svg#${resolvedTheme(pref)==='dark'?'icon-moon':'icon-sun'}"></use></svg>`}
}

const WASTE_WEEK={
 1:{label:'Organico',short:'Organico',icon:'🟫',tone:'organic',description:'Umido e scarti di cucina'},
 2:{label:'Imballaggi e contenitori',short:'Imballaggi',icon:'🟨',tone:'packaging',description:'Plastica, lattine, barattoli e contenitori'},
 3:{label:'Carta e cartone',short:'Carta e cartone',icon:'🟦',tone:'paper',description:'Carta, scatole e cartone'},
 4:{label:'Organico',short:'Organico',icon:'🟫',tone:'organic',description:'Umido e scarti di cucina'},
 5:{label:'Residuo non differenziabile',short:'Residuo',icon:'🗑️',tone:'residual',description:'Quello che non va nelle altre raccolte'}
};
function wasteDate(d=new Date()){let x=new Date(d);x.setHours(12,0,0,0);return x}
function wasteForDate(d=new Date()){return WASTE_WEEK[wasteDate(d).getDay()]||null}
function nextWaste(d=new Date(),includeToday=false){let base=wasteDate(d);for(let i=includeToday?0:1;i<=8;i++){let x=new Date(base);x.setDate(x.getDate()+i);let info=wasteForDate(x);if(info)return {date:x,info}}return null}
function wasteDayName(d){return new Intl.DateTimeFormat('it-IT',{weekday:'long'}).format(d)}
function wasteDateLabel(d){return new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(d)}
function wasteMonday(d=new Date()){let x=wasteDate(d),day=x.getDay()||7;x.setDate(x.getDate()-(day-1));return x}
function wasteCardHtml(title,date,info,secondary=''){
 let dateText=wasteDateLabel(date);
 if(!info)return `<div class="wasteHeroCard wasteHeroEmpty"><small>${title}</small><h3>Nessun ritiro</h3><p>${dateText}</p>${secondary?`<span>${secondary}</span>`:''}</div>`;
 return `<div class="wasteHeroCard waste-${info.tone}"><small>${title}</small><div class="wasteHeroLine"><span class="wasteBinIcon">${info.icon}</span><div><h3>${esc(info.label)}</h3><p>${dateText}</p></div></div>${secondary?`<span>${secondary}</span>`:''}</div>`
}
function renderWaste(){
 if(!document.getElementById('wasteHero'))return;
 let today=wasteDate(),todayInfo=wasteForDate(today),next=nextWaste(today,false);
 wasteHero.innerHTML=wasteCardHtml('OGGI',today,todayInfo,todayInfo?'Prepara il contenitore previsto.':'Oggi non c’è raccolta porta a porta.')+(next?wasteCardHtml('PROSSIMO RITIRO',next.date,next.info,'Il prossimo ritiro in programma.'):'');
 let monday=wasteMonday(today),rows=[];
 for(let i=0;i<5;i++){
  let d=new Date(monday);d.setDate(monday.getDate()+i);let info=wasteForDate(d);
  rows.push(`<div class="wasteWeekRow waste-${info.tone}"><div class="wasteDayBadge"><b>${new Intl.DateTimeFormat('it-IT',{weekday:'short'}).format(d).replace('.','').toUpperCase()}</b><span>${d.getDate()}</span></div><span class="wasteRowIcon">${info.icon}</span><div class="grow"><b>${esc(info.label)}</b><small>${esc(info.description)}</small></div></div>`)
 }
 wasteWeekList.innerHTML=rows.join('');
}
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

const AVATARS={caty:'caty-avatar.jpg',kiko:'kiko-avatar.jpg',astro:'astro-avatar.jpg',jj:'jj-avatar.jpg',kiki:'kiki-avatar.jpg'};
function avatarFor(id){return AVATARS[id]||''}
function reminderKindIcon(kind){return ({appointment:'📅',calcetto:'⚽',event:'✨',reminder:'🔔'})[kind]||'🔔'}
function reminderKindLabel(kind){return ({appointment:'Appuntamento',calcetto:'Calcetto',event:'Evento',reminder:'Promemoria'})[kind]||'Promemoria'}
function birthdayMatchesDate(b,k){return !!b?.date&&b.date.slice(5)===k.slice(5)}
function nextBirthdayDate(b,from=new Date()){
 if(!b?.date)return '';
 const md=b.date.slice(5),year=from.getFullYear();
 let k=`${year}-${md}`;
 if(k<dateKey(from))k=`${year+1}-${md}`;
 return k
}
function birthdayText(b){return `${b.name}${b.relation?' · '+b.relation:''}`}
function normalizePersonName(v){return String(v||'').trim().toLocaleLowerCase('it-IT').replace(/[^a-z0-9à-ÿ]+/g,' ')}
function isOwnFamilyBirthdayDuplicate(b){
 const own=[...s.children.map(c=>({name:c.name,date:c.birthDate})),...Object.values(ADULTS).map(a=>({name:a.name,date:a.birthDate}))];
 return own.some(x=>x.date&&b?.date&&x.date.slice(5)===b.date.slice(5)&&normalizePersonName(x.name)===normalizePersonName(b.name));
}
function actionLabel(type,person){if(type==='pappa')return person==='kiko'?'Pasto / latte':person==='astro'?'Pappa':'Pasto';return META[type]?.[1]||type}



const HOUSE_ROUTINES=[
 {id:'sweep',emoji:'🧹',name:'Spazzare'},
 {id:'mop',emoji:'🧽',name:'Lavare pavimenti / mocio'},
 {id:'washer',emoji:'🧺',name:'Lavatrice'},
 {id:'dryer',emoji:'♨️',name:'Asciugatrice'},
 {id:'sheets',emoji:'🛏️',name:'Cambio lenzuola'},
 {id:'towels',emoji:'🚿',name:'Cambio asciugamani'}
];
const HOUSE_FREQ_OPTIONS=[
 ['daily','Ogni giorno'],['alternate','Giorni alterni'],['every3','Ogni 3 giorni'],
 ['twiceWeek','2 volte / settimana'],['threeWeek','3 volte / settimana'],['weekly','1 volta / settimana'],['manual','Solo manuale']
];
function houseRoutine(id){return HOUSE_ROUTINES.find(r=>r.id===id)}
function houseTaskIcon(t){return t.routineId==='custom'?'🧹':(houseRoutine(t.routineId)?.emoji||'🧹')}
function houseTaskTitle(t){return t.title||houseRoutine(t.routineId)?.name||'Faccenda'}
function taskOwnerLabel(v){return v==='jj'?'JJ':v==='kiki'?'Kiki':'JJ + Kiki'}
function houseWeekDates(){return Array.from({length:7},(_,i)=>dateKey(offsetDate(i)))}
function ruleOffsets(rule){
 return ({daily:[0,1,2,3,4,5,6],alternate:[0,2,4,6],every3:[0,3,6],twiceWeek:[1,4],threeWeek:[0,3,5],weekly:[5],manual:[]})[rule]||[]
}
function taskExists(routineId,date){return s.houseTasks.some(t=>t.routineId===routineId&&t.date===date&&t.status!=='cancelled')}
function makeHouseTask(routineId,date,generated=true,owner='family',title=''){
 return {id:crypto.randomUUID(),routineId,title:title||houseRoutine(routineId)?.name||'Faccenda',date,by:owner,status:'pending',generated,manual:!generated,note:'',completedAt:null,dependsOnId:null,linkedTaskId:null}
}
function addWasherPair(date,generated=true,owner='family'){
 let washer=makeHouseTask('washer',date,generated,owner);
 let dryer=makeHouseTask('dryer',date,generated,owner);
 washer.linkedTaskId=dryer.id;
 dryer.dependsOnId=washer.id;
 dryer.linkedTaskId=washer.id;
 s.houseTasks.push(washer,dryer);
 return washer
}
function sweepForMop(t){
 if(t?.linkedSweepId){let linked=s.houseTasks.find(x=>x.id===t.linkedSweepId);if(linked&&linked.date===t.date&&linked.status!=='cancelled')return linked}
 return s.houseTasks.find(x=>x.routineId==='sweep'&&x.date===t?.date&&x.status!=='cancelled')||null
}
function ensureSweepForMop(mop,generated=mop?.generated??true,owner=mop?.by||'family'){
 let sweep=sweepForMop(mop);
 if(!sweep){sweep=makeHouseTask('sweep',mop.date,generated,owner);s.houseTasks.push(sweep)}
 mop.linkedSweepId=sweep.id;
 return sweep
}
function linkSweepMopPairs(dates=null){
 s.houseTasks.filter(t=>t.routineId==='mop'&&t.status!=='cancelled'&&(!dates||dates.includes(t.date))).forEach(m=>ensureSweepForMop(m,m.generated,m.by))
}
function taskDependencyText(t){
 if(t.routineId==='mop')return 'Dopo aver spazzato';
 if(t.routineId==='dryer')return 'Dopo la lavatrice';
 return 'Prima completa la cosa collegata'
}
function generateHousePlan(fillOnly=false){
 let dates=houseWeekDates();
 if(!fillOnly){
  let has=s.houseTasks.some(t=>dates.includes(t.date)&&t.status==='pending'&&t.generated);
  if(has&&!confirm('Rigenerare il Piano Casa dei prossimi 7 giorni? Le task generate ancora pending verranno sostituite; quelle manuali e quelle già completate restano.'))return;
  s.houseTasks=s.houseTasks.filter(t=>!(dates.includes(t.date)&&t.status==='pending'&&t.generated));
 }
 ['sweep','mop','washer','sheets','towels'].forEach(rid=>{
  let rule=s.housePlanRules[rid]||DEFAULT.housePlanRules[rid];
  ruleOffsets(rule).forEach(off=>{
   let date=dates[off];
   if(rid==='washer'){
    if(!taskExists('washer',date))addWasherPair(date,true,'family');
   }else if(!taskExists(rid,date))s.houseTasks.push(makeHouseTask(rid,date,true,'family'));
  })
 });
 linkSweepMopPairs(dates);
 save();
 go('house')
}

const COOKBOOK=[
 {name:'Pasta al pomodoro',category:'vegetariano',tags:['pasta','pomodoro'],allergens:['glutine'],time:'20 min',ingredients:[['Pasta',320,'g'],['Passata di pomodoro',400,'g'],['Parmigiano',40,'g']],steps:['Cuoci la pasta.','Scalda la passata con un filo d’olio.','Scola, condisci e completa con parmigiano.']},
 {name:'Pasta e lenticchie',category:'legumi',tags:['pasta','lenticchie','legumi'],allergens:['glutine'],time:'35 min',ingredients:[['Pasta piccola',280,'g'],['Lenticchie cotte',300,'g'],['Passata di pomodoro',150,'g']],steps:['Scalda le lenticchie con il pomodoro.','Aggiungi acqua quanto basta.','Cuoci la pasta direttamente nel condimento.']},
 {name:'Pasta e ceci',category:'legumi',tags:['pasta','ceci','legumi'],allergens:['glutine'],time:'30 min',ingredients:[['Pasta piccola',280,'g'],['Ceci cotti',300,'g'],['Passata di pomodoro',120,'g']],steps:['Scalda i ceci.','Frullane una piccola parte per rendere il condimento cremoso.','Aggiungi la pasta e porta a cottura.']},
 {name:'Pasta e fagioli',category:'legumi',tags:['pasta','fagioli','legumi'],allergens:['glutine'],time:'35 min',ingredients:[['Pasta piccola',280,'g'],['Fagioli cotti',320,'g'],['Passata di pomodoro',150,'g']],steps:['Scalda i fagioli con il pomodoro.','Aggiungi acqua.','Cuoci la pasta nel composto fino alla consistenza desiderata.']},
 {name:'Riso e lenticchie',category:'legumi',tags:['riso','lenticchie','legumi'],allergens:[],time:'30 min',ingredients:[['Riso',300,'g'],['Lenticchie cotte',300,'g'],['Carota',1,'pz']],steps:['Cuoci la carota tritata.','Unisci lenticchie e riso.','Porta a cottura aggiungendo acqua o brodo.']},
 {name:'Cous cous con ceci e verdure',category:'legumi',tags:['cous cous','ceci','verdure','legumi'],allergens:['glutine'],time:'25 min',ingredients:[['Cous cous',280,'g'],['Ceci cotti',250,'g'],['Zucchine',2,'pz'],['Carote',2,'pz']],steps:['Cuoci le verdure a pezzetti.','Prepara il cous cous.','Unisci ceci, verdure e cous cous.']},

 {name:'Merluzzo al forno con patate',category:'pesce',tags:['pesce','merluzzo','patate'],allergens:['pesce'],time:'40 min',ingredients:[['Filetti di merluzzo',600,'g'],['Patate',700,'g'],['Limone',1,'pz']],steps:['Taglia le patate sottili e avvia la cottura in forno.','Aggiungi il merluzzo.','Completa la cottura e servi con limone.']},
 {name:'Salmone con zucchine e riso',category:'pesce',tags:['pesce','salmone','zucchine','riso'],allergens:['pesce'],time:'35 min',ingredients:[['Salmone',500,'g'],['Riso',280,'g'],['Zucchine',2,'pz']],steps:['Cuoci il riso.','Cuoci salmone e zucchine.','Servi insieme regolando la consistenza per i bambini.']},
 {name:'Orata al forno con verdure',category:'pesce',tags:['pesce','orata','verdure'],allergens:['pesce'],time:'45 min',ingredients:[['Filetti di orata',600,'g'],['Zucchine',2,'pz'],['Patate',500,'g']],steps:['Prepara le verdure.','Disponi pesce e verdure in teglia.','Cuoci fino a completa cottura.']},
 {name:'Pasta con tonno e pomodoro',category:'pesce',tags:['pasta','tonno','pomodoro','pesce'],allergens:['glutine','pesce'],time:'20 min',ingredients:[['Pasta',320,'g'],['Tonno al naturale',240,'g'],['Passata di pomodoro',300,'g']],steps:['Scalda il pomodoro.','Aggiungi il tonno sgocciolato.','Condisci la pasta cotta.']},
 {name:'Polpette di pesce e patate',category:'pesce',tags:['pesce','patate'],allergens:['pesce','uova','glutine'],time:'45 min',ingredients:[['Pesce bianco',450,'g'],['Patate',500,'g'],['Uova',1,'pz'],['Pangrattato',60,'g']],steps:['Cuoci pesce e patate.','Schiaccia e amalgama con uovo e pangrattato.','Forma le polpette e cuoci in forno.']},

 {name:'Frittata di zucchine',category:'uova',tags:['uova','zucchine'],allergens:['uova','latte'],time:'25 min',ingredients:[['Uova',6,'pz'],['Zucchine',2,'pz'],['Parmigiano',40,'g']],steps:['Cuoci le zucchine.','Sbatti le uova con parmigiano.','Unisci e cuoci bene la frittata.']},
 {name:'Frittata di patate e verdure',category:'uova',tags:['uova','patate','verdure'],allergens:['uova'],time:'35 min',ingredients:[['Uova',6,'pz'],['Patate',400,'g'],['Verdure miste',250,'g']],steps:['Cuoci patate e verdure.','Aggiungi le uova sbattute.','Cuoci completamente da entrambi i lati o in forno.']},
 {name:'Uova strapazzate con pane e verdure',category:'uova',tags:['uova','pane','verdure'],allergens:['uova','glutine'],time:'20 min',ingredients:[['Uova',6,'pz'],['Pane',250,'g'],['Verdure miste',400,'g']],steps:['Cuoci le verdure.','Cuoci bene le uova strapazzate.','Servi con il pane.']},
 {name:'Sformato di patate e uova',category:'uova',tags:['uova','patate'],allergens:['uova','latte'],time:'45 min',ingredients:[['Patate',800,'g'],['Uova',4,'pz'],['Parmigiano',50,'g']],steps:['Lessa e schiaccia le patate.','Unisci uova e parmigiano.','Cuoci in forno fino a completa cottura.']},

 {name:'Pollo al forno con patate',category:'carne',tags:['pollo','carne','patate'],allergens:[],time:'50 min',ingredients:[['Pollo',650,'g'],['Patate',800,'g'],['Rosmarino',1,'q.b.']],steps:['Taglia le patate.','Disponi pollo e patate in teglia.','Cuoci fino a completa cottura del pollo.']},
 {name:'Riso con pollo e verdure',category:'carne',tags:['pollo','riso','verdure','carne'],allergens:[],time:'35 min',ingredients:[['Riso',300,'g'],['Petto di pollo',450,'g'],['Verdure miste',400,'g']],steps:['Cuoci il riso.','Cuoci pollo e verdure a pezzetti.','Unisci e servi.']},
 {name:'Polpette di tacchino e patate',category:'carne',tags:['tacchino','carne','patate'],allergens:['uova','glutine'],time:'40 min',ingredients:[['Tacchino macinato',500,'g'],['Patate',400,'g'],['Uova',1,'pz'],['Pangrattato',50,'g']],steps:['Cuoci e schiaccia le patate.','Unisci tacchino, patate, uovo e pangrattato.','Forma le polpette e cuoci bene in forno.']},
 {name:'Tacchino con piselli e riso',category:'carne',tags:['tacchino','piselli','riso','carne'],allergens:[],time:'35 min',ingredients:[['Tacchino',500,'g'],['Piselli',300,'g'],['Riso',280,'g']],steps:['Cuoci il riso.','Cuoci tacchino e piselli.','Servi insieme.']},
 {name:'Spezzatino di pollo con verdure',category:'carne',tags:['pollo','verdure','carne'],allergens:[],time:'45 min',ingredients:[['Pollo',600,'g'],['Carote',2,'pz'],['Zucchine',2,'pz'],['Patate',400,'g']],steps:['Taglia tutto a pezzi.','Rosola leggermente il pollo.','Aggiungi le verdure e cuoci con poca acqua fino a completa cottura.']},
 {name:'Pasta al ragù semplice',category:'carne',tags:['pasta','carne','pomodoro'],allergens:['glutine'],time:'45 min',ingredients:[['Pasta',320,'g'],['Macinato magro',350,'g'],['Passata di pomodoro',400,'g']],steps:['Cuoci bene il macinato.','Aggiungi la passata e lascia sobbollire.','Condisci la pasta.']},

 {name:'Risotto con zucchine',category:'vegetariano',tags:['riso','zucchine','verdure'],allergens:['latte'],time:'30 min',ingredients:[['Riso',320,'g'],['Zucchine',3,'pz'],['Parmigiano',50,'g']],steps:['Cuoci le zucchine.','Aggiungi il riso.','Porta a cottura aggiungendo brodo e manteca con parmigiano.']},
 {name:'Risotto alla zucca',category:'vegetariano',tags:['riso','zucca','verdure'],allergens:['latte'],time:'35 min',ingredients:[['Riso',320,'g'],['Zucca',500,'g'],['Parmigiano',50,'g']],steps:['Cuoci la zucca.','Aggiungi il riso.','Porta a cottura e manteca.']},
 {name:'Pasta con crema di zucchine',category:'vegetariano',tags:['pasta','zucchine','verdure'],allergens:['glutine','latte'],time:'25 min',ingredients:[['Pasta',320,'g'],['Zucchine',3,'pz'],['Parmigiano',40,'g']],steps:['Cuoci le zucchine.','Frullane una parte.','Condisci la pasta con la crema.']},
 {name:'Pasta con broccoli',category:'vegetariano',tags:['pasta','broccoli','verdure'],allergens:['glutine'],time:'30 min',ingredients:[['Pasta',320,'g'],['Broccoli',500,'g']],steps:['Cuoci i broccoli.','Cuoci la pasta nella stessa acqua se pratico.','Unisci e schiaccia parte dei broccoli per creare il condimento.']},
 {name:'Gnocchi al pomodoro',category:'vegetariano',tags:['gnocchi','pomodoro','patate'],allergens:['glutine'],time:'20 min',ingredients:[['Gnocchi',800,'g'],['Passata di pomodoro',400,'g'],['Parmigiano',40,'g']],steps:['Scalda il pomodoro.','Cuoci gli gnocchi.','Condisci e completa con parmigiano.']},
 {name:'Minestrone con riso',category:'vegetariano',tags:['verdure','riso'],allergens:[],time:'40 min',ingredients:[['Verdure miste',800,'g'],['Riso',240,'g'],['Patate',300,'g']],steps:['Cuoci le verdure e le patate.','Aggiungi il riso.','Porta a cottura lasciando la consistenza desiderata.']},
 {name:'Vellutata di zucca e patate',category:'vegetariano',tags:['zucca','patate','verdure'],allergens:[],time:'35 min',ingredients:[['Zucca',600,'g'],['Patate',500,'g'],['Carota',1,'pz']],steps:['Taglia le verdure.','Cuoci in acqua o brodo.','Frulla fino alla consistenza desiderata.']},
 {name:'Cous cous con verdure',category:'vegetariano',tags:['cous cous','verdure'],allergens:['glutine'],time:'25 min',ingredients:[['Cous cous',300,'g'],['Zucchine',2,'pz'],['Carote',2,'pz'],['Peperone',1,'pz']],steps:['Cuoci le verdure.','Prepara il cous cous.','Unisci e servi.']},
 {name:'Riso con piselli',category:'vegetariano',tags:['riso','piselli','verdure'],allergens:[],time:'30 min',ingredients:[['Riso',320,'g'],['Piselli',350,'g']],steps:['Cuoci i piselli.','Aggiungi il riso.','Porta a cottura con acqua o brodo.']},
 {name:'Pasta ricotta e zucchine',category:'formaggio',tags:['pasta','ricotta','zucchine'],allergens:['glutine','latte'],time:'25 min',ingredients:[['Pasta',320,'g'],['Ricotta',250,'g'],['Zucchine',2,'pz']],steps:['Cuoci le zucchine.','Amalgama la ricotta con poca acqua di cottura.','Unisci pasta, zucchine e crema di ricotta.']},
 {name:'Pasta ricotta e pomodoro',category:'formaggio',tags:['pasta','ricotta','pomodoro'],allergens:['glutine','latte'],time:'20 min',ingredients:[['Pasta',320,'g'],['Ricotta',250,'g'],['Passata di pomodoro',300,'g']],steps:['Scalda il pomodoro.','Unisci la ricotta a fuoco spento.','Condisci la pasta.']},
 {name:'Polenta con verdure e formaggio',category:'formaggio',tags:['polenta','verdure','formaggio'],allergens:['latte'],time:'40 min',ingredients:[['Farina per polenta',350,'g'],['Verdure miste',500,'g'],['Formaggio',180,'g']],steps:['Cuoci le verdure.','Prepara la polenta.','Servi con verdure e una piccola quantità di formaggio.']},
 {name:'Piadina con ricotta e verdure',category:'formaggio',tags:['piadina','ricotta','verdure'],allergens:['glutine','latte'],time:'20 min',ingredients:[['Piadine',4,'pz'],['Ricotta',250,'g'],['Verdure miste',400,'g']],steps:['Cuoci le verdure.','Scalda le piadine.','Farcisci con ricotta e verdure.']},

 {name:'Zuppa di ceci e patate',category:'legumi',tags:['ceci','patate','legumi'],allergens:[],time:'35 min',ingredients:[['Ceci cotti',350,'g'],['Patate',500,'g'],['Carote',2,'pz']],steps:['Cuoci patate e carote.','Aggiungi i ceci.','Lascia insaporire e schiaccia una parte se desideri una consistenza più cremosa.']},
 {name:'Polpette di lenticchie',category:'legumi',tags:['lenticchie','legumi'],allergens:['uova','glutine'],time:'40 min',ingredients:[['Lenticchie cotte',400,'g'],['Patate',300,'g'],['Uova',1,'pz'],['Pangrattato',70,'g']],steps:['Schiaccia lenticchie e patate.','Unisci uovo e pangrattato.','Forma le polpette e cuoci in forno.']},
 {name:'Burger di ceci e patate',category:'legumi',tags:['ceci','patate','legumi'],allergens:['glutine'],time:'40 min',ingredients:[['Ceci cotti',400,'g'],['Patate',350,'g'],['Pangrattato',60,'g']],steps:['Schiaccia ceci e patate.','Aggiungi pangrattato fino a ottenere un composto modellabile.','Forma i burger e cuoci in forno.']},
 {name:'Insalata di riso con verdure e ceci',category:'legumi',tags:['riso','ceci','verdure','legumi'],allergens:[],time:'30 min',ingredients:[['Riso',300,'g'],['Ceci cotti',250,'g'],['Verdure miste',400,'g']],steps:['Cuoci il riso e lascialo intiepidire.','Cuoci o prepara le verdure.','Unisci ceci, riso e verdure.']},
 {name:'Pasta con crema di piselli',category:'legumi',tags:['pasta','piselli','legumi'],allergens:['glutine'],time:'25 min',ingredients:[['Pasta',320,'g'],['Piselli',400,'g']],steps:['Cuoci i piselli.','Frullane una parte.','Condisci la pasta con la crema e i piselli restanti.']},

 {name:'Pasta con melanzane e pomodoro',category:'vegetariano',tags:['pasta','melanzane','pomodoro','verdure'],allergens:['glutine'],time:'35 min',ingredients:[['Pasta',320,'g'],['Melanzane',2,'pz'],['Passata di pomodoro',350,'g']],steps:['Cuoci le melanzane a cubetti.','Aggiungi la passata.','Condisci la pasta.']},
 {name:'Riso con zucca e piselli',category:'vegetariano',tags:['riso','zucca','piselli','verdure'],allergens:[],time:'35 min',ingredients:[['Riso',320,'g'],['Zucca',400,'g'],['Piselli',250,'g']],steps:['Cuoci zucca e piselli.','Aggiungi il riso.','Porta a cottura con acqua o brodo.']},
 {name:'Patate e verdure al forno con hummus',category:'legumi',tags:['patate','verdure','ceci','hummus','legumi'],allergens:['sesamo'],time:'45 min',ingredients:[['Patate',700,'g'],['Verdure miste',600,'g'],['Hummus',250,'g']],steps:['Taglia patate e verdure.','Cuoci in forno.','Servi con hummus a parte.']},
 {name:'Zuppa di fagioli e verdure',category:'legumi',tags:['fagioli','verdure','legumi'],allergens:[],time:'40 min',ingredients:[['Fagioli cotti',350,'g'],['Verdure miste',600,'g'],['Patate',300,'g']],steps:['Cuoci le verdure e le patate.','Aggiungi i fagioli.','Continua la cottura e regola la consistenza.']},
 {name:'Straccetti di pollo con zucchine',category:'carne',tags:['pollo','zucchine','carne'],allergens:[],time:'30 min',ingredients:[['Petto di pollo',550,'g'],['Zucchine',3,'pz'],['Pane',250,'g']],steps:['Taglia pollo e zucchine.','Cuoci prima le zucchine e poi il pollo fino a completa cottura.','Servi con pane.']},
 {name:'Tacchino al pomodoro con patate',category:'carne',tags:['tacchino','pomodoro','patate','carne'],allergens:[],time:'40 min',ingredients:[['Tacchino',550,'g'],['Patate',600,'g'],['Passata di pomodoro',250,'g']],steps:['Cuoci le patate a pezzi.','Aggiungi il tacchino.','Unisci il pomodoro e completa la cottura.']}
];
const RECIPE_DETAILS=Object.fromEntries(COOKBOOK.map(r=>[r.name,r]));
function customRecipeNormalized(r){return {...r,custom:true,tags:Array.isArray(r.tags)?r.tags:[String(r.name||'').toLowerCase()],allergens:Array.isArray(r.allergens)?r.allergens:[],ingredients:Array.isArray(r.ingredients)?r.ingredients:[],steps:Array.isArray(r.steps)?r.steps:[]}}
function allCookbook(){return [...(s.customRecipes||[]).map(customRecipeNormalized),...COOKBOOK]}
function recipeDetails(name){return (s.customRecipes||[]).map(customRecipeNormalized).find(r=>r.name===name)||RECIPE_DETAILS[name]||null}

const SIMPLE_MEALS=[
 {name:'Yogurt bianco e banana',group:'breakfast',tags:['yogurt','banana','frutta'],allergens:['latte'],ingredients:[['Yogurt bianco',1,''],['Banane',1,'']]},
 {name:'Latte e pane con marmellata',group:'breakfast',tags:['latte','pane','marmellata'],allergens:['latte','glutine'],ingredients:[['Latte',1,''],['Pane',1,''],['Marmellata',1,'']]},
 {name:'Yogurt, avena e frutta',group:'breakfast',tags:['yogurt','avena','frutta'],allergens:['latte','glutine'],ingredients:[['Yogurt bianco',1,''],['Fiocchi di avena',1,''],['Frutta',1,'']]},
 {name:'Pane e ricotta con frutta',group:'breakfast',tags:['pane','ricotta','frutta'],allergens:['latte','glutine'],ingredients:[['Pane',1,''],['Ricotta',1,''],['Frutta',1,'']]},
 {name:'Pancake semplici e frutta',group:'breakfast',tags:['pancake','uova','frutta'],allergens:['uova','glutine','latte'],ingredients:[['Farina',1,''],['Uova',1,''],['Latte',1,''],['Frutta',1,'']]},
 {name:'Frutta fresca',group:'snack',tags:['frutta'],allergens:[],ingredients:[['Frutta',1,'']]},
 {name:'Yogurt bianco',group:'snack',tags:['yogurt'],allergens:['latte'],ingredients:[['Yogurt bianco',1,'']]},
 {name:'Pane e ricotta',group:'snack',tags:['pane','ricotta'],allergens:['glutine','latte'],ingredients:[['Pane',1,''],['Ricotta',1,'']]},
 {name:'Pane e olio',group:'snack',tags:['pane'],allergens:['glutine'],ingredients:[['Pane',1,'']]},
 {name:'Banana schiacciata',group:'snack',tags:['banana','frutta'],allergens:[],ingredients:[['Banane',1,'']]}
];

const BABY_MEALS={
 breakfast:['Latte secondo la sua routine','Crema di cereali già introdotta','Pappa prevista dallo svezzamento'],
 snack:['Frutta già introdotta','Latte secondo la sua routine','Merenda prevista dallo svezzamento'],
 lunch:['Pappa prevista dallo svezzamento','Crema di cereali già introdotta','Pasto dello svezzamento'],
 dinner:['Pappa prevista dallo svezzamento','Crema di riso già introdotta','Pasto dello svezzamento']
};

function isoFromLocal(date,time){return new Date(`${date}T${time||'12:00'}:00`).toISOString()}
function localDateFromIso(iso){return dateKey(new Date(iso))}
function localTimeFromIso(iso){return new Date(iso).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}
function latestHouse(id){return [...s.houseLogs].filter(x=>x.routineId===id).sort((a,b)=>new Date(b.at)-new Date(a.at))[0]}
function houseName(id){return HOUSE_ROUTINES.find(x=>x.id===id)?.name||id}
function houseIcon(id){return HOUSE_ROUTINES.find(x=>x.id===id)?.emoji||'🏠'}
function nextSubDate(k,f){let d=dateObj(k);if(f==='monthly')d.setMonth(d.getMonth()+1);else if(f==='bimonthly')d.setMonth(d.getMonth()+2);else if(f==='quarterly')d.setMonth(d.getMonth()+3);else if(f==='semiannual')d.setMonth(d.getMonth()+6);else if(f==='annual')d.setFullYear(d.getFullYear()+1);return dateKey(d)}
function recipeStatus(name){return s.recipeFeedback?.[name]||''}
function setRecipeStatus(name,status){
 s.recipeFeedback=s.recipeFeedback||{};
 if(s.recipeFeedback[name]===status)delete s.recipeFeedback[name];
 else s.recipeFeedback[name]=status;
 save();
 openRecipe(name);
}
function ingredientText(i){
 if(!Array.isArray(i))return String(i);
 let [name,qty,unit]=i;
 return `${name}${qty?` — ${qty}${unit?` ${unit}`:''}`:''}`;
}
function openRecipe(name){
 let r=recipeDetails(name);
 if(!r){
  recipeDialog.dataset.recipe='';
  recipeTitle.textContent=name||'Pasto manuale';
  recipeBody.innerHTML=`<p class="muted">Questo pasto è stato scritto manualmente. Non serve una ricetta: potete modificarlo direttamente nel menu.</p>`;
  recipeToShop.style.display='none';
  recipeDialog.showModal();
  return
 }
 recipeToShop.style.display='';
 recipeDialog.dataset.recipe=name;
 recipeTitle.textContent=name;
 let st=recipeStatus(name);
 recipeBody.innerHTML=`
  <div class="recipeTime">${esc(r.time||'Tempo libero')} · ${categoryLabel(r.category||'altro')}</div>
  <div class="recipeFeedback">
   <button class="${st==='favorite'?'active':''}" data-rfeedback="favorite">❤️ Preferita</button>
   <button class="${st==='liked'?'active':''}" data-rfeedback="liked">👍 Piaciuta</button>
   <button class="${st==='avoid'?'avoid active':''}" data-rfeedback="avoid">👎 Non riproporre</button>
  </div>
  <h4>Ingredienti</h4>
  <ul>${r.ingredients.map(x=>`<li>${esc(ingredientText(x))}</li>`).join('')}</ul>
  <h4>Preparazione</h4>
  <ol>${r.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
  ${r.note?`<div class="adaptation"><b>Nota famiglia</b><br>${esc(r.note)}</div>`:''}`;
 recipeBody.querySelectorAll('[data-rfeedback]').forEach(b=>b.onclick=()=>setRecipeStatus(name,b.dataset.rfeedback));
 recipeDialog.showModal()
}

function notifyLabel(v){return v==='jj'?'JJ':v==='kiki'?'Kiki':'JJ + Kiki'}
function reminderSourceLabel(v){return ({health:'Salute',subscription:'Soldi',maintenance:'Casa',auto:'Auto',manual:'Agenda',houseTask:'Casa',birthday:'Compleanno'})[v]||v}
function subtractDays(k,n){let d=dateObj(k);d.setDate(d.getDate()-Number(n||0));return dateKey(d)}
function reminderKey(source,id,date){return `${source}:${id}:${date}`}
function reminderIsDismissed(x){return s.dismissedReminders.includes(x.key)}
function dismissReminder(key){
 if(!s.dismissedReminders.includes(key))s.dismissedReminders.push(key);
 save();
 if(document.getElementById('reminders').classList.contains('on'))renderReminders()
}
function collectReminders(){
 let out=[];
 s.health.forEach(h=>{
  if(!h.date)return;
  let days=Number(h.reminderDays??(h.kind==='visit'?1:0));
  out.push({
   key:reminderKey('health',h.id,h.date),source:'health',sourceId:h.id,
   icon:h.kind==='visit'?'🩺':'💊',title:`${personName(h.person)} · ${h.title}`,
   date:h.date,time:h.time||'',reminderDays:days,notify:h.notify||'both',
   note:h.location?`📍 ${h.location}${h.note?' · '+h.note:''}`:(h.note||''),
   triggerDate:subtractDays(h.date,days)
  })
 });
 s.subscriptions.forEach(x=>{
  if(!x.dueDate)return;
  let days=Number(x.reminderDays??3);
  out.push({
   key:reminderKey('subscription',x.id,x.dueDate),source:'subscription',sourceId:x.id,
   icon:'💳',title:x.name,date:x.dueDate,time:'',reminderDays:days,notify:x.notify||'both',
   note:`${euro(x.amount)} · ${x.category}`,triggerDate:subtractDays(x.dueDate,days)
  })
 });
 s.maintenance.filter(x=>x.status!=='done').forEach(x=>{
  if(!x.date)return;
  let days=Number(x.reminderDays??7);
  out.push({
   key:reminderKey('maintenance',x.id,x.date),source:'maintenance',sourceId:x.id,
   icon:maintenanceIcon(x.type),title:x.title,date:x.date,time:x.time||'',reminderDays:days,notify:x.notify||'both',
   note:x.note||'',triggerDate:subtractDays(x.date,days)
  })
 });
 s.autoDeadlines.filter(x=>x.status!=='done').forEach(x=>{
  if(!x.date)return;
  let days=Number(x.reminderDays??7);
  out.push({
   key:reminderKey('auto',x.id,x.date),source:'auto',sourceId:x.id,
   icon:autoIcon(x.type),title:x.title,date:x.date,time:x.time||'',reminderDays:days,notify:x.notify||'both',
   note:x.note||'',triggerDate:subtractDays(x.date,days)
  })
 });
 s.houseTasks.filter(x=>x.status==='pending').forEach(x=>{
  if(!x.date)return;
  out.push({
   key:reminderKey('houseTask',x.id,x.date),source:'houseTask',sourceId:x.id,
   icon:houseTaskIcon(x),title:houseTaskTitle(x),date:x.date,time:'',reminderDays:0,
   notify:x.by==='family'?'both':x.by,note:taskDependencyReady(x)?'Faccenda di casa':taskDependencyText(x),
   triggerDate:x.date
  })
 });
 s.manualReminders.filter(x=>!x.done).forEach(x=>{
  if(!x.date)return;
  let days=Number(x.reminderDays??0),person=x.person||'family';
  out.push({
   key:reminderKey('manual',x.id,x.date),source:'manual',sourceId:x.id,
   icon:reminderKindIcon(x.kind),title:`${person!=='family'?personName(person)+' · ':''}${x.title}`,date:x.date,time:x.time||'',reminderDays:days,notify:x.notify||'both',
   note:x.note||'',triggerDate:subtractDays(x.date,days)
  })
 });
 s.birthdays.filter(b=>!isOwnFamilyBirthdayDuplicate(b)).forEach(b=>{
  let d=nextBirthdayDate(b),days=7;if(!d)return;
  out.push({key:reminderKey('birthday',b.id,d),source:'birthday',sourceId:b.id,icon:'🎂',title:`Compleanno di ${b.name}`,date:d,time:'',reminderDays:days,notify:'both',note:b.note||b.relation||'',triggerDate:subtractDays(d,days)})
 });
 return out.sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')))
}
function reminderState(x){
 let today=dateKey();
 if(x.date<today)return 'overdue';
 if(x.triggerDate<=today)return 'due';
 return 'upcoming'
}
function reminderCard(x){
 let state=reminderState(x),stateText=state==='overdue'?'⚠️ Scaduto':state==='due'?'🔔 Da ricordare':'🕒 In arrivo';
 return `<div class="row reminderRow ${state}">
  <span>${x.icon}</span>
  <div class="grow">
   <b>${esc(x.title)}</b>
   <div class="meta">${birthLabel(x.date)}${x.time?' · '+x.time:''} · ${stateText}</div>
   <div class="meta">🔔 ${x.reminderDays?x.reminderDays+'g prima':'giorno stesso'} · 👥 ${notifyLabel(x.notify)} · ${reminderSourceLabel(x.source)}</div>
   ${x.note?`<div class="meta">${esc(x.note)}</div>`:''}
  </div>
  <div class="rowActions">
   <button data-rem-open="${x.source}" data-rem-id="${x.sourceId}">Apri</button>
   ${x.source==='manual'?`<button class="primary smallBtn" data-rem-done="${x.sourceId}">✓ Fatto</button>`:`<button data-rem-dismiss="${esc(x.key)}">🔕</button>`}
  </div>
 </div>`
}
function openSourceItem(source,id){
 if(source==='health'){
  let h=s.health.find(x=>x.id===id);go('health');if(!h)return;
  if(h.kind==='visit'){
   visitPerson.value=h.person;visitTitle.value=h.title;visitDate.value=h.date;visitTime.value=h.time||'';
   visitLocation.value=h.location||'';visitMapUrl.value=h.mapUrl||'';visitNote.value=h.note||'';
   visitReminder.value=String(h.reminderDays??1);visitNotify.value=h.notify||'both';visitForm.dataset.edit=h.id;visitTitle.focus()
  }else{
   medPerson.value=h.person;medName.value=h.title;medDose.value=h.dose||'';medDate.value=h.date;medTime.value=h.time||'';
   medNote.value=h.note||'';medReminder.value=String(h.reminderDays??0);medNotify.value=h.notify||'both';medicineForm.dataset.edit=h.id;medName.focus()
  }
 }else if(source==='maintenance'){go('maintenance');openMaintenance(id)}
 else if(source==='auto'){go('auto');openAutoDeadline(id)}
 else if(source==='subscription'){go('money')}
 else if(source==='manual'){go('reminders');openReminder(id)}
 else if(source==='menu'){go('menu')}
 else if(source==='houseTask'){go('house');if(id)openHouseTask(id)}
 else if(source==='house'){go('house')}
 else if(source==='event'){let e=s.events.find(x=>x.id===id);if(e){current=e.childId;go('person');renderPerson()}}
 else if(source==='birthday'){openBirthday(id)}
}
function maintenanceIcon(type){return ({Caldaia:'🔥',Climatizzatore:'❄️',Idraulico:'🚰',Elettricista:'⚡',Elettrodomestico:'🔌','Manutenzione generica':'🧰',Altro:'🏠'})[type]||'🧰'}
function autoIcon(type){return ({Assicurazione:'🛡️',Bollo:'📄',Revisione:'🔍',Tagliando:'🔧',Gomme:'🛞',Manutenzione:'🧰',Benzina:'⛽',Parcheggio:'🅿️',Pedaggio:'🛣️',Lavaggio:'🧼',Riparazione:'🔧',Accessorio:'🛒',Altro:'🚗'})[type]||'🚗'}
function nextRecurringDate(k,f){let d=dateObj(k);if(f==='monthly')d.setMonth(d.getMonth()+1);else if(f==='semiannual')d.setMonth(d.getMonth()+6);else if(f==='annual')d.setFullYear(d.getFullYear()+1);else if(f==='biennial')d.setFullYear(d.getFullYear()+2);return dateKey(d)}
function ensureExpenseOnce(source,sourceId,name,amount,category,date,person=null){
 if(!Number(amount)||Number(amount)<=0)return;
 if(s.expenses.some(x=>x.source===source&&x.sourceId===sourceId))return;
 s.expenses.push({id:crypto.randomUUID(),name,amount:Number(amount),category,person,month:monthKey(dateObj(date)),date,recurring:false,source,sourceId});
}

function appleMapsUrl(location){
 return 'https://maps.apple.com/?q='+encodeURIComponent(location||'');
}
function googleMapsUrl(location){
 return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(location||'');
}
function safeExternalUrl(url){
 try{
  let u=new URL(url);
  return /^https?:$/.test(u.protocol)?u.href:'';
 }catch{return ''}
}
function setCloudStatus(mode,text){
 if(!cloudStatus)return;
 cloudStatus.className='cloudStatus '+mode;
 cloudStatus.querySelector('small').textContent=text;
}

function isMeaningfulState(data){
 if(!data||typeof data!=='object')return false;
 return ['events','shopping','expenses','incomes','health','workStatus','birthdays','manualReminders'].some(k=>Array.isArray(data[k])&&data[k].length)
   || (data.menu&&Object.keys(data.menu).length)
   || (Array.isArray(data.house)&&data.house.length)
   || (Array.isArray(data.tasks)&&data.tasks.length)
   || (Array.isArray(data.houseTasks)&&data.houseTasks.length);
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
 out.incomes=Array.isArray(out.incomes)?out.incomes:[];
 out.savingsGoal=Number(out.savingsGoal||500);
 out.savingsGoals=out.savingsGoals&&typeof out.savingsGoals==='object'?out.savingsGoals:{};
 out.savingsProjects={...DEFAULT.savingsProjects,...(out.savingsProjects||{}),vacation:{...DEFAULT.savingsProjects.vacation,...(out.savingsProjects?.vacation||{})},christmas:{...DEFAULT.savingsProjects.christmas,...(out.savingsProjects?.christmas||{})}};
 out.workStatus=Array.isArray(out.workStatus)?out.workStatus:[];
 out.birthdays=Array.isArray(out.birthdays)?out.birthdays:[];
 out.customRecipes=Array.isArray(out.customRecipes)?out.customRecipes:[];
 out.wasteSchedule=out.wasteSchedule&&typeof out.wasteSchedule==='object'?out.wasteSchedule:{};
 out.health=Array.isArray(out.health)?out.health:[];
 out.menu=out.menu||{};
 out.profiles={...DEFAULT.profiles,...(out.profiles||{})};
 out.menuBackup=out.menuBackup||null;
 out.recipeFeedback=out.recipeFeedback&&typeof out.recipeFeedback==='object'?out.recipeFeedback:{};
 out.houseLogs=Array.isArray(out.houseLogs)?out.houseLogs:[];
 out.subscriptions=Array.isArray(out.subscriptions)?out.subscriptions:[];
 out.maintenance=Array.isArray(out.maintenance)?out.maintenance:[];
 out.autoDeadlines=Array.isArray(out.autoDeadlines)?out.autoDeadlines:[];
 out.autoExpenses=Array.isArray(out.autoExpenses)?out.autoExpenses:[];
 out.manualReminders=Array.isArray(out.manualReminders)?out.manualReminders:[];
 out.dismissedReminders=Array.isArray(out.dismissedReminders)?out.dismissedReminders:[];
 out.houseTasks=Array.isArray(out.houseTasks)?out.houseTasks:[];
 out.housePlanRules={...DEFAULT.housePlanRules,...(out.housePlanRules||{})};
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
  localStorage.setItem(SESSION_ACTIVITY_KEY,String(Date.now()));
  scheduleSessionExpiry();

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
 if(sessionExpiryTimer)clearTimeout(sessionExpiryTimer);
 localStorage.removeItem(SESSION_ACTIVITY_KEY);
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

 if(cloudSession){
  let last=sessionLastActivity();
  if(last&&Date.now()-last>=SESSION_TIMEOUT_MS){
   await sb.auth.signOut();
   cloudSession=null;
   localStorage.removeItem(SESSION_ACTIVITY_KEY);
   loginScreen.classList.remove('hidden');
   loginMessage.textContent='Sessione scaduta dopo 3 ore di inattività. Accedi nuovamente.';
  }else{
   if(!last)localStorage.setItem(SESSION_ACTIVITY_KEY,String(Date.now()));
   scheduleSessionExpiry();
   await initializeCloud();
  }
 }else loginScreen.classList.remove('hidden');

 sb.auth.onAuthStateChange(async(event,session)=>{
  cloudSession=session;
  if(event==='SIGNED_OUT'){
   cloudReady=false;
   if(sessionExpiryTimer)clearTimeout(sessionExpiryTimer);
   loginScreen.classList.remove('hidden');
  }else if(session){
   if(!sessionLastActivity())localStorage.setItem(SESSION_ACTIVITY_KEY,String(Date.now()));
   scheduleSessionExpiry()
  }
 });
}

function go(id){
 document.body.dataset.page=id;
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
 const target=document.getElementById(id);if(!target)return;
 target.classList.add('on');
 document.querySelectorAll('nav [data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===id));
 const titles={home:'La nostra giornata',today:'Oggi',person:'Registro',adult:'Noi',menu:'Pasti',profiles:'Profili alimentari',health:'Salute',calendar:'Calendario',house:'Casa',shop:'Spesa',money:'Fagiolini Bank','money-spending':'Dove spendiamo','money-savings':'Salvadanai','money-bills':'Bollette','money-moves':'Movimenti',maintenance:'Casa & lavori',auto:'Auto',reminders:'Promemoria',waste:'Rifiuti',organize:'Organizza'};
 pageTitle.textContent=titles[id]||'Fagiolini';
 if(id==='home')renderHome();if(id==='today')renderToday();if(id==='waste')renderWaste();if(id==='organize')renderOrganize();if(id==='adult')renderAdult();if(id==='menu')renderMenu();if(id==='profiles')renderProfiles();if(id==='health')renderHealth();if(id==='calendar')renderCalendar();if(id==='house')renderHouse();if(id==='shop')renderShop();if(['money','money-spending','money-savings','money-bills','money-moves'].includes(id)){renderMoney();renderSubscriptions();}if(id==='maintenance')renderMaintenance();if(id==='auto')renderAuto();if(id==='reminders')renderReminders();
 scrollTo(0,0)
}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialogSafe(document.getElementById(b.dataset.close)));
if(insight7)insight7.onclick=()=>{personInsightDays=7;renderPersonInsights()};
if(insight30)insight30.onclick=()=>{personInsightDays=30;renderPersonInsights()};
if(todayQuickAdd)todayQuickAdd.onclick=()=>{reminderDate.value=dateKey();reminderDialog.showModal();reminderTitle.focus()};
if(organizeAccountBtn)organizeAccountBtn.onclick=()=>accountDialog.showModal();
applyTheme(localStorage.getItem(THEME_KEY)||'system',false);
document.querySelectorAll('[data-theme-choice]').forEach(b=>b.onclick=()=>applyTheme(b.dataset.themeChoice));
if(typeof themeQuickBtn!=='undefined'&&themeQuickBtn)themeQuickBtn.onclick=()=>applyTheme(resolvedTheme()==='dark'?'light':'dark');
if(window.matchMedia)window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if((localStorage.getItem(THEME_KEY)||'system')==='system')applyTheme('system',false)});
const autoAddExpenseBtnEl=document.getElementById('autoAddExpenseBtn');if(autoAddExpenseBtnEl)autoAddExpenseBtnEl.onclick=()=>{fuelDate.value=dateKey();fuelTime.value=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});openDialogSafe(document.getElementById('autoExpenseDialog'))};
const addCustomRecipeBtnEl=document.getElementById('addCustomRecipeBtn');if(addCustomRecipeBtnEl)addCustomRecipeBtnEl.onclick=()=>{customRecipeForm.reset();openDialogSafe(customRecipeDialog);setTimeout(()=>customRecipeName.focus(),20)};
const openRecipeBookBtnEl=document.getElementById('openRecipeBookBtn');if(openRecipeBookBtnEl)openRecipeBookBtnEl.onclick=()=>document.getElementById('recipeLibraryCard')?.scrollIntoView({behavior:'smooth',block:'start'});

function renderHome(){
 const now=new Date(),hour=now.getHours();
 todayLabel.textContent=longDate();
 homeDateText.textContent=longDate();
 const normalGreeting=(hour<12?'Buongiorno':hour<18?'Buon pomeriggio':'Buonasera');
 const familyBirthdays=[...s.children.map(c=>({name:c.name,birthDate:c.birthDate})),...Object.entries(ADULTS).map(([id,a])=>({name:a.name,birthDate:a.birthDate}))].filter(x=>x.birthDate&&x.birthDate.slice(5)===dateKey(now).slice(5));
 homeGreeting.textContent=familyBirthdays.length?`Tanti auguri, ${familyBirthdays.map(x=>x.name).join(' e ')}!`:normalGreeting+' famiglia';
 const celebration=document.getElementById('birthdayCelebration');
 if(celebration){celebration.hidden=!familyBirthdays.length;if(familyBirthdays.length){birthdayCelebrationTitle.textContent=`Buon compleanno ${familyBirthdays.map(x=>x.name).join(' e ')}!`;birthdayCelebrationText.textContent='Oggi è il vostro giorno. Fagiolini vi fa tanti auguri da tutta la famiglia.'}}

 const childCards=s.children.map(c=>`<button class="familyMemberCard ${c.type==='dog'?'pet':''}" data-person="${c.id}"><img src="${avatarFor(c.id)}" alt="${esc(c.name)}"><b>${esc(c.name)}</b></button>`).join('');
 const adultCards=`<button class="familyMemberCard" data-adult="jj"><img src="${avatarFor('jj')}" alt="JJ"><b>JJ</b></button><button class="familyMemberCard" data-adult="kiki"><img src="${avatarFor('kiki')}" alt="Kiki"><b>Kiki</b></button>`;
 peopleCards.innerHTML=childCards+adultCards;
 peopleCards.querySelectorAll('[data-person]').forEach(b=>b.onclick=e=>{e.stopPropagation();openPerson(b.dataset.person)});
 peopleCards.querySelectorAll('[data-adult]').forEach(b=>b.onclick=e=>{e.stopPropagation();currentAdult=b.dataset.adult;go('adult')});

 const today=dateKey(),items=dayData(today),pendingHouse=s.houseTasks.filter(t=>t.date===today&&t.status==='pending'&&t.status!=='cancelled');
 const urgentRem=collectReminders().filter(x=>!reminderIsDismissed(x)&&['due','overdue'].includes(reminderState(x)));
 const healthToday=s.health.filter(h=>h.date===today);
 const totalToday=new Set(items.filter(x=>x.source!=='menu').map((x,i)=>x.source+'-'+(x.id||i))).size;
 homeTodayBrief.innerHTML=totalToday?`<b>${totalToday} ${totalToday===1?'cosa':'cose'} da seguire oggi</b>`:'<b>Giornata tranquilla ✨</b>';
 homeTodayList.innerHTML=items.filter(x=>x.source!=='menu').slice(0,3).map(x=>`<span><i>${x.icon}</i>${esc(String(x.text).replace(/ · JJ \+ Kiki| · ⏳ Da fare/g,''))}</span>`).join('')||'<span><i>✓</i>Niente di urgente.</span>';

 const doneHouse=s.houseTasks.filter(t=>t.date===today&&t.status==='done').length,totalHouse=s.houseTasks.filter(t=>t.date===today&&t.status!=='cancelled').length;
 homeHouseBrief.innerHTML=totalHouse?`<b>${doneHouse} / ${totalHouse} fatte</b>`:'<b>Niente programmato</b>';
 homeHouseText.textContent=pendingHouse.length?`Mancano ${pendingHouse.slice(0,2).map(houseTaskTitle).join(' e ')}${pendingHouse.length>2?'…':''}.`:'Tutto fatto per oggi ✓';

 const md=s.menu[today]||{};
 homeMealsBrief.innerHTML=`<div><small>PRANZO</small><b>${esc(md.lunch||'Da scegliere')}</b></div><div><small>CENA</small><b>${esc(md.dinner||'Da scegliere')}</b></div>`;

 const familyBits=[];
 const workToday=(s.workStatus||[]).filter(w=>today>=w.startDate&&today<=w.endDate);
 workToday.forEach(w=>familyBits.push(`${workStatusIcon(w.type)} ${personName(w.person)} · ${workStatusLabel(w.type)}`));
 s.health.filter(h=>h.date===today).slice(0,2).forEach(h=>familyBits.push(`${h.kind==='visit'?'🩺':'💊'} ${personName(h.person)} · ${h.title}${h.time?' '+h.time:''}`));
 s.birthdays.filter(b=>!isOwnFamilyBirthdayDuplicate(b)&&birthdayMatchesDate(b,today)).forEach(b=>familyBits.push(`🎂 Oggi è il compleanno di ${b.name}`));
 if(!s.birthdays.some(b=>!isOwnFamilyBirthdayDuplicate(b)&&birthdayMatchesDate(b,today))){
  let nextB=s.birthdays.filter(b=>!isOwnFamilyBirthdayDuplicate(b)).map(b=>({...b,next:nextBirthdayDate(b,now)})).sort((a,b)=>a.next.localeCompare(b.next))[0];
  if(nextB){let days=Math.round((dateObj(nextB.next)-dateObj(today))/86400000);if(days>0&&days<=7)familyBits.push(`🎂 ${nextB.name} tra ${days} ${days===1?'giorno':'giorni'}`)}
 }
 homeFamilyBrief.innerHTML=familyBits.length?familyBits.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>Oggi tutto tranquillo per la famiglia.</span>';

 const mk=monthKey(now),expenses=s.expenses.filter(x=>x.month===mk).reduce((a,x)=>a+Number(x.amount||0),0),income=s.incomes.filter(x=>x.month===mk).reduce((a,x)=>a+Number(x.amount||0),0),saved=income-expenses,goal=Number(s.savingsGoals?.[mk]??s.savingsGoal??0);
 if(income>0){homeSavingsBrief.innerHTML=`<b>${euro(saved)} risparmiati</b>`;let pct=goal>0?Math.max(0,Math.min(100,saved/goal*100)):0;homeSavingsProgress.style.width=pct+'%';homeSavingsText.textContent=goal>0?(saved>=goal?`Obiettivo di ${euro(goal)} raggiunto ✓`:`Mancano ${euro(Math.max(0,goal-saved))} all’obiettivo.`):'Imposta un obiettivo mensile.'}
 else{homeSavingsBrief.innerHTML=`<b>${euro(expenses)} spesi</b>`;homeSavingsProgress.style.width='0%';homeSavingsText.textContent='Aggiungi le entrate per vedere il risparmio reale.'}
 const activeProjects=Object.values(s.savingsProjects||{}).filter(p=>p.active);
 if(homeSavingsProjects)homeSavingsProjects.innerHTML=activeProjects.length?activeProjects.map(p=>`<span>${p.icon} ${esc(p.label)} · ${euro(p.saved||0)}${Number(p.target||0)>0?' / '+euro(p.target):''}</span>`).join(''):'<span>🏖️ Vacanze e 🎄 Natale pronti quando servono.</span>';

 const wasteToday=wasteForDate(now),wasteNext=nextWaste(now,false);
 if(wasteToday){homeWasteText.innerHTML=`<b>Oggi: ${esc(wasteToday.short)}</b>`;homeWasteNextText.textContent=wasteNext?`Domani / prossimo: ${wasteNext.info.short} · ${wasteDayName(wasteNext.date)}`:'Apri per vedere la settimana.'}
 else{homeWasteText.innerHTML='<b>Oggi niente ritiro</b>';homeWasteNextText.textContent=wasteNext?`Prossimo: ${wasteNext.info.short} · ${wasteDayName(wasteNext.date)}`:'Nessun turno disponibile.'}

 const bell=document.querySelector('.reminderBell .bellDot');if(bell)bell.classList.toggle('show',urgentRem.length>0);
}

function cleanAgendaText(x){return String(x||'').replace(/ · JJ \+ Kiki/g,'').replace(/ · ⏳ Da fare/g,'').replace(/ · ✅ Completata/g,' · Fatto')}
function renderToday(){
 const k=dateKey(),items=dayData(k),pending=s.houseTasks.filter(x=>x.date===k&&x.status==='pending'),done=s.houseTasks.filter(x=>x.date===k&&x.status==='done').length;
 todayPageDate.textContent=longDate();
 const appointments=s.health.filter(x=>x.date===k).length;
 todayHero.innerHTML=`<div class="todayHeroNumbers"><div><b>${pending.length}</b><span>da fare</span></div><div><b>${appointments}</b><span>${appointments===1?'appuntamento':'appuntamenti'}</span></div><div><b>${done}</b><span>fatte</span></div></div><p>${items.length?'Qui trovi tutto quello che riguarda oggi, senza cercarlo nelle altre sezioni.':'Giornata tranquilla: non c’è niente di urgente.'}</p>`;
 const order={familyBirthday:0,birthday:1,health:2,manual:3,work:4,houseTask:5,maintenance:6,auto:7,subscription:8,event:9,menu:10,house:11};
 const sorted=[...items].sort((a,b)=>(order[a.source]||99)-(order[b.source]||99));
 todayAgenda.innerHTML=sorted.length?sorted.map(x=>`<div class="agendaItem"><span>${x.icon}</span><div class="grow"><b>${esc(cleanAgendaText(x.text))}</b><small>${({familyBirthday:'Compleanno',birthday:'Compleanno',health:'Salute',manual:'Agenda',houseTask:'Casa',work:'Lavoro',maintenance:'Casa & lavori',auto:'Auto',subscription:'Scadenza',event:'Famiglia',menu:'Pasti',house:'Casa'})[x.source]||'Oggi'}</small></div>${['health','maintenance','auto','manual','houseTask','menu','birthday'].includes(x.source)?`<button data-today-open="${x.source}" data-today-id="${x.id||''}">Apri</button>`:''}</div>`).join(''):'<div class="friendlyEmpty"><b>Tutto tranquillo ✨</b><span>Non c’è niente da fare o ricordare oggi.</span></div>';
 todayAgenda.querySelectorAll('[data-today-open]').forEach(b=>b.onclick=()=>openSourceItem(b.dataset.todayOpen,b.dataset.todayId));
}
function renderOrganize(){
 const pendingShop=s.shopping.filter(x=>!x.done).length,month=monthKey(new Date()),monthSpend=s.expenses.filter(x=>x.month===month).reduce((a,x)=>a+Number(x.amount||0),0);
 organizeShopText.textContent=pendingShop?`${pendingShop} ${pendingShop===1?'cosa':'cose'} da comprare`:'Lista vuota';
 organizeMoneyText.textContent=`Fagiolini Bank · ${euro(monthSpend)} spesi`;
 const nextHealth=[...s.health].filter(x=>x.date>=dateKey()).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')))[0];
 organizeHealthText.textContent=nextHealth?`${nextHealth.title} · ${birthLabel(nextHealth.date)}`:'Nessuna visita vicina';
 const nextAuto=[...s.autoDeadlines].filter(x=>x.status!=='done'&&x.date>=dateKey()).sort((a,b)=>a.date.localeCompare(b.date))[0];
 organizeAutoText.textContent=nextAuto?`${nextAuto.title} · ${birthLabel(nextAuto.date)}`:'Nessuna scadenza vicina';
 const nextMaint=[...s.maintenance].filter(x=>x.status!=='done'&&x.date>=dateKey()).sort((a,b)=>a.date.localeCompare(b.date))[0];
 organizeMaintenanceText.textContent=nextMaint?`${nextMaint.title} · ${birthLabel(nextMaint.date)}`:'Nessun lavoro urgente';
 const rem=collectReminders().filter(x=>!reminderIsDismissed(x)&&['due','overdue','upcoming'].includes(reminderState(x))).length;
 organizeReminderText.textContent=rem?`${rem} ${rem===1?'promemoria':'promemoria'} da vedere`:'Niente da ricordare';
 const wasteToday=wasteForDate(new Date()),wasteNext=nextWaste(new Date(),false);
 if(typeof organizeWasteText!=='undefined'&&organizeWasteText)organizeWasteText.textContent=wasteToday?`Oggi: ${wasteToday.short}`:(wasteNext?`Prossimo: ${wasteNext.info.short} · ${wasteDayName(wasteNext.date)}`:'Nessun ritiro oggi');
 renderBirthdayPreview();
}
function openPerson(id){current=id;dayOffset=0;go('person');renderPerson()}
function personActionKeys(c){return c.type==='dog'?['pappa','traversina','cacca','pipi','farmaco','toeletta']:['pappa','pannolino','cacca','nanna','bagnetto','farmaco','crescita','nota']}
function childIconId(type){return ({pappa:'icon-bottle',pannolino:'icon-diaper',cacca:'icon-poop',nanna:'icon-sleep',bagnetto:'icon-bath',farmaco:'icon-medicine',crescita:'icon-growth',nota:'icon-note'})[type]||'icon-note'}
function childIconSvg(type){return `<svg class="uiIcon diaryIcon" aria-hidden="true"><use href="icons.svg#${childIconId(type)}"></use></svg>`}
function actionIcon(type,person){if(person==='astro')return META[type]?.[0]||'•';return childIconSvg(type)}
function countRange(person,type,days){let vals=[];for(let i=days-1;i>=0;i--){let d=offsetDate(-i),n=count(person,type,d);vals.push({date:d,count:n})}return vals}
function renderPersonInsights(){
 const c=s.children.find(x=>x.id===current);if(!c)return;
 const metric=c.type==='dog'?'traversina':'cacca';
 const icon=c.type==='dog'?'🐾':'💩';
 const singular=c.type==='dog'?'traversina':'cacca',plural=c.type==='dog'?'traversine':'cacche';
 const vals=countRange(current,metric,personInsightDays),total=vals.reduce((a,x)=>a+x.count,0),prevVals=[];
 for(let i=personInsightDays*2-1;i>=personInsightDays;i--){let d=offsetDate(-i),n=count(current,metric,d);prevVals.push(n)}
 const prev=prevVals.reduce((a,x)=>a+x,0),diff=total-prev;
 personInsightText.innerHTML=`<b>${icon} ${total} ${total===1?singular:plural} negli ultimi ${personInsightDays} giorni</b><span>${diff===0?'Come nel periodo precedente.':diff>0?`${diff} in più del periodo precedente.`:`${Math.abs(diff)} in meno del periodo precedente.`}</span>`;
 const max=Math.max(1,...vals.map(x=>x.count));
 poopChart.innerHTML=vals.map((x,i)=>{let label=personInsightDays===7?new Intl.DateTimeFormat('it-IT',{weekday:'short'}).format(x.date).slice(0,2):((i%5===0||i===vals.length-1)?String(x.date.getDate()):'');return `<div class="barCol" title="${x.count}"><div class="barValue">${x.count||''}</div><i style="height:${Math.max(x.count?12:3,x.count/max*100)}%"></i><small>${label}</small></div>`}).join('');
 if(insight7)insight7.classList.toggle('active',personInsightDays===7);if(insight30)insight30.classList.toggle('active',personInsightDays===30);
}
function renderPerson(){
 let c=s.children.find(x=>x.id===current);if(!c)return;personTitle.textContent=c.name;personAvatar.src=avatarFor(c.id);personAvatar.alt=c.name;if(personSubtitle)personSubtitle.textContent=ageFromBirth(c.birthDate);
 let selectedDay=offsetDate(dayOffset);
 if(c.type==='dog')personStats.innerHTML=[['Traversine',count(current,'traversina',selectedDay)],['Pappe',count(current,'pappa',selectedDay)],['Cacche',count(current,'cacca',selectedDay)],['Pipì',count(current,'pipi',selectedDay)]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
 else personStats.innerHTML=[['Pasti',count(current,'pappa',selectedDay)],['Sonno',duration(sleepMinutes(current,selectedDay))],['Pannolini',count(current,'pannolino',selectedDay)],['Cacche',count(current,'cacca',selectedDay)]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
 if(personDiarySentence){let ev=events(current,selectedDay),parts=[];if(c.type!=='dog'){let meals=ev.filter(e=>e.type==='pappa').length,sleeps=ev.filter(e=>e.type==='nanna').length,poops=ev.filter(e=>e.type==='cacca').length;if(meals)parts.push(`${meals} ${meals===1?'pasto':'pasti'}`);if(sleeps)parts.push(`${sleeps} ${sleeps===1?'sonnellino':'sonnellini'}`);if(poops)parts.push(`${poops} ${poops===1?'cacca':'cacche'}`)}personDiarySentence.textContent=parts.length?`Registrati ${parts.join(', ')}.`:'La giornata è pronta per essere raccontata, un momento alla volta.'}
 renderPersonInsights();
 personActions.innerHTML=personActionKeys(c).map(k=>`<button data-action="${k}">${actionIcon(k,current)}<small>${actionLabel(k,current)}</small></button>`).join('');
 personActions.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>handleAction(current,b.dataset.action));
 let d=offsetDate(dayOffset);dayLabel.textContent=dayOffset===0?'Oggi':longDate(d);dayNext.disabled=dayOffset>=0;
 let a=events(current,d);personTimeline.innerHTML=a.length?a.map(e=>{let m=META[e.type]||['•',e.type],note=e.note||'';if(e.type==='nanna')note=e.endAt?`Fino alle ${timeLabel(e.endAt)} · ${duration(Math.round((new Date(e.endAt)-new Date(e.at))/60000))}`:'In corso';return `<div class="diaryRow"><span class="diaryTime">${timeLabel(e.at)}</span><span class="diaryEventIcon">${current==='astro'?(m[0]||'•'):childIconSvg(e.type)}</span><div class="grow"><b>${esc(m[1])}</b>${note?`<small>${esc(note)}</small>`:''}</div><button class="diaryEdit" data-edit-event="${e.id}">Modifica</button></div>`}).join(''):'<div class="friendlyEmpty"><b>Niente registrato</b><span>Puoi aggiungere anche qualcosa di ieri o di un giorno passato.</span></div>';
 personTimeline.querySelectorAll('[data-edit-event]').forEach(b=>b.onclick=()=>openChildDiary(b.dataset.editEvent));
}
dayPrev.onclick=()=>{dayOffset--;renderPerson()};dayNext.onclick=()=>{if(dayOffset<0){dayOffset++;renderPerson()}};

let editingDiaryEventId=null;
function currentLocalTime(){let n=new Date();return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`}
function localEventIso(k,t){let [y,m,d]=k.split('-').map(Number),[hh,mm]=(t||'00:00').split(':').map(Number);return new Date(y,m-1,d,hh||0,mm||0,0,0).toISOString()}
function setDiaryConditional(){let t=childDiaryType.value;childDiarySleepFields.hidden=t!=='nanna';childDiaryPoopFields.hidden=t!=='cacca';childDiaryGrowthFields.hidden=t!=='crescita'}
function openChildDiary(id=null,presetType='pappa'){
 let c=s.children.find(x=>x.id===current);if(!c||c.type==='dog'){if(presetType)handleAction(current,presetType);return}
 editingDiaryEventId=id;let e=id?s.events.find(x=>x.id===id):null;
 childDiaryDialogTitle.textContent=e?'Modifica registrazione':`Aggiungi al diario di ${c.name}`;
 childDiaryType.value=e?.type||presetType||'pappa';
 let at=e?new Date(e.at):new Date();childDiaryDate.value=dateKey(at);childDiaryTime.value=`${String(at.getHours()).padStart(2,'0')}:${String(at.getMinutes()).padStart(2,'0')}`;
 childDiaryEndTime.value=e?.endAt?timeLabel(e.endAt):'';
 let note=e?.note||'';childDiaryPoopType.value='Normale';
 if(e?.type==='cacca'&&note){let bits=note.split(' · ');if(['Normale','Dura','Morbida','Liquida'].includes(bits[0])){childDiaryPoopType.value=bits.shift();note=bits.join(' · ')}}
 childDiaryWeight.value='';childDiaryHeight.value='';
 if(e?.type==='crescita'){let wm=(e.note||'').match(/Peso\s*([\d.,]+)/i),hm=(e.note||'').match(/Altezza\s*([\d.,]+)/i);if(wm)childDiaryWeight.value=wm[1].replace(',','.');if(hm)childDiaryHeight.value=hm[1].replace(',','.');note=(e.note||'').split(' · ').filter(x=>!/^Peso |^Altezza /i.test(x)).join(' · ')}
 childDiaryNote.value=note;childDiaryDeleteBtn.hidden=!e;setDiaryConditional();childDiaryDialog.showModal()
}
function handleAction(person,type){
 let c=s.children.find(x=>x.id===person);if(c&&c.type!=='dog'){pendingPerson=person;openChildDiary(null,type);return}
 if(type==='cacca'){pendingPerson=person;poopType.value='Normale';poopNote.value='';poopDialog.showModal();return}
 if(type==='nanna'){pendingPerson=person;let a=sleepActive(person);sleepMessage.textContent=a?'La nanna è in corso. Segno il risveglio adesso?':'Segno l’inizio della nanna adesso?';sleepDialog.showModal();return}
 s.events.push({id:crypto.randomUUID(),childId:person,type,at:new Date().toISOString(),note:''});save()
}
if(addDiaryEntryBtn)addDiaryEntryBtn.onclick=()=>openChildDiary(null,'pappa');
if(childDiaryType)childDiaryType.onchange=setDiaryConditional;
if(childDiaryForm)childDiaryForm.onsubmit=e=>{e.preventDefault();let type=childDiaryType.value,date=childDiaryDate.value,time=childDiaryTime.value||'00:00',note=childDiaryNote.value.trim();if(type==='cacca')note=[childDiaryPoopType.value,note].filter(Boolean).join(' · ');if(type==='crescita'){let bits=[];if(childDiaryWeight.value)bits.push(`Peso ${Number(childDiaryWeight.value).toLocaleString('it-IT')} kg`);if(childDiaryHeight.value)bits.push(`Altezza ${Number(childDiaryHeight.value).toLocaleString('it-IT')} cm`);if(note)bits.push(note);note=bits.join(' · ')}let payload={childId:current,type,at:localEventIso(date,time),note};if(type==='nanna'&&childDiaryEndTime.value){let end=localEventIso(date,childDiaryEndTime.value);if(new Date(end)<new Date(payload.at)){let ed=new Date(end);ed.setDate(ed.getDate()+1);end=ed.toISOString()}payload.endAt=end}else if(type==='nanna')payload.endAt=null;if(editingDiaryEventId){let old=s.events.find(x=>x.id===editingDiaryEventId);if(old)Object.assign(old,payload)}else s.events.push({id:crypto.randomUUID(),...payload});editingDiaryEventId=null;childDiaryDialog.close();save();renderPerson()};
if(childDiaryDeleteBtn)childDiaryDeleteBtn.onclick=()=>{if(!editingDiaryEventId)return;if(confirm('Eliminare questa registrazione dal diario?')){s.events=s.events.filter(x=>x.id!==editingDiaryEventId);editingDiaryEventId=null;childDiaryDialog.close();save();renderPerson()}};
poopForm.onsubmit=e=>{e.preventDefault();s.events.push({id:crypto.randomUUID(),childId:pendingPerson,type:'cacca',at:new Date().toISOString(),note:[poopType.value,poopNote.value.trim()].filter(Boolean).join(' · ')});poopDialog.close();save()};
sleepForm.onsubmit=e=>{e.preventDefault();let a=sleepActive(pendingPerson);if(a)a.endAt=new Date().toISOString();else s.events.push({id:crypto.randomUUID(),childId:pendingPerson,type:'nanna',at:new Date().toISOString(),endAt:null,note:''});sleepDialog.close();save()};



function adultMonthExpenses(id=currentAdult){
 let k=monthKey(new Date());
 return s.expenses.filter(x=>x.month===k && x.person===id);
}
function adultExpenseIcon(cat){
 return ({'Pranzo lavoro':'🍝','Caffè / Bar':'☕️','Trasporti':'🚆','Acquisti personali':'🛍️','Svago':'🎬','Altro':'💳'})[cat]||'💳'
}
function workStatusIcon(type){return ({smart:'🏠',vacation:'🌴',sick:'🤒'})[type]||'💼'}
function workStatusLabel(type){return ({smart:'Smart working',vacation:'Ferie',sick:'Malattia'})[type]||'Lavoro'}
function workStatusDateText(w){return w.startDate===w.endDate?longDate(dateObj(w.startDate)):`${longDate(dateObj(w.startDate))} → ${longDate(dateObj(w.endDate))}`}
function openWorkStatus(personId=currentAdult,presetDate=dateKey()){
 workPerson.value=personId||'jj';workType.value='smart';workStartDate.value=presetDate||dateKey();workEndDate.value=presetDate||dateKey();workNote.value='';workStatusDialog.showModal()
}
function renderAdult(){
 let a=ADULTS[currentAdult];
 adultTitle.textContent=a.name;if(adultAvatar){adultAvatar.src=avatarFor(currentAdult);adultAvatar.alt=a.name}
 let upcoming=s.health.filter(h=>h.person===currentAdult&&h.date>=dateKey()).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time));
 let meds=upcoming.filter(h=>h.kind==='medicine').length;
 let visits=upcoming.filter(h=>h.kind==='visit').length;
 let personal=adultMonthExpenses(currentAdult);
 let totalPersonal=personal.reduce((q,x)=>q+Number(x.amount||0),0);

 const workNow=(s.workStatus||[]).find(w=>w.person===currentAdult&&dateKey()>=w.startDate&&dateKey()<=w.endDate);
 adultSummary.innerHTML=`
  <div class="stat"><span>OGGI</span><b>${workNow?workStatusIcon(workNow.type)+' '+workStatusLabel(workNow.type):'💼 Normale'}</b></div>
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

 const workRows=(s.workStatus||[]).filter(w=>w.person===currentAdult&&w.endDate>=dateKey()).sort((a,b)=>a.startDate.localeCompare(b.startDate));
 if(adultWorkStatusSummary)adultWorkStatusSummary.innerHTML=workRows.length?workRows.slice(0,8).map(w=>`<div class="row"><span>${workStatusIcon(w.type)}</span><div class="grow"><b>${workStatusLabel(w.type)}</b><div class="meta">${esc(workStatusDateText(w))}${w.note?' · '+esc(w.note):''}</div></div><button class="del" data-work-del="${w.id}">✕</button></div>`).join(''):'<div class="friendlyEmpty"><b>Niente segnato</b><span>Puoi annotare ferie, smart working o malattia.</span></div>';
 if(adultWorkStatusSummary)adultWorkStatusSummary.querySelectorAll('[data-work-del]').forEach(b=>b.onclick=()=>{s.workStatus=s.workStatus.filter(x=>x.id!==b.dataset.workDel);save();renderAdult()});

 adultHealth.innerHTML=upcoming.length?upcoming.slice(0,8).map(h=>
  `<div class="row"><span>${h.kind==='visit'?'🩺':'💊'}</span><div class="grow"><b>${esc(h.title)}</b><div class="meta">${longDate(dateObj(h.date))}${h.time?' · '+h.time:''}${h.dose?' · '+esc(h.dose):''}</div></div></div>`
 ).join(''):'<div class="muted">Nessun impegno programmato.</div>';
}
adultVisit.onclick=()=>{go('health');visitPerson.value=currentAdult;visitTitle.focus()};
adultMedicine.onclick=()=>{go('health');medPerson.value=currentAdult;medName.focus()};
if(adultWorkStatus)adultWorkStatus.onclick=()=>openWorkStatus(currentAdult);
if(adultWorkAdd)adultWorkAdd.onclick=()=>openWorkStatus(currentAdult);
if(adultCalcetto)adultCalcetto.onclick=()=>openReminder(null,{kind:'calcetto',person:'jj',title:'Calcetto',date:dateKey(),reminderDays:0,notify:'both'});
if(workStatusForm)workStatusForm.onsubmit=e=>{e.preventDefault();let start=workStartDate.value,end=workEndDate.value||start;if(!start)return;if(end<start)[start,end]=[end,start];s.workStatus.push({id:crypto.randomUUID(),person:workPerson.value,type:workType.value,startDate:start,endDate:end,note:workNote.value.trim()});workStatusDialog.close();save();if(adult.classList.contains('on'))renderAdult();if(document.getElementById('today').classList.contains('on'))renderToday()};

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
const navQuickBtn=document.getElementById('navQuick'),quickRecordBtn=document.getElementById('quickRecord');if(navQuickBtn)navQuickBtn.onclick=openQuick;if(quickRecordBtn)quickRecordBtn.onclick=openQuick;

function csv(v){return String(v||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean)}
function profileAllowed(item,p){
 if(!p)return true;
 let dislikes=csv(p.dislikes),allergens=csv(p.allergens);
 let itemAllergens=item.allergens||[],tags=item.tags||[],name=(item.name||'').toLowerCase();
 if(itemAllergens.some(a=>allergens.some(x=>a.includes(x)||x.includes(a))))return false;
 if(dislikes.some(d=>tags.some(t=>t.includes(d)||d.includes(t))||name.includes(d)))return false;
 return true
}
function cookbookAllowedFor(ids){
 return allCookbook().filter(r=>
  ids.every(id=>profileAllowed(r,s.profiles[id])) &&
  recipeStatus(r.name)!=='avoid'
 )
}
function simpleAllowedFor(id,group){
 return SIMPLE_MEALS.filter(x=>x.group===group&&profileAllowed(x,s.profiles[id]))
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function categoryLabel(c){return ({legumi:'🫘 Legumi',pesce:'🐟 Pesce',uova:'🥚 Uova',carne:'🍗 Carne',vegetariano:'🥦 Vegetariano',formaggio:'🧀 Formaggio'})[c]||c}
function preferenceScore(recipe,ids){
 let score=Math.random()*2;
 ids.forEach(id=>{
  let likes=csv(s.profiles[id]?.likes);
  likes.forEach(l=>{if(recipe.tags.some(t=>t.includes(l)||l.includes(t))||recipe.name.toLowerCase().includes(l))score+=2})
 });
 if(recipe.custom)score+=6;
 let feedback=recipeStatus(recipe.name);
 if(feedback==='favorite')score+=4;
 if(feedback==='liked')score+=2;
 return score
}
function pickRecipe(ids,category,current='',used=new Set()){
 let pool=cookbookAllowedFor(ids).filter(r=>!category||r.category===category);
 if(!pool.length)pool=cookbookAllowedFor(ids);
 let unused=pool.filter(r=>!used.has(r.name)&&r.name!==current);
 if(unused.length)pool=unused;
 else{
  let other=pool.filter(r=>r.name!==current);
  if(other.length)pool=other
 }
 return [...pool].sort((a,b)=>preferenceScore(b,ids)-preferenceScore(a,ids))[0]||null
}
function pickSimple(id,group,current=''){
 let pool=simpleAllowedFor(id,group).filter(x=>x.name!==current);
 if(!pool.length)pool=SIMPLE_MEALS.filter(x=>x.group===group&&x.name!==current);
 return shuffle(pool)[0]||null
}
function babyPick(group,current=''){
 let pool=(BABY_MEALS[group]||BABY_MEALS.snack).filter(x=>x!==current);
 return shuffle(pool.length?pool:BABY_MEALS[group])[0]||''
}
function childMealFromAdult(id,adultRecipe,meal){
 let age=Number(s.profiles[id]?.ageMonths||0);
 if(age<12)return babyPick(meal==='lunch'?'lunch':'dinner');
 if(adultRecipe&&profileAllowed(adultRecipe,s.profiles[id])&&recipeStatus(adultRecipe.name)!=='avoid')return adultRecipe.name;
 return pickRecipe([id],null)?.name||adultRecipe?.name||''
}
function balanceSchedule(){
 return shuffle(['legumi','pesce','uova','vegetariano','carne','legumi','pesce','uova','carne','vegetariano','legumi','carne','formaggio','vegetariano'])
}
function buildWeekProposal(){
 let proposal={},cats=balanceSchedule(),used=new Set(),ci=0;
 for(let i=0;i<7;i++){
  let d=offsetDate(i),k=dateKey(d);
  let breakfast=pickSimple('jj','breakfast')?.name||'Colazione a scelta';
  let lunch=pickRecipe(['jj','kiki'],cats[ci++],null,used);if(lunch)used.add(lunch.name);
  let dinner=pickRecipe(['jj','kiki'],cats[ci++],null,used);if(dinner)used.add(dinner.name);

  let catyBreakfast=pickSimple('caty','breakfast')?.name||breakfast;
  let catySnack1=pickSimple('caty','snack')?.name||'Frutta fresca';
  let catySnack2=pickSimple('caty','snack',catySnack1)?.name||'Yogurt bianco';

  let kikoAge=Number(s.profiles.kiko?.ageMonths||0);
  let kikoBreakfast=kikoAge<12?babyPick('breakfast'):(pickSimple('kiko','breakfast')?.name||breakfast);
  let kikoSnack1=kikoAge<12?babyPick('snack'):(pickSimple('kiko','snack')?.name||'Frutta fresca');
  let kikoSnack2=kikoAge<12?babyPick('snack',kikoSnack1):(pickSimple('kiko','snack',kikoSnack1)?.name||'Yogurt bianco');

  proposal[k]={
   breakfast,
   lunch:lunch?.name||'',
   dinner:dinner?.name||'',
   caty:{
    breakfast:catyBreakfast,
    snackAM:catySnack1,
    lunch:childMealFromAdult('caty',lunch,'lunch'),
    snackPM:catySnack2,
    dinner:childMealFromAdult('caty',dinner,'dinner')
   },
   kiko:{
    breakfast:kikoBreakfast,
    snackAM:kikoSnack1,
    lunch:childMealFromAdult('kiko',lunch,'lunch'),
    snackPM:kikoSnack2,
    dinner:childMealFromAdult('kiko',dinner,'dinner')
   }
  }
 }
 return proposal
}
function weekHasMenuContent(){
 for(let i=0;i<7;i++){
  let m=s.menu[dateKey(offsetDate(i))]||{};
  if([m.breakfast,m.lunch,m.dinner,m.caty?.breakfast,m.caty?.snackAM,m.caty?.lunch,m.caty?.snackPM,m.caty?.dinner,m.kiko?.breakfast,m.kiko?.snackAM,m.kiko?.lunch,m.kiko?.snackPM,m.kiko?.dinner].some(v=>String(v||'').trim()))return true
 }
 return false
}
function mergeEmptyMenu(target,proposal){
 let out=JSON.parse(JSON.stringify(target||{}));
 ['breakfast','lunch','dinner'].forEach(k=>{if(!String(out[k]||'').trim())out[k]=proposal[k]||''});
 ['caty','kiko'].forEach(person=>{
  out[person]=out[person]||{};
  let src=proposal[person]||{};
  ['breakfast','snackAM','lunch','snackPM','dinner'].forEach(k=>{if(!String(out[person][k]||'').trim())out[person][k]=src[k]||''})
 });
 return out
}
generateMenu.onclick=()=>{
 if(weekHasMenuContent()&&!confirm('Ci sono già pasti compilati o modificati a mano. Vuoi davvero rigenerare TUTTA la settimana e sostituirli?'))return;
 s.menuBackup=JSON.parse(JSON.stringify(s.menu));
 let proposal=buildWeekProposal();
 Object.entries(proposal).forEach(([k,v])=>s.menu[k]=v);
 save();renderMenu()
};
generateEmptyMenu.onclick=()=>{
 s.menuBackup=JSON.parse(JSON.stringify(s.menu));
 let proposal=buildWeekProposal();
 Object.entries(proposal).forEach(([k,v])=>s.menu[k]=mergeEmptyMenu(s.menu[k],v));
 save();renderMenu()
};
undoMenu.onclick=()=>{
 if(!s.menuBackup){alert('Non c’è ancora un menu precedente da ripristinare.');return}
 s.menu=JSON.parse(JSON.stringify(s.menuBackup));
 s.menuBackup=null;
 save();
 renderMenu()
};

function mealValue(m,person,meal){
 return person==='adult'?(m?.[meal]||''):(m?.[person]?.[meal]||'')
}
function setMealValue(k,person,meal,value){
 s.menu[k]=s.menu[k]||{};
 if(person==='adult')s.menu[k][meal]=value;
 else{
  s.menu[k][person]=s.menu[k][person]||{};
  s.menu[k][person][meal]=value
 }
}
function mealRow(k,person,meal,icon,label,value){
 let known=!!recipeDetails(value);
 return `<div class="mealEdit recipeMeal">
  <label>${icon} ${label}</label>
  <input data-menu="${k}" data-person="${person}" data-meal="${meal}" value="${esc(value||'')}" placeholder="Scrivi qui...">
  <button class="mealSwap" data-swap="${k}" data-swap-person="${person}" data-swap-meal="${meal}" title="Cambia solo questo pasto">🔄</button>
  <button class="recipeBtn ${known?'':'mutedBtn'}" data-recipe="${esc(value||'')}" title="${known?'Apri ricetta':'Pasto manuale'}">👨‍🍳</button>
 </div>`
}
function renderCustomRecipes(){
 if(typeof customRecipePreview==='undefined'||!customRecipePreview)return;
 const rows=s.customRecipes||[];
 customRecipePreview.innerHTML=rows.length?rows.map(r=>`<div class="customRecipeRow"><span class="recipeRowIcon"><svg class="uiIcon" aria-hidden="true"><use href="icons.svg#icon-recipe"></use></svg></span><div class="grow"><b>${esc(r.name)}</b><small>${esc(categoryLabel(r.category||'altro').replace(/^\S+\s/,''))}${r.time?' · '+esc(r.time):''}</small></div><button data-custom-open="${r.id}">Apri</button><button class="del" data-custom-del="${r.id}">×</button></div>`).join(''):'<div class="friendlyEmpty compactEmpty"><b>Il ricettario è pronto</b><span>Aggiungi le ricette che cucinate davvero: Fagiolini le userà prima delle proposte base.</span></div>';
 customRecipePreview.querySelectorAll('[data-custom-open]').forEach(b=>b.onclick=()=>{let r=s.customRecipes.find(x=>x.id===b.dataset.customOpen);if(r)openRecipe(r.name)});
 customRecipePreview.querySelectorAll('[data-custom-del]').forEach(b=>b.onclick=()=>{if(confirm('Eliminare questa ricetta?')){s.customRecipes=s.customRecipes.filter(x=>x.id!==b.dataset.customDel);save();renderMenu()}})
}
function renderMenu(){
 let coreMeals=[];for(let i=0;i<7;i++){let m=s.menu[dateKey(offsetDate(i))]||{};coreMeals.push(m.breakfast||'',m.lunch||'',m.dinner||'')}
 let filled=coreMeals.filter(x=>String(x).trim()).length,missing=21-filled,unique=new Set(coreMeals.filter(x=>String(x).trim()).map(x=>String(x).trim().toLowerCase())).size;
 if(document.getElementById('menuWeekSummary'))menuWeekSummary.innerHTML=`<div class="simpleSummaryLine"><b>${filled} pasti scelti</b><span>${missing?`${missing} ancora da decidere`:`Settimana completa · ${unique} piatti diversi`}</span></div>`;
 const todayK=dateKey(),todayM=s.menu[todayK]||{};
 if(typeof menuTodayTitle!=='undefined'&&menuTodayTitle)menuTodayTitle.textContent=`Oggi · ${longDate()}`;
 if(typeof menuTodayBrief!=='undefined'&&menuTodayBrief)menuTodayBrief.innerHTML=`<button data-menu-jump="lunch"><small>PRANZO</small><b>${esc(todayM.lunch||'Da scegliere')}</b></button><button data-menu-jump="dinner"><small>CENA</small><b>${esc(todayM.dinner||'Da scegliere')}</b></button>`;
 if(typeof menuDayTabs!=='undefined'&&menuDayTabs){menuDayTabs.innerHTML='';for(let i=0;i<7;i++){let d=offsetDate(i),b=document.createElement('button');b.className=i===menuSelectedDay?'active':'';b.innerHTML=`<small>${new Intl.DateTimeFormat('it-IT',{weekday:'short'}).format(d).replace('.','')}</small><b>${d.getDate()}</b>`;b.onclick=()=>{menuSelectedDay=i;renderMenu()};menuDayTabs.appendChild(b)}}
 menuWeek.innerHTML='';
 let i=menuSelectedDay,d=offsetDate(i),k=dateKey(d),m=s.menu[k]||{},caty=m.caty||{},kiko=m.kiko||{};
 let el=document.createElement('div');el.className='menuDay focusedDay'+(i===0?' today':'');
 el.innerHTML=`<h3>${i===0?'Oggi · ':''}${longDate(d)}</h3>
 <div class="menuPersonBlock adultsMenu"><h4>Famiglia</h4>${mealRow(k,'adult','breakfast','','Colazione',m.breakfast||'')}${mealRow(k,'adult','lunch','','Pranzo',m.lunch||'')}${mealRow(k,'adult','dinner','','Cena',m.dinner||'')}</div>
 <details class="childMenu"><summary>Caty · pasti e merende</summary><div class="childMenuBody">${mealRow(k,'caty','breakfast','','Colazione',caty.breakfast||'')}${mealRow(k,'caty','snackAM','','Merenda mattina',caty.snackAM||'')}${mealRow(k,'caty','lunch','','Pranzo',caty.lunch||m.lunch||'')}${mealRow(k,'caty','snackPM','','Merenda pomeriggio',caty.snackPM||'')}${mealRow(k,'caty','dinner','','Cena',caty.dinner||m.dinner||'')}</div></details>
 <details class="childMenu"><summary>Kiko · svezzamento</summary><div class="childMenuBody">${mealRow(k,'kiko','breakfast','','Colazione',kiko.breakfast||'')}${mealRow(k,'kiko','snackAM','','Merenda mattina',kiko.snackAM||'')}${mealRow(k,'kiko','lunch','','Pranzo',kiko.lunch||'')}${mealRow(k,'kiko','snackPM','','Merenda pomeriggio',kiko.snackPM||'')}${mealRow(k,'kiko','dinner','','Cena',kiko.dinner||'')}</div></details>`;
 menuWeek.appendChild(el);
 menuWeek.querySelectorAll('[data-menu]').forEach(inp=>inp.onchange=()=>{setMealValue(inp.dataset.menu,inp.dataset.person,inp.dataset.meal,inp.value.trim());save();renderMenu()});
 menuWeek.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>openRecipe(b.dataset.recipe));
 menuWeek.querySelectorAll('[data-swap]').forEach(b=>b.onclick=()=>swapSingleMeal(b.dataset.swap,b.dataset.swapPerson,b.dataset.swapMeal));
 document.querySelectorAll('[data-menu-jump]').forEach(b=>b.onclick=()=>{menuSelectedDay=0;renderMenu();setTimeout(()=>menuWeek.scrollIntoView({behavior:'smooth',block:'start'}),30)});
 renderCustomRecipes();renderMenuBalance();
}
function swapSingleMeal(k,person,meal){
 let m=s.menu[k]||{},current=mealValue(m,person,meal),next='';
 if(person==='adult'){
  if(meal==='breakfast')next=pickSimple('jj','breakfast',current)?.name||current;
  else next=pickRecipe(['jj','kiki'],null,current)?.name||current
 }else{
  let age=Number(s.profiles[person]?.ageMonths||0);
  if(age<12){
   let group=meal==='breakfast'?'breakfast':(meal==='snackAM'||meal==='snackPM'?'snack':meal);
   next=babyPick(group,current)
  }else if(meal==='breakfast'){
   next=pickSimple(person,'breakfast',current)?.name||current
  }else if(meal==='snackAM'||meal==='snackPM'){
   next=pickSimple(person,'snack',current)?.name||current
  }else{
   next=pickRecipe([person],null,current)?.name||current
  }
 }
 setMealValue(k,person,meal,next);
 save();renderMenu()
}
function renderMenuBalance(){
 let counts={legumi:0,pesce:0,uova:0,carne:0,vegetariano:0,formaggio:0},known=0;
 for(let i=0;i<7;i++){
  let m=s.menu[dateKey(offsetDate(i))]||{};
  [m.lunch,m.dinner].forEach(name=>{
   let r=recipeDetails(name);
   if(r){counts[r.category]=(counts[r.category]||0)+1;known++}
  })
 }
 let entries=[
  ['🫘','Legumi',counts.legumi],['🐟','Pesce',counts.pesce],['🥚','Uova',counts.uova],
  ['🍗','Carne',counts.carne],['🥦','Vegetariano',counts.vegetariano],['🧀','Formaggio',counts.formaggio]
 ];
 menuBalance.innerHTML=known?entries.map(x=>`<div class="balanceChip"><span>${x[0]} ${x[1]}</span><b>${x[2]}</b></div>`).join(''):'<div class="muted">Genera la settimana per vedere la varietà dei pasti principali.</div>'
}
function mealIngredients(name){
 let r=recipeDetails(name);
 if(r)return r.ingredients;
 let simple=SIMPLE_MEALS.find(x=>x.name===name);
 if(simple)return simple.ingredients;
 if(!name)return [];
 return [[name,'','']]
}
function addMenuWeekToShopping(){
 let aggregated=new Map();
 let add=(item)=>{
  let [name,qty,unit]=Array.isArray(item)?item:[item,'',''];
  let key=String(name).trim().toLowerCase();
  if(!key)return;
  if(!aggregated.has(key))aggregated.set(key,{name:String(name).trim(),qty:0,unit:unit||'',hasNumeric:false});
  let a=aggregated.get(key);
  if(typeof qty==='number'&&Number.isFinite(qty)){
   if(!a.unit||a.unit===unit){a.qty+=qty;a.unit=unit||a.unit;a.hasNumeric=true}
  }
 };
 for(let i=0;i<7;i++){
  let m=s.menu[dateKey(offsetDate(i))]||{};
  let names=[m.breakfast,m.lunch,m.dinner];
  let c=m.caty||{},b=m.kiko||{};
  names.push(c.breakfast,c.snackAM,c.lunch,c.snackPM,c.dinner,b.breakfast,b.snackAM,b.lunch,b.snackPM,b.dinner);
  // Avoid counting the exact same shared meal twice on the same day.
  [...new Set(names.filter(Boolean))].forEach(name=>mealIngredients(name).forEach(add))
 }
 aggregated.forEach(a=>{
  let qty=a.hasNumeric?`${a.qty}${a.unit?` ${a.unit}`:''}`:'';
  let existing=s.shopping.find(x=>x.text.toLowerCase()===a.name.toLowerCase()&&!x.done);
  if(existing){
   if(qty&&!existing.qty)existing.qty=qty
  }else s.shopping.push({id:crypto.randomUUID(),text:a.name,qty,category:'Alimentari',url:'',expectedPrice:0,actualPrice:0,done:false,source:'menu'})
 });
 save();go('shop')
}
menuToShop.onclick=addMenuWeekToShopping;
function renderProfiles(){
 let people=[['caty','👧 Caty'],['kiko','👶 Kiko'],['jj','👨 JJ'],['kiki','👩 Kiki']];
 profileForms.innerHTML=`<div class="card profileIntro"><b>Come usarli</b><p class="muted">Scrivi parole separate da virgola. Le preferenze aiutano il generatore, ma non bloccano mai la modifica manuale del menu.</p></div>`+
 people.map(([id,label])=>{
  let p=s.profiles[id]||{};
  return `<form class="profileCard" data-profile="${id}">
   <h3>${label}</h3>
   <div class="profileGrid">
    <label>Età in mesi<input name="age" type="number" min="0" value="${Number(p.ageMonths||0)}" readonly></label>
    <label>Piace<input name="likes" value="${esc(p.likes||'')}" placeholder="es. pasta, zucchine"></label>
    <label>Non piace<input name="dislikes" value="${esc(p.dislikes||'')}" placeholder="es. piselli, pesce"></label>
    <label>Allergeni / esclusioni<input name="allergens" value="${esc(p.allergens||'')}" placeholder="es. latte, uova"></label>
   </div>
   <button class="primary">Salva profilo</button>
  </form>`
 }).join('');
 profileForms.querySelectorAll('[data-profile]').forEach(f=>f.onsubmit=e=>{
  e.preventDefault();
  let id=f.dataset.profile,d=new FormData(f),old=s.profiles[id]||{};
  s.profiles[id]={...old,ageMonths:Number(old.ageMonths||0),likes:d.get('likes').trim(),dislikes:d.get('dislikes').trim(),allergens:d.get('allergens').trim()};
  save();
  alert('Profilo salvato')
 })
}

function fillHealthPeople(){let opts=[['caty','👧 Caty'],['kiko','👶 Kiko'],['astro','🐶 Astro'],['jj','👨 JJ'],['kiki','👩 Kiki']].map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('');visitPerson.innerHTML=opts;medPerson.innerHTML=opts}
visitForm.onsubmit=e=>{
 e.preventDefault();
 let payload={
  kind:'visit',
  person:visitPerson.value,
  title:visitTitle.value.trim(),
  date:visitDate.value,
  time:visitTime.value,
  location:visitLocation.value.trim(),
  mapUrl:safeExternalUrl(visitMapUrl.value.trim()),
  note:visitNote.value.trim(),
  reminderDays:Number(visitReminder.value),
  notify:visitNotify.value
 };
 if(visitForm.dataset.edit){
  let x=s.health.find(v=>v.id===visitForm.dataset.edit);
  Object.assign(x,payload);
  delete visitForm.dataset.edit;
 }else{
  s.health.push({id:crypto.randomUUID(),...payload});
 }
 visitForm.reset();
 save();
 renderHealth();
};
medicineForm.onsubmit=e=>{e.preventDefault();let payload={kind:'medicine',person:medPerson.value,name:medName.value.trim(),title:medName.value.trim(),dose:medDose.value.trim(),date:medDate.value,time:medTime.value,note:medNote.value.trim(),reminderDays:Number(medReminder.value),notify:medNotify.value};if(medicineForm.dataset.edit){let x=s.health.find(v=>v.id===medicineForm.dataset.edit);Object.assign(x,payload);delete medicineForm.dataset.edit}else s.health.push({id:crypto.randomUUID(),...payload});medicineForm.reset();save();renderHealth()};
function renderHealth(){
 let upcomingHealth=[...s.health].filter(h=>h.date>=dateKey()).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
 let nextHealth=upcomingHealth[0];
 let visits30=upcomingHealth.filter(h=>h.kind==='visit'&&dateObj(h.date)-dateObj(dateKey())<=30*86400000).length;
 let meds=upcomingHealth.filter(h=>h.kind==='medicine').length;
 if(document.getElementById('healthSummary'))healthSummary.innerHTML=`<div class="summaryNumbers"><div><b>${visits30}</b><span>visite nei prossimi 30 giorni</span></div><div><b>${meds}</b><span>medicine da ricordare</span></div></div><p>${nextHealth?`La prossima cosa è <strong>${esc(nextHealth.title)}</strong> per ${personName(nextHealth.person)} il ${birthLabel(nextHealth.date)}${nextHealth.time?' alle '+esc(nextHealth.time):''}.`:'Nessuna scadenza sanitaria in arrivo.'}</p>`;
 let upcoming=[...s.health]
  .filter(h=>h.date>=dateKey())
  .sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));

 healthList.innerHTML=upcoming.length?upcoming.map(h=>{
  let loc=h.kind==='visit'&&h.location?`<div class="meta">📍 ${esc(h.location)}</div>`:'';
  let maps='';
  if(h.kind==='visit'&&h.location){
   let custom=safeExternalUrl(h.mapUrl||'');
   maps=`<div class="mapButtons">
    ${custom?`<a href="${esc(custom)}" target="_blank" rel="noopener">🔗 Link salvato</a>`:''}
    <a href="${appleMapsUrl(h.location)}" target="_blank" rel="noopener">🍎 Apple Maps</a>
    <a href="${googleMapsUrl(h.location)}" target="_blank" rel="noopener">📍 Google Maps</a>
   </div>`;
  }
  return `<div class="row healthRow">
    <span>${h.kind==='visit'?'🩺':'💊'}</span>
    <div class="grow">
      <b>${esc(h.title)}</b>
      <div class="meta">${personName(h.person)} · ${birthLabel(h.date)}${h.time?' · '+h.time:''}</div>
      ${loc}
      ${h.kind==='medicine'&&h.dose?`<div class="meta">Dose: ${esc(h.dose)}</div>`:''}
      ${h.note?`<div class="meta">${esc(h.note)}</div>`:''}
      <div class="meta">🔔 ${Number(h.reminderDays??(h.kind==='visit'?1:0))}g · ${notifyLabel(h.notify||'both')}</div>
      ${maps}
    </div>
    <button class="editBtn" data-health-edit="${h.id}">✎</button>
    <button class="del" data-health="${h.id}">✕</button>
  </div>`;
 }).join(''):'<div class="muted">Nessun evento programmato.</div>';

 healthList.querySelectorAll('[data-health]').forEach(b=>b.onclick=()=>{
  s.health=s.health.filter(h=>h.id!==b.dataset.health);
  save();
  renderHealth();
 });

 healthList.querySelectorAll('[data-health-edit]').forEach(b=>b.onclick=()=>{
  let h=s.health.find(x=>x.id===b.dataset.healthEdit);
  if(!h)return;

  if(h.kind==='visit'){
   visitPerson.value=h.person;
   visitTitle.value=h.title;
   visitDate.value=h.date;
   visitTime.value=h.time||'';
   visitLocation.value=h.location||'';
   visitMapUrl.value=h.mapUrl||'';
   visitNote.value=h.note||'';
   visitReminder.value=String(h.reminderDays??1);
   visitNotify.value=h.notify||'both';
   visitForm.dataset.edit=h.id;
   visitTitle.focus();
   scrollTo(0,0);
  }else{
   medPerson.value=h.person;
   medName.value=h.title;
   medDose.value=h.dose||'';
   medDate.value=h.date;
   medTime.value=h.time||'';
   medNote.value=h.note||'';
   medReminder.value=String(h.reminderDays??0);
   medNotify.value=h.notify||'both';
   medicineForm.dataset.edit=h.id;
   medName.focus();
   scrollTo(0,0);
  }
 });
}
function renderReminders(){
 let all=collectReminders().filter(x=>!reminderIsDismissed(x));
 let due=all.filter(x=>['due','overdue'].includes(reminderState(x)));
 let upcoming=all.filter(x=>reminderState(x)==='upcoming').slice(0,40);

 reminderAlert.innerHTML=due.length
  ?`<div class="reminderHero"><span>🔔</span><div><b>${due.length} ${due.length===1?'promemoria da vedere':'promemoria da vedere'}</b><div class="meta">Le scadenze provengono automaticamente dalle altre sezioni.</div></div></div>`
  :`<div class="reminderHero ok"><span>✅</span><div><b>Niente di urgente</b><div class="meta">I prossimi promemoria sono sotto.</div></div></div>`;

 remindersDue.innerHTML=due.length?due.map(reminderCard).join(''):'<div class="muted">Nessun promemoria da gestire adesso.</div>';
 remindersUpcoming.innerHTML=upcoming.length?upcoming.map(reminderCard).join(''):'<div class="muted">Nessun promemoria futuro.</div>';

 let manual=[...s.manualReminders].sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
 manualReminderList.innerHTML=manual.length?manual.map(x=>`<div class="row ${x.done?'done':''}">
  <span>${reminderKindIcon(x.kind)}</span><div class="grow"><b>${esc(x.person&&x.person!=='family'?personName(x.person)+' · '+x.title:x.title)}</b><div class="meta">${reminderKindLabel(x.kind)} · ${birthLabel(x.date)}${x.time?' · '+x.time:''} · ${notifyLabel(x.notify||'both')}${x.done?' · ✅ Fatto':''}</div>${x.note?`<div class="meta">${esc(x.note)}</div>`:''}</div>
  <button class="editBtn" data-manual-edit="${x.id}">✎</button><button class="del" data-manual-del="${x.id}">✕</button>
 </div>`).join(''):'<div class="muted">Nessun promemoria manuale.</div>';

 document.querySelectorAll('[data-rem-open]').forEach(b=>b.onclick=()=>openSourceItem(b.dataset.remOpen,b.dataset.remId));
 document.querySelectorAll('[data-rem-dismiss]').forEach(b=>b.onclick=()=>dismissReminder(b.dataset.remDismiss));
 document.querySelectorAll('[data-rem-done]').forEach(b=>b.onclick=()=>{let x=s.manualReminders.find(v=>v.id===b.dataset.remDone);if(x)x.done=true;save();renderReminders()});
 manualReminderList.querySelectorAll('[data-manual-edit]').forEach(b=>b.onclick=()=>openReminder(b.dataset.manualEdit));
 manualReminderList.querySelectorAll('[data-manual-del]').forEach(b=>b.onclick=()=>{s.manualReminders=s.manualReminders.filter(x=>x.id!==b.dataset.manualDel);save();renderReminders()})
}
function openReminder(id=null,preset={}){
 editingReminderId=id;
 let x=id?s.manualReminders.find(v=>v.id===id):null;
 reminderKind.value=x?.kind||preset.kind||'reminder';
 reminderPerson.value=x?.person||preset.person||'family';
 reminderTitle.value=x?.title||preset.title||'';
 reminderDate.value=x?.date||preset.date||dateKey();
 reminderTime.value=x?.time||preset.time||'';
 reminderDays.value=String(x?.reminderDays??preset.reminderDays??1);
 reminderNotify.value=x?.notify||preset.notify||'both';
 reminderNote.value=x?.note||preset.note||'';
 reminderDialog.showModal();setTimeout(()=>reminderTitle.focus(),20)
}
addReminderBtn.onclick=()=>openReminder();
reminderForm.onsubmit=e=>{
 e.preventDefault();
 let payload={kind:reminderKind.value,person:reminderPerson.value,title:reminderTitle.value.trim(),date:reminderDate.value,time:reminderTime.value,reminderDays:Number(reminderDays.value),notify:reminderNotify.value,note:reminderNote.value.trim(),done:false};
 if(editingReminderId){let x=s.manualReminders.find(v=>v.id===editingReminderId);Object.assign(x,payload)}
 else s.manualReminders.push({id:crypto.randomUUID(),...payload});
 editingReminderId=null;reminderForm.reset();reminderDialog.close();save();renderReminders();if(calendar.classList.contains('on')){selectedDate=payload.date;renderCalendar()}
};

function monthBase(offset=0){let d=new Date();d.setDate(1);d.setMonth(d.getMonth()+offset);d.setHours(12,0,0,0);return d}
function dayData(k){
 let out=[];
 let menu=s.menu[k];if(menu?.breakfast)out.push({icon:'☕',text:'Colazione: '+menu.breakfast,source:'menu'});if(menu?.lunch)out.push({icon:'🍝',text:'Pranzo: '+menu.lunch,source:'menu'});if(menu?.dinner)out.push({icon:'🌙',text:'Cena: '+menu.dinner,source:'menu'});

 // SALUTE: visite e medicine sempre nel calendario
 s.health.filter(h=>h.date===k).forEach(h=>out.push({
 icon:h.kind==='visit'?'🩺':'💊',
 text:`${personName(h.person)}: ${h.title}${h.time?' · '+h.time:''}${h.kind==='visit'&&h.location?' · 📍 '+h.location:''}`,
 source:'health',
 id:h.id,
 location:h.location||'',
 mapUrl:h.mapUrl||''
}));

 // Lavoro / assenze JJ e Kiki
 (s.workStatus||[]).filter(w=>k>=w.startDate&&k<=w.endDate).forEach(w=>out.push({icon:workStatusIcon(w.type),text:`${personName(w.person)}: ${workStatusLabel(w.type)}${w.note?' · '+w.note:''}`,source:'work',id:w.id}));

 // Bambini / Astro
 s.events.filter(e=>dateKey(new Date(e.at))===k).forEach(e=>out.push({icon:META[e.type]?.[0]||'•',text:`${personName(e.childId)}: ${META[e.type]?.[1]||e.type} · ${timeLabel(e.at)}`,source:'event',id:e.id}));

 // Piano Casa: task pending/completate vere
 s.houseTasks.filter(x=>x.date===k&&x.status!=='cancelled').forEach(x=>out.push({
  icon:houseTaskIcon(x),
  text:`${houseTaskTitle(x)} · ${taskOwnerLabel(x.by)} · ${x.status==='done'?'✅ Completata':(!taskDependencyReady(x)?'🔒 '+taskDependencyText(x):'⏳ Da fare')}`,
  source:'houseTask',id:x.id
 }));
 // Storico manuale non legato a una task
 s.houseLogs.filter(x=>!x.taskId&&dateKey(new Date(x.at))===k).forEach(x=>out.push({icon:houseIcon(x.routineId),text:`${x.title||houseName(x.routineId)} · ${personName(x.by)} · ${localTimeFromIso(x.at)}`,source:'house',id:x.id}));

 // Bollette / abbonamenti
 s.subscriptions.filter(x=>x.dueDate===k).forEach(x=>out.push({icon:'⏰',text:`${x.name} · ${euro(x.amount)}`,source:'subscription',id:x.id}));

 // Manutenzioni casa
 s.maintenance.filter(x=>x.date===k).forEach(x=>out.push({icon:maintenanceIcon(x.type),text:`${x.title}${x.time?' · '+x.time:''}${x.status==='done'?' · ✅':' · ⏳'}`,source:'maintenance',id:x.id}));

 // Scadenze auto
 s.autoDeadlines.filter(x=>x.date===k).forEach(x=>out.push({icon:autoIcon(x.type),text:`${x.title}${x.time?' · '+x.time:''}${x.status==='done'?' · ✅':' · ⏳'}`,source:'auto',id:x.id}));

 // Eventi e promemoria creati dal calendario
 s.manualReminders.filter(x=>x.date===k&&!x.done).forEach(x=>out.push({
  icon:reminderKindIcon(x.kind),text:`${x.person&&x.person!=='family'?personName(x.person)+': ':''}${x.title}${x.time?' · '+x.time:''}`,source:'manual',id:x.id
 }));

 // Compleanni della famiglia: arrivano direttamente dai profili
 const ownBirthdays=[...s.children.map(c=>({id:c.id,name:c.name,date:c.birthDate})),...Object.entries(ADULTS).map(([id,a])=>({id,name:a.name,date:a.birthDate}))];
 ownBirthdays.filter(b=>b.date&&b.date.slice(5)===k.slice(5)).forEach(b=>out.push({icon:'♥',text:`Compleanno di ${b.name} · Tanti auguri!`,source:'familyBirthday',id:b.id}));

 // Compleanni amici e parenti: ricorrono ogni anno
 s.birthdays.filter(b=>!isOwnFamilyBirthdayDuplicate(b)&&birthdayMatchesDate(b,k)).forEach(b=>out.push({
  icon:'♥',text:`Compleanno di ${b.name}${b.relation?' · '+b.relation:''}`,source:'birthday',id:b.id
 }));

 return out
}
function renderCalendar(){
 let base=monthBase(calOffset),y=base.getFullYear(),m=base.getMonth();calMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(base);
 let first=new Date(y,m,1,12),start=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),prevDays=new Date(y,m,0).getDate(),cells=[];
 for(let i=0;i<42;i++){let num=i-start+1,other=false,d;if(num<1){d=new Date(y,m-1,prevDays+num,12);other=true}else if(num>days){d=new Date(y,m+1,num-days,12);other=true}else d=new Date(y,m,num,12);let k=dateKey(d),has=dayData(k).length,weekend=(i%7)>=5;cells.push(`<button class="calDay ${other?'other':''} ${weekend?'weekend':''} ${i%7===5?'saturday':''} ${i%7===6?'sunday':''} ${k===dateKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}"><span class="calNum">${d.getDate()}</span>${has?`<div class="dots">${Array.from({length:Math.min(has,4)},()=>'<i class="dot"></i>').join('')}</div>`:''}</button>`)}
 calendarGrid.innerHTML=cells.join('');calendarGrid.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>openCalendarDay(b.dataset.date));renderCalendarDetails()
}
function renderCalendarDetails(){let d=dateObj(selectedDate),a=dayData(selectedDate);selectedDateTitle.textContent=longDate(d);calendarDetails.innerHTML=a.length?a.map(x=>{
 let maps=x.source==='health'&&x.location?`<div class="mapButtons">
   ${safeExternalUrl(x.mapUrl||'')?`<a href="${esc(safeExternalUrl(x.mapUrl))}" target="_blank" rel="noopener">🔗 Link salvato</a>`:''}
   <a href="${appleMapsUrl(x.location)}" target="_blank" rel="noopener">🍎 Apple Maps</a>
   <a href="${googleMapsUrl(x.location)}" target="_blank" rel="noopener">📍 Google Maps</a>
  </div>`:'';
 let canOpen=['health','maintenance','auto','subscription','manual','menu','house','houseTask','event','birthday'].includes(x.source);
 return `<div class="row"><span>${x.icon}</span><div class="grow">${esc(x.text)}${maps}</div>${canOpen?`<button data-cal-open="${x.source}" data-cal-id="${x.id||''}">Apri</button>`:''}</div>`;
}).join(''):'<div class="muted">Niente in programma o registrato.</div>';
 calendarDetails.querySelectorAll('[data-cal-open]').forEach(b=>b.onclick=()=>openSourceItem(b.dataset.calOpen,b.dataset.calId));if(calendarDayDialog?.open)renderCalendarDayDialog()
}

let calendarAddDate=selectedDate,editingBirthdayId=null;
function calendarDayItemHtml(x){
 return `<div class="calendarSheetItem"><span>${x.icon}</span><div class="grow"><b>${esc(cleanAgendaText(x.text))}</b><small>${({familyBirthday:'Compleanno',birthday:'Compleanno',health:'Salute',manual:'Agenda',houseTask:'Casa',work:'Lavoro',maintenance:'Casa & lavori',auto:'Auto',subscription:'Scadenza',event:'Famiglia',menu:'Pasti',house:'Casa'})[x.source]||'Calendario'}</small></div>${['health','maintenance','auto','manual','houseTask','menu','birthday'].includes(x.source)?`<button data-day-open="${x.source}" data-day-id="${x.id||''}">Apri</button>`:''}</div>`
}
function renderCalendarDayDialog(){
 if(!calendarDayDialogList)return;
 let a=dayData(selectedDate);
 calendarDayDialogTitle.textContent=longDate(dateObj(selectedDate));
 calendarDayDialogList.innerHTML=a.length?a.map(calendarDayItemHtml).join(''):'<div class="friendlyEmpty"><b>Giorno libero</b><span>Non c’è ancora niente. Puoi aggiungerlo in un attimo.</span></div>';
 calendarDayDialogList.querySelectorAll('[data-day-open]').forEach(b=>b.onclick=()=>{calendarDayDialog.close();openSourceItem(b.dataset.dayOpen,b.dataset.dayId)})
}
function openCalendarDay(k){
 selectedDate=k;calendarAddDate=k;renderCalendar();renderCalendarDayDialog();
 if(!calendarDayDialog.open)calendarDayDialog.showModal()
}
function openCalendarAdd(k=selectedDate){
 calendarAddDate=k||dateKey();selectedDate=calendarAddDate;
 calendarAddDateLabel.textContent=longDate(dateObj(calendarAddDate)).toUpperCase();
 if(calendarDayDialog.open)calendarDayDialog.close();
 if(!calendarAddDialog.open)calendarAddDialog.showModal()
}
if(calendarAddBtn)calendarAddBtn.onclick=()=>openCalendarAdd(selectedDate);
if(calendarDayAddBtn)calendarDayAddBtn.onclick=()=>openCalendarAdd(selectedDate);
document.querySelectorAll('[data-calendar-add]').forEach(b=>b.onclick=()=>{
 const kind=b.dataset.calendarAdd;
 calendarAddDialog.close();
 if(kind==='birthday'){openBirthday(null,calendarAddDate);return}
 if(kind==='work'){openWorkStatus('jj',calendarAddDate);return}
 if(kind==='health'){go('health');visitDate.value=calendarAddDate;visitTitle.focus();return}
 if(kind==='house'){openHouseTask(null,calendarAddDate);return}
 if(kind==='calcetto'){openReminder(null,{kind:'calcetto',person:'jj',title:'Calcetto',date:calendarAddDate,reminderDays:0,notify:'both'});return}
 if(kind==='appointment'){openReminder(null,{kind:'appointment',person:'family',date:calendarAddDate,reminderDays:0,notify:'both'});return}
 if(kind==='event'){openReminder(null,{kind:'event',person:'family',date:calendarAddDate,reminderDays:0,notify:'both'});return}
 openReminder(null,{kind:'reminder',person:'family',date:calendarAddDate,reminderDays:0,notify:'both'})
});
function openBirthday(id=null,presetDate=selectedDate){
 editingBirthdayId=id;
 let b=id?s.birthdays.find(x=>x.id===id):null;
 birthdayName.value=b?.name||'';
 birthdayDate.value=b?.date||presetDate||dateKey();
 birthdayRelation.value=b?.relation||'Famiglia';
 birthdayNote.value=b?.note||'';
 birthdayDialog.showModal();setTimeout(()=>birthdayName.focus(),20)
}
if(addBirthdayQuick)addBirthdayQuick.onclick=()=>openBirthday(null,dateKey());
if(birthdayForm)birthdayForm.onsubmit=e=>{
 e.preventDefault();
 let payload={name:birthdayName.value.trim(),date:birthdayDate.value,relation:birthdayRelation.value,note:birthdayNote.value.trim()};
 if(editingBirthdayId){let b=s.birthdays.find(x=>x.id===editingBirthdayId);if(b)Object.assign(b,payload)}
 else s.birthdays.push({id:crypto.randomUUID(),...payload});
 editingBirthdayId=null;birthdayForm.reset();birthdayDialog.close();save();renderBirthdayPreview();if(calendar.classList.contains('on'))renderCalendar()
};
function renderBirthdayPreview(){
 if(!birthdayPreview)return;
 let now=new Date(),rows=(s.birthdays||[]).filter(b=>!isOwnFamilyBirthdayDuplicate(b)).map(b=>({...b,next:nextBirthdayDate(b,now)})).sort((a,b)=>a.next.localeCompare(b.next));
 birthdayPreview.innerHTML=rows.length?rows.slice(0,8).map(b=>`<div class="birthdayRow"><span>🎂</span><div class="grow"><b>${esc(b.name)}</b><small>${esc(b.relation||'')} · ${longDate(dateObj(b.next))}${b.note?' · '+esc(b.note):''}</small></div><button data-birthday-edit="${b.id}">✎</button><button class="del" data-birthday-del="${b.id}">✕</button></div>`).join(''):'<div class="friendlyEmpty compactEmpty"><b>Nessun compleanno salvato</b><span>Aggiungi amici e parenti e compariranno ogni anno nel calendario.</span></div>';
 birthdayPreview.querySelectorAll('[data-birthday-edit]').forEach(b=>b.onclick=()=>openBirthday(b.dataset.birthdayEdit));
 birthdayPreview.querySelectorAll('[data-birthday-del]').forEach(b=>b.onclick=()=>{if(confirm('Eliminare questo compleanno?')){s.birthdays=s.birthdays.filter(x=>x.id!==b.dataset.birthdayDel);save();renderBirthdayPreview()}})
}

calPrev.onclick=()=>{calOffset--;renderCalendar()};calNext.onclick=()=>{calOffset++;renderCalendar()};


function taskDependencyReady(t){
 if(t.routineId==='mop'){
  let sweep=sweepForMop(t);
  return !!sweep&&sweep.status==='done'
 }
 if(!t.dependsOnId)return true;
 let parent=s.houseTasks.find(x=>x.id===t.dependsOnId);
 return !!parent&&parent.status==='done'
}
function renderHouseTaskRow(t,compact=false){
 let locked=!taskDependencyReady(t)&&t.status!=='done';
 let state=t.status==='done'?'✅ Fatta':locked?'🔒 '+taskDependencyText(t):(t.date<dateKey()?'⚠️ In ritardo':'⏳ Da fare');
 return `<div class="row houseTaskRow ${t.status==='done'?'done':''} ${locked?'locked':''}">
  <span class="taskIcon">${houseTaskIcon(t)}</span>
  <div class="grow">
   <b>${esc(houseTaskTitle(t))}</b>
   <div class="meta">${birthLabel(t.date)} · ${taskOwnerLabel(t.by)} · ${state}</div>
   ${t.note?`<div class="meta">${esc(t.note)}</div>`:''}
  </div>
  ${t.status!=='done'?`<div class="houseTaskActions">
   <button class="primary smallBtn" data-task-done="${t.id}" ${locked?'disabled':''}>✓ Fatto</button>
   <button class="smallBtn" data-task-postpone="${t.id}">→ +1g</button>
   <button class="editBtn" data-task-edit="${t.id}">✎</button>
  </div>`:''}
  <button class="del" data-task-del="${t.id}">✕</button>
 </div>`
}
function bindHouseTaskActions(root){
 root.querySelectorAll('[data-task-done]').forEach(b=>b.onclick=()=>completeHouseTask(b.dataset.taskDone));
 root.querySelectorAll('[data-task-postpone]').forEach(b=>b.onclick=()=>postponeHouseTask(b.dataset.taskPostpone));
 root.querySelectorAll('[data-task-edit]').forEach(b=>b.onclick=()=>openHouseTask(b.dataset.taskEdit));
 root.querySelectorAll('[data-task-del]').forEach(b=>b.onclick=()=>deleteHouseTask(b.dataset.taskDel));
}
function renderHouse(){
 let weekKeys=houseWeekDates(),weekTasks=s.houseTasks.filter(t=>weekKeys.includes(t.date)&&t.status!=='cancelled'),weekDone=weekTasks.filter(t=>t.status==='done').length,weekPending=weekTasks.filter(t=>t.status==='pending').length,weekPct=weekTasks.length?Math.round(weekDone/weekTasks.length*100):0;if(document.getElementById('houseWeekSummary'))houseWeekSummary.innerHTML=`<div class="summaryNumbers"><div><b>${weekDone}</b><span>fatte nei prossimi 7 giorni</span></div><div><b>${weekPending}</b><span>ancora da fare</span></div></div><p>${weekTasks.length?`${weekPct}% del piano è già completato. ${weekPending?`Le prossime da fare sono ${weekTasks.filter(t=>t.status==='pending').slice(0,2).map(houseTaskTitle).join(' e ')}.`:'Tutto fatto ✓'}`:'Non hai ancora organizzato la settimana.'}</p>`;
 let today=dateKey(),todayTasks=s.houseTasks.filter(t=>t.date===today&&t.status!=='cancelled').sort(houseTaskSort);
 let pending=todayTasks.filter(t=>t.status==='pending');
 housePendingCount.textContent=pending.length;
 houseTodayTasks.innerHTML=todayTasks.length?todayTasks.map(t=>renderHouseTaskRow(t)).join(''):'<div class="emptyPlan"><b>Tutto tranquillo per oggi ✨</b><span>Organizza la settimana oppure aggiungi una faccenda.</span></div>';
 bindHouseTaskActions(houseTodayTasks);

 houseWeekPlan.innerHTML=houseWeekDates().map(k=>{
  let tasks=s.houseTasks.filter(t=>t.date===k&&t.status!=='cancelled').sort(houseTaskSort);
  return `<div class="houseDayPlan ${k===today?'today':''}">
   <div class="houseDayHead"><b>${k===today?'Oggi':longDate(dateObj(k))}</b><span>${tasks.filter(t=>t.status==='pending').length} da fare</span></div>
   ${tasks.length?tasks.map(t=>renderHouseTaskRow(t,true)).join(''):'<div class="muted houseDayEmpty">Niente programmato</div>'}
  </div>`
 }).join('');
 bindHouseTaskActions(houseWeekPlan);

 houseRulesGrid.innerHTML=[
  ...['sweep','mop','washer','sheets','towels'].map(rid=>{
   let r=houseRoutine(rid),val=s.housePlanRules[rid]||DEFAULT.housePlanRules[rid];
   return `<label class="houseRule"><span>${r.emoji} ${esc(r.name)}</span><select data-house-rule="${rid}">${HOUSE_FREQ_OPTIONS.map(([v,l])=>`<option value="${v}" ${v===val?'selected':''}>${l}</option>`).join('')}</select></label>`
  }),
  `<label class="houseRule lockedRule"><span>♨️ Asciugatrice</span><select disabled><option>Dopo ogni lavatrice</option></select></label>`
 ].join('');
 houseRulesGrid.querySelectorAll('[data-house-rule]').forEach(sel=>sel.onchange=()=>{s.housePlanRules[sel.dataset.houseRule]=sel.value;save()});

 let logs=[...s.houseLogs].sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,30);
 houseHistory.innerHTML=logs.length?logs.map(x=>`<div class="row"><span>${houseIcon(x.routineId)}</span><div class="grow"><b>${esc(houseName(x.routineId))}</b><div class="meta">${personName(x.by)} · ${longDate(new Date(x.at))} · ${localTimeFromIso(x.at)}${x.note?' · '+esc(x.note):''}</div></div><button class="editBtn" data-hedit="${x.id}">✎</button><button class="del" data-hlogdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna attività completata.</div>';
 houseHistory.querySelectorAll('[data-hedit]').forEach(b=>b.onclick=()=>openHouseEdit(b.dataset.hedit));
 houseHistory.querySelectorAll('[data-hlogdel]').forEach(b=>b.onclick=()=>{s.houseLogs=s.houseLogs.filter(x=>x.id!==b.dataset.hlogdel);save();renderHouse()})
}
function houseTaskSort(a,b){
 if(a.status!==b.status)return a.status==='pending'?-1:1;
 if(a.routineId==='dryer'&&b.routineId==='washer')return 1;
 if(a.routineId==='washer'&&b.routineId==='dryer')return -1;
 if(a.routineId==='mop'&&b.routineId==='sweep')return 1;
 if(a.routineId==='sweep'&&b.routineId==='mop')return -1;
 return houseTaskTitle(a).localeCompare(houseTaskTitle(b),'it')
}
function completeHouseTask(id){
 let t=s.houseTasks.find(x=>x.id===id);if(!t)return;
 if(!taskDependencyReady(t)){alert(t.routineId==='mop'?'Prima devi spazzare.':'Prima devi completare la lavatrice collegata.');return}
 if(t.status==='done')return;
 t.status='done';t.completedAt=new Date().toISOString();
 let rid=t.routineId==='custom'?'custom':t.routineId;
 let log={id:crypto.randomUUID(),routineId:rid,by:(t.by==='family'?(cloudMemberName==='Kiki'?'kiki':'jj'):t.by),at:t.completedAt,note:t.note||'',taskId:t.id,title:houseTaskTitle(t)};
 t.logId=log.id;s.houseLogs.push(log);
 save();renderHouse()
}
function postponeHouseTask(id){
 let t=s.houseTasks.find(x=>x.id===id);if(!t||t.status==='done')return;
 let oldDate=t.date,d=dateObj(t.date);d.setDate(d.getDate()+1);t.date=dateKey(d);
 if(t.routineId==='washer'&&t.linkedTaskId){
  let dryer=s.houseTasks.find(x=>x.id===t.linkedTaskId);
  if(dryer&&dryer.status==='pending')dryer.date=t.date
 }
 if(t.routineId==='sweep'){
  s.houseTasks.filter(x=>x.routineId==='mop'&&x.status==='pending'&&(x.linkedSweepId===t.id||x.date===oldDate)).forEach(m=>{m.date=t.date;m.linkedSweepId=t.id})
 }
 if(t.routineId==='mop')ensureSweepForMop(t,t.generated,t.by);
 save();renderHouse()
}
function deleteHouseTask(id){
 let t=s.houseTasks.find(x=>x.id===id);if(!t)return;
 if(!confirm(`Eliminare "${houseTaskTitle(t)}"?`))return;
 let linked=t.linkedTaskId;
 s.houseTasks=s.houseTasks.filter(x=>x.id!==id);
 if(t.routineId==='washer'&&linked){
  let d=s.houseTasks.find(x=>x.id===linked);
  if(d&&d.status==='pending')s.houseTasks=s.houseTasks.filter(x=>x.id!==linked)
 }
 if(t.routineId==='sweep')s.houseTasks=s.houseTasks.filter(x=>!(x.routineId==='mop'&&x.status==='pending'&&x.linkedSweepId===t.id));
 save();renderHouse()
}
function openHouseTask(id=null,date=null){
 editingHouseTaskId=id;
 let t=id?s.houseTasks.find(x=>x.id===id):null;
 houseTaskRoutine.value=t?.routineId||'custom';
 houseTaskTitle.value=t?.title||'';
 houseTaskDate.value=t?.date||date||dateKey();
 houseTaskWho.value=t?.by||'family';
 houseTaskNote.value=t?.note||'';
 if(t?.routineId==='dryer'){
  houseTaskRoutine.disabled=true
 }else houseTaskRoutine.disabled=false;
 houseTaskDialog.showModal()
}
addHouseTaskBtn.onclick=()=>openHouseTask();
generateHouseWeek.onclick=()=>generateHousePlan(false);
fillHouseWeek.onclick=()=>generateHousePlan(true);
houseTaskRoutine.onchange=()=>{
 let rid=houseTaskRoutine.value;
 if(rid!=='custom')houseTaskTitle.value=houseRoutine(rid)?.name||''
};
houseTaskForm.onsubmit=e=>{
 e.preventDefault();
 let rid=houseTaskRoutine.value,date=houseTaskDate.value,title=houseTaskTitle.value.trim(),by=houseTaskWho.value,note=houseTaskNote.value.trim();

 if(editingHouseTaskId){
  let t=s.houseTasks.find(x=>x.id===editingHouseTaskId);if(!t)return;
  let oldDate=t.date;
  if(t.routineId==='dryer'&&rid!=='dryer')rid='dryer';
  if(rid==='dryer'){
   let washer=s.houseTasks.find(x=>x.id===t.dependsOnId);
   if(!washer){alert('Questa asciugatrice non ha più una lavatrice collegata.');return}
   if(date<washer.date){alert('L’asciugatrice non può essere programmata prima della lavatrice.');return}
  }
  Object.assign(t,{routineId:rid,title,date,by,note});
  if(rid==='mop')ensureSweepForMop(t,t.generated,t.by);
  if(t.routineId==='washer'&&t.linkedTaskId&&oldDate!==date){
   let dryer=s.houseTasks.find(x=>x.id===t.linkedTaskId);
   if(dryer&&dryer.status==='pending')dryer.date=date
  }
  if(t.routineId==='sweep'&&oldDate!==date){
   s.houseTasks.filter(x=>x.routineId==='mop'&&x.status==='pending'&&x.linkedSweepId===t.id).forEach(m=>m.date=date)
  }
 }else{
  if(rid==='dryer'){
   let washer=[...s.houseTasks].reverse().find(x=>x.routineId==='washer'&&x.date===date&&x.status!=='cancelled');
   if(!washer){alert('Per aggiungere un’asciugatrice serve prima una lavatrice nello stesso giorno.');return}
   let t=makeHouseTask('dryer',date,false,by,title);t.note=note;t.dependsOnId=washer.id;t.linkedTaskId=washer.id;washer.linkedTaskId=t.id;s.houseTasks.push(t)
  }else if(rid==='washer'){
   let w=addWasherPair(date,false,by);w.title=title||houseRoutine('washer').name;w.note=note
  }else if(rid==='mop'){
   let t=makeHouseTask(rid,date,false,by,title);t.note=note;s.houseTasks.push(t);ensureSweepForMop(t,false,by)
  }else{
   let t=makeHouseTask(rid,date,false,by,title);t.note=note;s.houseTasks.push(t)
  }
 }
 editingHouseTaskId=null;houseTaskRoutine.disabled=false;houseTaskForm.reset();houseTaskDialog.close();save();renderHouse()
};

function openHouseEdit(logId,routineId){
 editingHouseId=logId||null;let x=logId?s.houseLogs.find(v=>v.id===logId):null;let rid=x?.routineId||routineId;
 houseEditDialog.dataset.routine=rid;houseEditTitle.textContent=`${houseIcon(rid)} ${x?.title||houseName(rid)}`;
 houseEditWho.value=x?.by||(cloudMemberName==='Kiki'?'kiki':'jj');let now=x?new Date(x.at):new Date();
 houseEditDate.value=dateKey(now);houseEditTime.value=now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});houseEditNote.value=x?.note||'';
 houseEditDialog.showModal()
}
houseEditForm.onsubmit=e=>{e.preventDefault();let rid=houseEditDialog.dataset.routine,payload={routineId:rid,by:houseEditWho.value,at:isoFromLocal(houseEditDate.value,houseEditTime.value),note:houseEditNote.value.trim()};if(editingHouseId){let x=s.houseLogs.find(v=>v.id===editingHouseId);Object.assign(x,payload)}else s.houseLogs.push({id:crypto.randomUUID(),...payload});houseEditDialog.close();save();renderHouse()};


/* V8.5 — manutenzioni e auto: moduli completi */
function openMaintenance(id=''){
 editingMaintenanceId=id||null;
 let x=id?s.maintenance.find(v=>v.id===id):null;
 maintenanceForm.reset();
 maintType.value=x?.type||'Manutenzione generica';
 maintTitle.value=x?.title||'';
 maintDate.value=x?.date||dateKey();
 maintTime.value=x?.time||'';
 maintExpected.value=x?.expected||'';
 maintActual.value=x?.actual||'';
 maintFrequency.value=x?.frequency||'once';
 maintStatus.value=x?.status||'planned';
 maintReminder.value=String(x?.reminderDays??7);
 maintNotify.value=x?.notify||'both';
 maintNote.value=x?.note||'';
 maintenanceDialog.showModal();
 if(!x)maintTitle.focus()
}
function renderMaintenance(){
 let list=[...s.maintenance].sort((a,b)=>(a.status==='done')-(b.status==='done')||String(a.date).localeCompare(String(b.date)));
 let pending=list.filter(x=>x.status!=='done'),next=pending.find(x=>x.date>=dateKey());
 let year=new Date().getFullYear();
 let spent=s.expenses.filter(x=>x.source==='maintenance'&&String(x.date||'').startsWith(String(year))).reduce((a,x)=>a+Number(x.amount||0),0);
 if(document.getElementById('maintenanceSummary'))maintenanceSummary.innerHTML=`<div class="summaryNumbers"><div><b>${pending.length}</b><span>lavori aperti</span></div><div><b>${euro(spent)}</b><span>spesi quest’anno</span></div></div><p>${next?`La prossima manutenzione è <strong>${esc(next.title)}</strong> il ${birthLabel(next.date)}.`:'Nessun lavoro urgente in programma.'}</p>`;
 maintenanceList.innerHTML=list.length?list.map(x=>`<div class="row ${x.status==='done'?'done':''} ${x.date<dateKey()&&x.status!=='done'?'overdue':''}"><span>${maintenanceIcon(x.type)}</span><div class="grow"><b>${esc(x.title)}</b><div class="meta">${birthLabel(x.date)}${x.time?' · '+esc(x.time):''} · ${x.status==='done'?'Fatta':'Da fare'}${x.actual?` · ${euro(x.actual)}`:x.expected?` · previsto ${euro(x.expected)}`:''}</div>${x.note?`<div class="meta">${esc(x.note)}</div>`:''}</div>${x.status!=='done'?`<button class="primary smallBtn" data-maint-done="${x.id}">✓ Fatto</button>`:''}<button class="editBtn" data-maint-edit="${x.id}">✎</button><button class="del" data-maint-del="${x.id}">✕</button></div>`).join(''):'<div class="friendlyEmpty"><b>Nessuna manutenzione registrata</b><span>Per ora è tutto in ordine.</span></div>';
 maintenanceList.querySelectorAll('[data-maint-edit]').forEach(b=>b.onclick=()=>openMaintenance(b.dataset.maintEdit));
 maintenanceList.querySelectorAll('[data-maint-del]').forEach(b=>b.onclick=()=>{s.maintenance=s.maintenance.filter(x=>x.id!==b.dataset.maintDel);save();renderMaintenance()});
 maintenanceList.querySelectorAll('[data-maint-done]').forEach(b=>b.onclick=()=>{let x=s.maintenance.find(v=>v.id===b.dataset.maintDone);if(!x)return;x.status='done';if(Number(x.actual||x.expected||0)>0){x.actual=Number(x.actual||x.expected||0);ensureExpenseOnce('maintenance',x.id,x.title,x.actual,'Casa',x.date)}save();renderMaintenance()})
}
addMaintenanceBtn.onclick=()=>openMaintenance();
maintenanceForm.onsubmit=e=>{
 e.preventDefault();
 let payload={type:maintType.value,title:maintTitle.value.trim(),date:maintDate.value,time:maintTime.value,expected:Number(maintExpected.value||0),actual:Number(maintActual.value||0),frequency:maintFrequency.value,status:maintStatus.value,reminderDays:Number(maintReminder.value||0),notify:maintNotify.value,note:maintNote.value.trim()};
 let x=editingMaintenanceId?s.maintenance.find(v=>v.id===editingMaintenanceId):null;
 if(x)Object.assign(x,payload);else{x={id:crypto.randomUUID(),...payload};s.maintenance.push(x)}
 if(x.status==='done'&&Number(x.actual||x.expected||0)>0){x.actual=Number(x.actual||x.expected||0);ensureExpenseOnce('maintenance',x.id,x.title,x.actual,'Casa',x.date)}
 editingMaintenanceId=null;maintenanceDialog.close();save();renderMaintenance()
};

function openAutoDeadline(id=''){
 editingAutoDeadlineId=id||null;
 let x=id?s.autoDeadlines.find(v=>v.id===id):null;
 autoDeadlineForm.reset();
 autoDeadlineType.value=x?.type||'Manutenzione';
 autoDeadlineTitle.value=x?.title||'';
 autoDeadlineDate.value=x?.date||dateKey();
 autoDeadlineTime.value=x?.time||'';
 autoDeadlineCost.value=x?.cost||'';
 autoDeadlineKm.value=x?.km||'';
 autoDeadlineFrequency.value=x?.frequency||'once';
 autoDeadlineStatus.value=x?.status||'planned';
 autoDeadlineReminder.value=String(x?.reminderDays??7);
 autoDeadlineNotify.value=x?.notify||'both';
 autoDeadlineNote.value=x?.note||'';
 autoDeadlineDialog.showModal();
 if(!x)autoDeadlineTitle.focus()
}
function renderAuto(){
 let list=[...s.autoDeadlines].sort((a,b)=>(a.status==='done')-(b.status==='done')||String(a.date).localeCompare(String(b.date)));
 let pending=list.filter(x=>x.status!=='done'),next=pending.find(x=>x.date>=dateKey());
 let year=new Date().getFullYear();
 let spent=s.expenses.filter(x=>macroForExpense(x)==='Auto'&&String(x.date||'').startsWith(String(year))).reduce((a,x)=>a+Number(x.amount||0),0);
 if(document.getElementById('autoSummary'))autoSummary.innerHTML=`<div class="summaryNumbers"><div><b>${pending.length}</b><span>scadenze aperte</span></div><div><b>${euro(spent)}</b><span>spesi quest’anno</span></div></div><p>${next?`La prossima scadenza è <strong>${esc(next.title)}</strong> il ${birthLabel(next.date)}.`:'Nessuna scadenza vicina.'}</p>`;
 autoDeadlineList.innerHTML=list.length?list.map(x=>`<div class="row ${x.status==='done'?'done':''} ${x.date<dateKey()&&x.status!=='done'?'overdue':''}"><span>${autoIcon(x.type)}</span><div class="grow"><b>${esc(x.title)}</b><div class="meta">${birthLabel(x.date)}${x.time?' · '+esc(x.time):''} · ${x.status==='done'?'Fatta':'Da fare'}${x.cost?` · ${euro(x.cost)}`:''}${x.km?` · ${Number(x.km).toLocaleString('it-IT')} km`:''}</div>${x.note?`<div class="meta">${esc(x.note)}</div>`:''}</div>${x.status!=='done'?`<button class="primary smallBtn" data-auto-done="${x.id}">✓ Fatto</button>`:''}<button class="editBtn" data-auto-edit="${x.id}">✎</button><button class="del" data-auto-del="${x.id}">✕</button></div>`).join(''):'<div class="friendlyEmpty"><b>Nessuna scadenza registrata</b><span>Per ora l’auto non richiede attenzione.</span></div>';
 autoDeadlineList.querySelectorAll('[data-auto-edit]').forEach(b=>b.onclick=()=>openAutoDeadline(b.dataset.autoEdit));
 autoDeadlineList.querySelectorAll('[data-auto-del]').forEach(b=>b.onclick=()=>{s.autoDeadlines=s.autoDeadlines.filter(x=>x.id!==b.dataset.autoDel);save();renderAuto()});
 autoDeadlineList.querySelectorAll('[data-auto-done]').forEach(b=>b.onclick=()=>{let x=s.autoDeadlines.find(v=>v.id===b.dataset.autoDone);if(!x)return;x.status='done';if(Number(x.cost||0)>0)ensureExpenseOnce('autoDeadline',x.id,x.title,x.cost,'Auto',x.date);save();renderAuto()});
 autoExpenseHistory.innerHTML=s.autoExpenses.length?[...s.autoExpenses].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,30).map(x=>`<div class="row"><span>${autoIcon(x.type)}</span><div class="grow"><b>${esc(x.type)}</b><div class="meta">${birthLabel(x.date)}${x.km?` · ${Number(x.km).toLocaleString('it-IT')} km`:''}${x.note?` · ${esc(x.note)}`:''}</div></div><b>${euro(x.amount)}</b><button class="del" data-auto-exp-del="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna spesa auto registrata.</div>';
 autoExpenseHistory.querySelectorAll('[data-auto-exp-del]').forEach(b=>b.onclick=()=>{let id=b.dataset.autoExpDel;s.autoExpenses=s.autoExpenses.filter(x=>x.id!==id);s.expenses=s.expenses.filter(x=>!(x.source==='autoExpense'&&x.sourceId===id));save();renderAuto()});
 if(!fuelDate.value)fuelDate.value=dateKey();if(!fuelTime.value)fuelTime.value=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})
}
addAutoDeadlineBtn.onclick=()=>openAutoDeadline();
autoDeadlineForm.onsubmit=e=>{
 e.preventDefault();
 let payload={type:autoDeadlineType.value,title:autoDeadlineTitle.value.trim(),date:autoDeadlineDate.value,time:autoDeadlineTime.value,cost:Number(autoDeadlineCost.value||0),km:Number(autoDeadlineKm.value||0),frequency:autoDeadlineFrequency.value,status:autoDeadlineStatus.value,reminderDays:Number(autoDeadlineReminder.value||0),notify:autoDeadlineNotify.value,note:autoDeadlineNote.value.trim()};
 let x=editingAutoDeadlineId?s.autoDeadlines.find(v=>v.id===editingAutoDeadlineId):null;
 if(x)Object.assign(x,payload);else{x={id:crypto.randomUUID(),...payload};s.autoDeadlines.push(x)}
 if(x.status==='done'&&Number(x.cost||0)>0)ensureExpenseOnce('autoDeadline',x.id,x.title,x.cost,'Auto',x.date);
 editingAutoDeadlineId=null;autoDeadlineDialog.close();save();renderAuto()
};
if(typeof customRecipeForm!=="undefined"&&customRecipeForm)customRecipeForm.onsubmit=e=>{
 e.preventDefault();
 const name=customRecipeName.value.trim();if(!name)return;
 const payload={id:crypto.randomUUID(),name,category:customRecipeCategory.value,time:customRecipeTime.value.trim(),ingredients:customRecipeIngredients.value.split(/\n+/).map(x=>x.trim()).filter(Boolean),steps:customRecipeSteps.value.split(/\n+/).map(x=>x.trim()).filter(Boolean),note:customRecipeNote.value.trim(),tags:[name.toLowerCase()],allergens:[]};
 s.customRecipes=s.customRecipes||[];
 const old=s.customRecipes.find(x=>x.name.toLowerCase()===name.toLowerCase());
 if(old)Object.assign(old,payload,{id:old.id});else s.customRecipes.unshift(payload);
 closeDialogSafe(document.getElementById('customRecipeDialog'));save();renderMenu();
};

fuelForm.onsubmit=e=>{
 e.preventDefault();let id=crypto.randomUUID(),amount=Number(fuelAmount.value||0),date=fuelDate.value||dateKey();let row={id,type:fuelType.value,amount,km:Number(fuelKm.value||0),note:fuelNote.value.trim(),date,time:fuelTime.value||''};s.autoExpenses.push(row);if(amount>0)ensureExpenseOnce('autoExpense',id,row.type,amount,'Auto',date);fuelForm.reset();fuelDate.value=dateKey();fuelTime.value=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});closeDialogSafe(document.getElementById('autoExpenseDialog'));save();renderAuto()
};


shopForm.onsubmit=e=>{e.preventDefault();s.shopping.push({id:crypto.randomUUID(),text:shopText.value.trim(),qty:shopQty.value.trim(),category:shopCat.value,url:shopUrl.value.trim(),expectedPrice:Number(shopExpected.value||0),actualPrice:0,done:false});shopForm.reset();save();renderShop()};
function renderShop(){
 let openShop=s.shopping.filter(x=>!x.done),expectedShop=openShop.reduce((a,x)=>a+Number(x.expectedPrice||0),0);
 if(document.getElementById('shopSummary'))shopSummary.innerHTML=`<div class="summaryNumbers"><div><b>${openShop.length}</b><span>${openShop.length===1?'cosa da comprare':'cose da comprare'}</span></div><div><b>${expectedShop?euro(expectedShop):'—'}</b><span>previsti</span></div></div><p>${openShop.length?`In lista ci sono soprattutto ${openShop.slice(0,3).map(x=>esc(x.text)).join(', ')}${openShop.length>3?'…':''}.`:'La lista è vuota: per ora non manca niente.'}</p>`;
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
function uiIconMarkup(name){return `<svg class="uiIcon" aria-hidden="true"><use href="icons.svg#icon-${name}"></use></svg>`}
function openDialogSafe(dialog){if(!dialog)return;try{if(typeof dialog.showModal==='function'){dialog.showModal();return}}catch(e){}dialog.classList.add('dialogFallbackOpen');dialog.setAttribute('open','')}
function closeDialogSafe(dialog){if(!dialog)return;try{if(typeof dialog.close==='function'){dialog.close();return}}catch(e){}dialog.classList.remove('dialogFallbackOpen');dialog.removeAttribute('open')}
document.addEventListener('click',e=>{const trigger=e.target.closest?.('[data-open-dialog]');if(!trigger)return;e.preventDefault();openDialogSafe(document.getElementById(trigger.dataset.openDialog))});
function ensureRecurring(){let k=monthKey(moneyDate()),sources=s.expenses.filter(x=>x.recurring&&!x.sourceId),existing=new Set(s.expenses.filter(x=>x.month===k&&x.sourceId).map(x=>x.sourceId));sources.forEach(x=>{if(x.month!==k&&!existing.has(x.id))s.expenses.push({...x,id:crypto.randomUUID(),month:k,sourceId:x.id,date:k+'-01'})})}
const MONEY_MACROS=[
 {id:'Casa',icon:'',color:'#6f9f72'},
 {id:'Spesa',icon:'',color:'#e1a34e'},
 {id:'Bollette',icon:'',color:'#7e8fb2'},
 {id:'Auto',icon:'',color:'#a77d5e'},
 {id:'Bambini',icon:'',color:'#e98e86'},
 {id:'Salute',icon:'',color:'#d86f6f'},
 {id:'Svago',icon:'',color:'#9a79b7'},
 {id:'Personali',icon:'',color:'#62a2a5'},
 {id:'Altro',icon:'',color:'#a7a7a7'}
];
function moneyMacroMeta(id){return MONEY_MACROS.find(x=>x.id===id)||MONEY_MACROS[MONEY_MACROS.length-1]}
function macroForExpense(x){
 if(x.person)return 'Personali';
 let c=String(x.category||x.personalCategory||'').toLowerCase();
 let n=String(x.name||'').toLowerCase();
 let source=String(x.source||'');
 if(source==='maintenance')return 'Casa';
 if(source==='autoExpense'||source==='autoDeadline')return 'Auto';
 if(source==='shopping'||source==='recipe'||source==='menu')return 'Spesa';
 if(source==='subscription'){
  if(c.includes('trasport'))return 'Auto';
  if(c.includes('stream')||n.includes('netflix')||n.includes('disney')||n.includes('spotify'))return 'Svago';
  return 'Bollette'
 }
 if(c.includes('casa')||c.includes('manut'))return 'Casa';
 if(c.includes('spesa')||c.includes('aliment')||c.includes('supermerc'))return 'Spesa';
 if(c.includes('bollett')||c.includes('uten')||c.includes('abbon'))return 'Bollette';
 if(c.includes('auto')||c.includes('benz')||c.includes('parchegg')||c.includes('pedagg'))return 'Auto';
 if(c.includes('bambin')||c.includes('pannolin')||c.includes('scuola'))return 'Bambini';
 if(c.includes('salut')||c.includes('farmac')||c.includes('medic'))return 'Salute';
 if(c.includes('svago')||c.includes('ristor')||c.includes('cinema')||c.includes('vacanz')||c.includes('stream'))return 'Svago';
 if(c.includes('personal')||c.includes('lavoro'))return 'Personali';
 if(c.includes('cane'))return 'Casa';
 return MONEY_MACROS.some(m=>m.id===x.category)?x.category:'Altro'
}
incomeForm.onsubmit=e=>{e.preventDefault();let d=moneyDate(),k=monthKey(d);s.incomes.push({id:crypto.randomUUID(),name:incomeName.value.trim(),amount:Number(incomeAmount.value),person:incomePerson.value,month:k,date:moneyOffset===0?dateKey():k+'-01'});incomeForm.reset();if(moneyIncomeDialog?.open)moneyIncomeDialog.close();save();renderMoney()};
savingsGoalForm.onsubmit=e=>{e.preventDefault();let k=monthKey(moneyDate());s.savingsGoals=s.savingsGoals||{};s.savingsGoals[k]=Number(savingsGoalInput.value||0);save();renderMoney()};
if(savingsProjectsForm)savingsProjectsForm.onsubmit=e=>{e.preventDefault();s.savingsProjects=s.savingsProjects||structuredClone(DEFAULT.savingsProjects);s.savingsProjects.vacation={label:'Vacanze',icon:'🏖️',active:vacationActive.checked,target:Number(vacationTarget.value||0),saved:Number(vacationSaved.value||0),note:vacationNote.value.trim()};s.savingsProjects.christmas={label:'Natale',icon:'🎄',active:christmasActive.checked,target:Number(christmasTarget.value||0),saved:Number(christmasSaved.value||0),note:christmasNote.value.trim()};save();renderMoney();renderHome()};
moneyForm.onsubmit=e=>{
 e.preventDefault();let d=moneyDate(),k=monthKey(d);
 s.expenses.push({id:crypto.randomUUID(),name:moneyName.value.trim(),amount:Number(moneyAmount.value),category:moneyCat.value,recurring:moneyRecurring.checked,month:k,date:moneyOffset===0?dateKey():k+'-01'});
 moneyName.value='';moneyAmount.value='';moneyRecurring.checked=false;if(moneyExpenseDialog?.open)moneyExpenseDialog.close();save();renderMoney()
};

const bankAddIncomeBtnEl=document.getElementById('bankAddIncomeBtn');
const bankAddExpenseBtnEl=document.getElementById('bankAddExpenseBtn');
const bankAddBillBtnEl=document.getElementById('bankAddBillBtn');
const bankEditGoalBtnEl=document.getElementById('bankEditGoalBtn');
const bankJarsBtnEl=document.getElementById('bankJarsBtn');
const bankSpendCardBtnEl=document.getElementById('bankSpendCardBtn');
const bankMovesBtnEl=document.getElementById('bankMovesBtn');
const bankBillsBtnEl=document.getElementById('bankBillsBtn');
const moneyIncomeDialogEl=document.getElementById('moneyIncomeDialog');
const moneyExpenseDialogEl=document.getElementById('moneyExpenseDialog');
const moneySavingsDialogEl=document.getElementById('moneySavingsDialog');
const moneySpendingDialogEl=document.getElementById('moneySpendingDialog');
const moneyMovesDialogEl=document.getElementById('moneyMovesDialog');
const moneyBillsDialogEl=document.getElementById('moneyBillsDialog');
if(bankAddIncomeBtnEl)bankAddIncomeBtnEl.addEventListener('click',()=>{incomeForm.reset();openDialogSafe(moneyIncomeDialogEl);setTimeout(()=>incomeName.focus(),40)});
if(bankAddExpenseBtnEl)bankAddExpenseBtnEl.addEventListener('click',()=>{moneyForm.reset();openDialogSafe(moneyExpenseDialogEl);setTimeout(()=>moneyName.focus(),40)});
if(bankEditGoalBtnEl)bankEditGoalBtnEl.addEventListener('click',()=>openDialogSafe(moneySavingsDialogEl));
if(bankJarsBtnEl)bankJarsBtnEl.addEventListener('click',()=>openDialogSafe(moneySavingsDialogEl));
if(bankSpendCardBtnEl)bankSpendCardBtnEl.addEventListener('click',()=>openDialogSafe(moneySpendingDialogEl));
if(bankMovesBtnEl)bankMovesBtnEl.addEventListener('click',()=>openDialogSafe(moneyMovesDialogEl));
if(bankBillsBtnEl)bankBillsBtnEl.addEventListener('click',()=>openDialogSafe(moneyBillsDialogEl));
if(bankAddBillBtnEl)bankAddBillBtnEl.addEventListener('click',()=>{subDue.value=dateKey();openDialogSafe(subscriptionDialog)});
function renderMoney(){
 ensureRecurring();
 let d=moneyDate(),k=monthKey(d),all=s.expenses.filter(x=>x.month===k);
 let tot=all.reduce((q,x)=>q+Number(x.amount||0),0);
 let fixed=all.filter(x=>x.recurring).reduce((q,x)=>q+Number(x.amount||0),0);
 let incomeRows=s.incomes.filter(x=>x.month===k),incomeTot=incomeRows.reduce((q,x)=>q+Number(x.amount||0),0),saved=incomeTot-tot,goal=Number(s.savingsGoals?.[k]??s.savingsGoal??0);
 let prevD=new Date(d);prevD.setMonth(prevD.getMonth()-1);let prevK=monthKey(prevD),prevAll=s.expenses.filter(x=>x.month===prevK),prevTot=prevAll.reduce((q,x)=>q+Number(x.amount||0),0),prevIncome=s.incomes.filter(x=>x.month===prevK).reduce((q,x)=>q+Number(x.amount||0),0),prevSaved=prevIncome-prevTot;

 moneyMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(d);
 moneyNext.disabled=moneyOffset>=0;savingsGoalInput.value=goal||'';
 const incomeBySource={jj:0,kiki:0,family:0};incomeRows.forEach(x=>{let key=['jj','kiki','family'].includes(x.person)?x.person:'family';incomeBySource[key]+=Number(x.amount||0)});
 if(bankIncomeTotal)bankIncomeTotal.textContent=euro(incomeTot);
 if(bankSourceBreakdown)bankSourceBreakdown.innerHTML=`<span><b>JJ</b>${euro(incomeBySource.jj)}</span><span><b>Kiki</b>${euro(incomeBySource.kiki)}</span><span><b>Famiglia</b>${euro(incomeBySource.family)}</span>`;
 const vp=s.savingsProjects?.vacation||DEFAULT.savingsProjects.vacation,cp=s.savingsProjects?.christmas||DEFAULT.savingsProjects.christmas;
 if(vacationActive){vacationActive.checked=!!vp.active;vacationTarget.value=vp.target||'';vacationSaved.value=vp.saved||'';vacationNote.value=vp.note||''}
 if(christmasActive){christmasActive.checked=!!cp.active;christmasTarget.value=cp.target||'';christmasSaved.value=cp.saved||'';christmasNote.value=cp.note||''}
 if(savingsProjectsPreview)savingsProjectsPreview.innerHTML=[vp,cp].map(p=>{let target=Number(p.target||0),savedP=Number(p.saved||0),pctP=target>0?Math.max(0,Math.min(100,savedP/target*100)):0;return `<div class="savingProjectSummary ${p.active?'active':''}"><div><span class="savingSprite">${uiIconMarkup(p.label==='Vacanze'?'sun':'tree')}</span><div><b>${p.label}</b><small>${p.active?'Attivo':'In pausa'}${p.note?' · '+esc(p.note):''}</small></div><strong>${euro(savedP)}${target>0?' / '+euro(target):''}</strong></div><div class="progressTrack"><i style="width:${pctP}%"></i></div></div>`}).join('');
 savingsResult.textContent=incomeTot>0?euro(saved):'—';
 if(bankExpenseTotal)bankExpenseTotal.textContent=euro(tot);
 if(bankGoalQuickText){
  if(!incomeTot)bankGoalQuickText.textContent=goal?`Questo mese vogliamo risparmiare ${euro(goal)}`:'Decidi quanto vuoi risparmiare questo mese';
  else if(goal<=0)bankGoalQuickText.textContent='Decidi quanto vuoi risparmiare questo mese';
  else if(saved>=goal)bankGoalQuickText.textContent=`Volevamo risparmiare ${euro(goal)} · superato ✓`;
  else bankGoalQuickText.textContent=`Vogliamo risparmiare ${euro(goal)} · mancano ${euro(Math.max(0,goal-saved))}`;
 }
 let pct=incomeTot>0&&goal>0?Math.max(0,Math.min(100,saved/goal*100)):0;savingsProgressBar.style.width=pct+'%';
 if(!incomeTot)savingsReportText.textContent='Aggiungi le entrate del mese per calcolare il risparmio reale.';
 else if(goal<=0)savingsReportText.textContent=`Avete messo da parte ${euro(saved)}. Decidi quanto vuoi risparmiare questo mese.`;
 else if(saved>=goal)savingsReportText.textContent=`Avete messo da parte ${euro(saved)}: ${euro(Math.max(0,saved-goal))} in più di quanto avevate deciso.`;
 else savingsReportText.textContent=`Avete messo da parte ${euro(saved)}. Mancano ${euro(Math.max(0,goal-saved))} per arrivare a ${euro(goal)}.`;
 let expenseDiff=tot-prevTot,saveDiff=(incomeTot&&prevIncome)?saved-prevSaved:null,currentByMacro={},prevByMacro={};
 MONEY_MACROS.forEach(m=>{currentByMacro[m.id]=0;prevByMacro[m.id]=0});
 all.forEach(x=>currentByMacro[macroForExpense(x)]+=Number(x.amount||0));
 prevAll.forEach(x=>prevByMacro[macroForExpense(x)]+=Number(x.amount||0));
 let biggest=MONEY_MACROS.map(m=>({id:m.id,diff:currentByMacro[m.id]-prevByMacro[m.id],icon:m.icon})).sort((a,b)=>b.diff-a.diff)[0];
 if(saveDiff!==null)savingsCompare.innerHTML=`<span>${saveDiff>=0?'🌱':'↘️'} ${euro(Math.abs(saveDiff))} ${saveDiff>=0?'in più':'in meno'} rispetto al mese scorso</span>`;
 else if(prevAll.length||prevIncome)savingsCompare.innerHTML=`<span>${expenseDiff>0?'🔺':expenseDiff<0?'🔻':'•'} Spese ${expenseDiff===0?'uguali al mese scorso':`${euro(Math.abs(expenseDiff))} ${expenseDiff>0?'in più':'in meno'} del mese scorso`}</span>`;
 else savingsCompare.innerHTML='';
 if(bankSpendingCompare){
  const pieces=[];
  if(prevAll.length)pieces.push(expenseDiff===0?'Le spese sono uguali al mese scorso.':`Questo mese avete speso ${euro(Math.abs(expenseDiff))} ${expenseDiff>0?'in più':'in meno'} rispetto al mese scorso.`);
  if(biggest&&biggest.diff>0)pieces.push(`${biggest.icon} ${biggest.id} è aumentata di ${euro(biggest.diff)}.`);
  bankSpendingCompare.textContent=pieces.join(' ')||'Qui vedrai come si dividono le spese del mese.';
 }
 incomeList.innerHTML=incomeRows.length?incomeRows.map(x=>`<div class="row"><span>＋</span><div class="grow"><b>${esc(x.name)}</b><div class="meta">${x.person==='family'?'Famiglia':personName(x.person)} · Fagiolini Bank</div></div><b>${euro(x.amount)}</b><button class="del" data-income-del="${x.id}">✕</button></div>`).join(''):'<div class="friendlyEmpty"><b>Nessuna entrata registrata</b><span>Aggiungile per calcolare il risparmio reale.</span></div>';
 incomeList.querySelectorAll('[data-income-del]').forEach(b=>b.onclick=()=>{s.incomes=s.incomes.filter(x=>x.id!==b.dataset.incomeDel);save();renderMoney()});

 moneyStats.innerHTML=[
  ['Fagiolini Bank',euro(incomeTot)],
  ['Spese',euro(tot)],
  ['Obiettivo',goal?euro(goal):'Da impostare'],
  ['Ricorrenti',euro(fixed)]
 ].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');

 let totals={};MONEY_MACROS.forEach(m=>totals[m.id]=0);
 all.forEach(x=>totals[macroForExpense(x)]=(totals[macroForExpense(x)]||0)+Number(x.amount||0));
 if(bankSpendSummary){
  const top=MONEY_MACROS.filter(m=>totals[m.id]>0).sort((a,b)=>totals[b.id]-totals[a.id]).slice(0,2);
  bankSpendSummary.textContent=top.length?top.map(m=>`${m.id} ${euro(totals[m.id])}`).join(' · '):'Nessuna spesa registrata';
 }
 if(bankJarsSummary){
  const activeProjects=[vp,cp].filter(p=>p.active);
  bankJarsSummary.textContent=activeProjects.length?activeProjects.map(p=>`${p.label} ${euro(p.saved||0)}${Number(p.target||0)>0?' / '+euro(p.target):''}`).join(' · '):'Vacanze e Natale sono in pausa';
 }
 if(bankMovesSummary){
  const recent=[...incomeRows.map(x=>({...x,_kind:'in'})),...all.map(x=>({...x,_kind:'out'}))].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,2);
  bankMovesSummary.textContent=recent.length?recent.map(x=>`${x._kind==='in'?'＋':'−'} ${x.name} ${euro(x.amount)}`).join(' · '):'Nessun movimento questo mese';
 }
 renderMoneyPie(totals,tot);

 let a=moneyMacroFilter?all.filter(x=>macroForExpense(x)===moneyMacroFilter):all;
 moneyListTitle.textContent=moneyMacroFilter?`Spese · ${moneyMacroFilter}`:'Le spese di questo mese';
 moneyFilterLabel.textContent=moneyMacroFilter?`Stai guardando: ${moneyMacroMeta(moneyMacroFilter).icon} ${moneyMacroFilter}`:'Tocca una categoria per vedere solo quelle spese.';

 moneyList.innerHTML=a.length?a.sort((x,y)=>String(y.date||'').localeCompare(String(x.date||''))).map(x=>{
  let who=x.person?` · ${personName(x.person)}`:'';
  let cat=x.personalCategory||x.category||'Altro';
  let macro=macroForExpense(x),meta=moneyMacroMeta(macro);
  return `<div class="row">
   <span>${meta.icon}</span>
   <div class="grow"><b>${esc(x.name)}</b><div class="meta">${esc(cat)} · <strong>${macro}</strong>${who}${x.recurring?' · mensile':''}</div></div>
   <b>${euro(x.amount)}</b>
   <button class="del" data-exp="${x.id}">✕</button>
  </div>`
 }).join(''):'<div class="muted">Nessuna spesa in questa categoria.</div>';

 moneyList.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{
  s.expenses=s.expenses.filter(x=>x.id!==b.dataset.exp);save();renderMoney()
 });

 moneyCategories.innerHTML=MONEY_MACROS.filter(m=>totals[m.id]>0).sort((a,b)=>totals[b.id]-totals[a.id]).map(m=>{
  let pct=tot?Math.round(totals[m.id]/tot*100):0;
  return `<button class="moneyCategory smart ${moneyMacroFilter===m.id?'active':''}" data-money-macro="${m.id}"><span>${m.icon} ${m.id}<small>${pct}%</small></span><b>${euro(totals[m.id])}</b></button>`
 }).join('')||'<div class="muted">Nessun dato.</div>';
 moneyCategories.querySelectorAll('[data-money-macro]').forEach(b=>b.onclick=()=>{moneyMacroFilter=b.dataset.moneyMacro;renderMoney()})
}
function renderMoneyPie(totals,total){
 moneyPieTotal.textContent=euro(total);
 let active=MONEY_MACROS.filter(m=>totals[m.id]>0);
 if(!total||!active.length){
  moneyPie.style.background='#eee5da';
  moneyMacroLegend.innerHTML='<div class="muted">Registra una spesa per vedere il grafico.</div>';
  return
 }
 let cursor=0,segments=[];
 active.forEach(m=>{
  let start=cursor,end=cursor+(totals[m.id]/total*100);segments.push(`${m.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);cursor=end
 });
 moneyPie.style.background=`conic-gradient(${segments.join(',')})`;
 moneyMacroLegend.innerHTML=active.sort((a,b)=>totals[b.id]-totals[a.id]).map(m=>{
  let pct=Math.round(totals[m.id]/total*100);
  return `<button class="macroLegendItem ${moneyMacroFilter===m.id?'active':''}" data-pie-macro="${m.id}"><i style="background:${m.color}"></i><span><b>${m.icon} ${m.id}</b><small>${euro(totals[m.id])} · ${pct}%</small></span></button>`
 }).join('');
 moneyMacroLegend.querySelectorAll('[data-pie-macro]').forEach(b=>b.onclick=()=>{moneyMacroFilter=b.dataset.pieMacro;renderMoney()})
}
moneyClearFilter.onclick=()=>{moneyMacroFilter=null;renderMoney()};
moneyPrev.onclick=()=>{moneyOffset--;moneyMacroFilter=null;renderMoney()};
moneyNext.onclick=()=>{if(moneyOffset<0){moneyOffset++;moneyMacroFilter=null;renderMoney()}};


function renderSubscriptions(){
 let a=[...s.subscriptions].sort((x,y)=>x.dueDate.localeCompare(y.dueDate));
 let soon=a.filter(x=>{let d=Math.ceil((dateObj(x.dueDate)-dateObj(dateKey()))/86400000);return d>=0&&d<=7});
 if(bankBillsSummary){
  const next=a.find(x=>x.dueDate>=dateKey())||a[0];
  bankBillsSummary.textContent=next?`${next.name} · ${birthLabel(next.dueDate)} · ${euro(next.amount)}`:'Nessuna bolletta in arrivo';
 }
 subscriptionStats.innerHTML=`<div class="stat"><span>ATTIVE</span><b>${a.length}</b></div><div class="stat"><span>ENTRO 7 GIORNI</span><b>${soon.length}</b></div>`;
 subscriptionList.innerHTML=a.length?a.map(x=>`<div class="row ${x.dueDate<dateKey()?'overdue':''}"><span>${x.category==='Trasporti'?'🚆':'💳'}</span><div class="grow"><b>${esc(x.name)}</b><div class="meta">${personName(x.owner)} · ${birthLabel(x.dueDate)} · ${esc(x.frequency)} · 🔔 ${x.reminderDays}g</div></div><b>${euro(x.amount)}</b><button class="primary smallBtn" data-subpay="${x.id}">Pagata</button><button class="del" data-subdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna scadenza registrata.</div>';
 subscriptionList.querySelectorAll('[data-subpay]').forEach(b=>b.onclick=()=>{let x=s.subscriptions.find(v=>v.id===b.dataset.subpay);s.expenses.push({id:crypto.randomUUID(),name:x.name,amount:Number(x.amount),category:x.category,person:x.owner==='family'?null:x.owner,month:monthKey(new Date()),date:dateKey(),recurring:false,source:'subscription',sourceId:x.id});if(x.frequency==='once')s.subscriptions=s.subscriptions.filter(v=>v.id!==x.id);else{x.lastPaid=dateKey();x.dueDate=nextSubDate(x.dueDate,x.frequency)}save();renderMoney();renderSubscriptions()});
 subscriptionList.querySelectorAll('[data-subdel]').forEach(b=>b.onclick=()=>{s.subscriptions=s.subscriptions.filter(x=>x.id!==b.dataset.subdel);save();renderSubscriptions()})
}
addSubscriptionBtn.onclick=()=>{subDue.value=dateKey();subscriptionDialog.showModal()};
subscriptionForm.onsubmit=e=>{e.preventDefault();s.subscriptions.push({id:crypto.randomUUID(),name:subName.value.trim(),amount:Number(subAmount.value),owner:subOwner.value,category:subCategory.value,dueDate:subDue.value,frequency:subFreq.value,reminderDays:Number(subReminder.value),notify:subNotify.value});subscriptionForm.reset();subscriptionDialog.close();save();renderMoney();renderSubscriptions()};
recipeToShop.onclick=()=>{
 let r=recipeDetails(recipeDialog.dataset.recipe);
 if(r){
  r.ingredients.forEach(item=>{
   let name,qty='',unit='';if(Array.isArray(item))[name,qty,unit]=item;else name=String(item);
   let qtyText=qty?`${qty}${unit?` ${unit}`:''}`:'';
   let existing=s.shopping.find(x=>x.text.toLowerCase()===String(name).toLowerCase()&&!x.done);
   if(existing){
    if(qtyText&&!existing.qty)existing.qty=qtyText
   }else{
    s.shopping.push({id:crypto.randomUUID(),text:name,qty:qtyText,category:'Alimentari',url:'',expectedPrice:0,actualPrice:0,done:false,source:'recipe'})
   }
  })
 }
 recipeDialog.close();save();go('shop')
};
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
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'){if(await checkSessionExpiry(true))return;if(cloudReady)pullCloudState(true)}});

resetBtn.onclick=()=>{if(confirm('Vuoi davvero azzerare i dati di Fagiolini? Se sei connesso, il reset verrà sincronizzato anche sugli altri dispositivi.')){localStorage.removeItem(KEY);s=structuredClone(DEFAULT);save();go('home')}};
function renderAll(){renderHome();if(document.getElementById('today').classList.contains('on'))renderToday();if(document.getElementById('waste').classList.contains('on'))renderWaste();if(document.getElementById('organize').classList.contains('on'))renderOrganize();if(person.classList.contains('on'))renderPerson();if(adult.classList.contains('on'))renderAdult();if(menu.classList.contains('on'))renderMenu();if(profiles.classList.contains('on'))renderProfiles();if(health.classList.contains('on'))renderHealth();if(calendar.classList.contains('on'))renderCalendar();if(house.classList.contains('on'))renderHouse();if(shop.classList.contains('on'))renderShop();if(['money','money-spending','money-savings','money-bills','money-moves'].some(id=>document.getElementById(id)?.classList.contains('on'))){renderMoney();renderSubscriptions()}if(document.getElementById('maintenance').classList.contains('on'))renderMaintenance();if(document.getElementById('auto').classList.contains('on'))renderAuto();if(document.getElementById('reminders').classList.contains('on'))renderReminders()}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
renderHome();fillHealthPeople();startSessionActivityTracking();bootCloud();


// V11.1 — Organizza hub panels
function closeOrganizePanels(){
  ['organizePanelBirthdays','organizePanelTelegram','organizePanelSettings'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.hidden=true;
  });
}
document.querySelectorAll('[data-organize-panel]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    closeOrganizePanels();
    const map={birthdays:'organizePanelBirthdays',telegram:'organizePanelTelegram',settings:'organizePanelSettings'};
    const panel=document.getElementById(map[btn.dataset.organizePanel]);
    if(panel){panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});
document.querySelectorAll('[data-close-organize-panel]').forEach(btn=>{
  btn.addEventListener('click',()=>{closeOrganizePanels();document.querySelector('#organize .organizeGridSecondary')?.scrollIntoView({behavior:'smooth',block:'center'});});
});
