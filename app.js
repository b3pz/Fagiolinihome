const URL='https://xkiruygivdkqgbmldtow.supabase.co';
const KEY='sb_publishable_p9dN7dsr55WqxH0kS-QX0g_hQY_uxqc';
const sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});
const LS='familyHubV2';
const ADULTS={jj:{name:'JJ',emoji:'👨',birthDate:'1991-05-31'},kiki:{name:'Kiki',emoji:'👩',birthDate:'1990-08-24'}};
const META={pappa:['🍼','Pappa'],pannolino:['🚼','Pannolino'],cacca:['💩','Cacca'],nanna:['😴','Nanna'],bagnetto:['🛁','Bagnetto'],traversina:['🐾','Traversina'],pipi:['💧','Pipì'],farmaco:['💊','Farmaco'],toeletta:['🛁','Toeletta']};
const DEFAULT={children:[{id:'caty',name:'Caty',emoji:'👧',type:'child',birthDate:'2024-12-10'},{id:'kiko',name:'Kiko',emoji:'👶',type:'child',birthDate:'2026-02-11'},{id:'astro',name:'Astro',emoji:'🐶',type:'dog',birthDate:'2025-10-19'}],events:[],shopping:[],menu:{},menuBackup:null,health:[],expenses:[],subscriptions:[],routines:[{id:'sweep',name:'Spazzare',emoji:'🧹',everyDays:2,owner:'family',lastDone:null},{id:'mop',name:'Lavare pavimenti',emoji:'🧽',everyDays:7,owner:'family',lastDone:null},{id:'sheets',name:'Cambio lenzuola',emoji:'🛏️',everyDays:7,owner:'family',lastDone:null},{id:'bath',name:'Pulizia bagno',emoji:'🚿',everyDays:7,owner:'family',lastDone:null},{id:'astro-pad',name:'Cambiare traversina Astro',emoji:'🐶',everyDays:1,owner:'family',lastDone:null}],laundry:{step:0,updatedAt:null},profiles:{caty:{likes:'',dislikes:'',allergens:''},kiko:{likes:'',dislikes:'',allergens:''},jj:{likes:'',dislikes:'',allergens:''},kiki:{likes:'',dislikes:'',allergens:''}},recipes:{},telegram:{jjChatId:'',kikiChatId:''}};
const DOM={};
const loginScreen=document.getElementById('loginScreen');
const loginForm=document.getElementById('loginForm');
const loginEmail=document.getElementById('loginEmail');
const loginPassword=document.getElementById('loginPassword');
const loginBtn=document.getElementById('loginBtn');
const loginClose=document.getElementById('loginClose');
const loginMessage=document.getElementById('loginMessage');
const pageTitle=document.getElementById('pageTitle');
const todayLabel=document.getElementById('todayLabel');
const syncStatus=document.getElementById('syncStatus');
const accountBtn=document.getElementById('accountBtn');
const home=document.getElementById('home');
const peopleCards=document.getElementById('peopleCards');
const quickRecord=document.getElementById('quickRecord');
const dashEvents=document.getElementById('dashEvents');
const dashRoutines=document.getElementById('dashRoutines');
const dashDue=document.getElementById('dashDue');
const homeFeed=document.getElementById('homeFeed');
const menuToday=document.getElementById('menuToday');
const person=document.getElementById('person');
const personTitle=document.getElementById('personTitle');
const personStats=document.getElementById('personStats');
const personActions=document.getElementById('personActions');
const dayPrev=document.getElementById('dayPrev');
const dayLabel=document.getElementById('dayLabel');
const dayNext=document.getElementById('dayNext');
const personTimeline=document.getElementById('personTimeline');
const adult=document.getElementById('adult');
const adultTitle=document.getElementById('adultTitle');
const adultSummary=document.getElementById('adultSummary');
const adultExpenseTotal=document.getElementById('adultExpenseTotal');
const adultExpenseForm=document.getElementById('adultExpenseForm');
const adultExpenseName=document.getElementById('adultExpenseName');
const adultExpenseAmount=document.getElementById('adultExpenseAmount');
const adultExpenseCategory=document.getElementById('adultExpenseCategory');
const adultExpenseBreakdown=document.getElementById('adultExpenseBreakdown');
const adultExpenseList=document.getElementById('adultExpenseList');
const adultUpcoming=document.getElementById('adultUpcoming');
const menu=document.getElementById('menu');
const generateMenu=document.getElementById('generateMenu');
const undoMenu=document.getElementById('undoMenu');
const menuWeek=document.getElementById('menuWeek');
const profiles=document.getElementById('profiles');
const profileForms=document.getElementById('profileForms');
const health=document.getElementById('health');
const visitForm=document.getElementById('visitForm');
const visitPerson=document.getElementById('visitPerson');
const visitTitle=document.getElementById('visitTitle');
const visitDate=document.getElementById('visitDate');
const visitTime=document.getElementById('visitTime');
const visitNote=document.getElementById('visitNote');
const visitReminder=document.getElementById('visitReminder');
const visitNotify=document.getElementById('visitNotify');
const medicineForm=document.getElementById('medicineForm');
const medPerson=document.getElementById('medPerson');
const medName=document.getElementById('medName');
const medDose=document.getElementById('medDose');
const medDate=document.getElementById('medDate');
const medTime=document.getElementById('medTime');
const medNote=document.getElementById('medNote');
const medReminder=document.getElementById('medReminder');
const medNotify=document.getElementById('medNotify');
const healthList=document.getElementById('healthList');
const calendar=document.getElementById('calendar');
const calPrev=document.getElementById('calPrev');
const calMonth=document.getElementById('calMonth');
const calNext=document.getElementById('calNext');
const calendarGrid=document.getElementById('calendarGrid');
const selectedDateTitle=document.getElementById('selectedDateTitle');
const calendarDetails=document.getElementById('calendarDetails');
const house=document.getElementById('house');
const laundryStatus=document.getElementById('laundryStatus');
const laundrySteps=document.getElementById('laundrySteps');
const laundryNext=document.getElementById('laundryNext');
const laundryReset=document.getElementById('laundryReset');
const addRoutine=document.getElementById('addRoutine');
const routineList=document.getElementById('routineList');
const shop=document.getElementById('shop');
const shopForm=document.getElementById('shopForm');
const shopName=document.getElementById('shopName');
const shopQty=document.getElementById('shopQty');
const shopCategory=document.getElementById('shopCategory');
const shopList=document.getElementById('shopList');
const money=document.getElementById('money');
const moneyPrev=document.getElementById('moneyPrev');
const moneyMonth=document.getElementById('moneyMonth');
const moneyNext=document.getElementById('moneyNext');
const moneyStats=document.getElementById('moneyStats');
const moneyForm=document.getElementById('moneyForm');
const moneyName=document.getElementById('moneyName');
const moneyAmount=document.getElementById('moneyAmount');
const moneyCategory=document.getElementById('moneyCategory');
const moneyRecurring=document.getElementById('moneyRecurring');
const moneyList=document.getElementById('moneyList');
const moneyCategories=document.getElementById('moneyCategories');
const addSubscription=document.getElementById('addSubscription');
const subscriptionStats=document.getElementById('subscriptionStats');
const subscriptionList=document.getElementById('subscriptionList');
const reminders=document.getElementById('reminders');
const reminderList=document.getElementById('reminderList');
const navQuick=document.getElementById('navQuick');
const quickDialog=document.getElementById('quickDialog');
const quickPeople=document.getElementById('quickPeople');
const quickActions=document.getElementById('quickActions');
const poopDialog=document.getElementById('poopDialog');
const poopForm=document.getElementById('poopForm');
const poopType=document.getElementById('poopType');
const poopNote=document.getElementById('poopNote');
const sleepDialog=document.getElementById('sleepDialog');
const sleepForm=document.getElementById('sleepForm');
const sleepText=document.getElementById('sleepText');
const routineDialog=document.getElementById('routineDialog');
const routineForm=document.getElementById('routineForm');
const routineName=document.getElementById('routineName');
const routineEvery=document.getElementById('routineEvery');
const routineOwner=document.getElementById('routineOwner');
const subscriptionDialog=document.getElementById('subscriptionDialog');
const subscriptionForm=document.getElementById('subscriptionForm');
const subName=document.getElementById('subName');
const subAmount=document.getElementById('subAmount');
const subOwner=document.getElementById('subOwner');
const subCategory=document.getElementById('subCategory');
const subDue=document.getElementById('subDue');
const subFrequency=document.getElementById('subFrequency');
const subReminder=document.getElementById('subReminder');
const subNotify=document.getElementById('subNotify');
const recipeDialog=document.getElementById('recipeDialog');
const recipeTitle=document.getElementById('recipeTitle');
const recipeBody=document.getElementById('recipeBody');
const recipeShopping=document.getElementById('recipeShopping');
const accountDialog=document.getElementById('accountDialog');
const accountInfo=document.getElementById('accountInfo');
const syncNow=document.getElementById('syncNow');
const logoutBtn=document.getElementById('logoutBtn');

let s=loadLocal(),session=null,familyId=null,memberName='',current='caty',currentAdult='jj',dayOffset=0,quickPerson='caty',pendingPerson='caty',moneyOffset=0,calOffset=0,selectedDate=dateKey(),cloudReady=false,poll=null,lastUpdated=null;

function loadLocal(){try{return normalize(JSON.parse(localStorage.getItem(LS)||'{}'))}catch{return structuredClone(DEFAULT)}}
function normalize(d){let o={...structuredClone(DEFAULT),...(d||{})};o.children=DEFAULT.children;o.events=Array.isArray(o.events)?o.events:[];o.shopping=Array.isArray(o.shopping)?o.shopping:[];o.health=Array.isArray(o.health)?o.health:[];o.expenses=Array.isArray(o.expenses)?o.expenses:[];o.subscriptions=Array.isArray(o.subscriptions)?o.subscriptions:[];o.routines=Array.isArray(o.routines)?o.routines:structuredClone(DEFAULT.routines);o.laundry=o.laundry||{step:0};o.menu=o.menu||{};o.profiles={...DEFAULT.profiles,...(o.profiles||{})};o.recipes=o.recipes||{};return o}
function save(){localStorage.setItem(LS,JSON.stringify(s));renderAll();if(cloudReady)uploadSoon()}
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dateObj(k){let [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d,12)}
function longDate(d=new Date()){return new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(d)}
function birthLabel(k){return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'}).format(dateObj(k))}
function age(k){let b=dateObj(k),n=new Date(),m=(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth()-(n.getDate()<b.getDate()?1:0);return m<24?`${m} mesi`:`${Math.floor(m/12)} anni`}
function timeLabel(i){return new Date(i).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function euro(v){return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(v)||0)}
function monthKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function personName(id){return ({caty:'Caty',kiko:'Kiko',astro:'Astro',jj:'JJ',kiki:'Kiki',family:'Famiglia'})[id]||id}
function events(id,d=new Date()){let k=dateKey(d);return s.events.filter(e=>e.childId===id&&dateKey(new Date(e.at))===k).sort((a,b)=>new Date(b.at)-new Date(a.at))}
function count(id,t,d=new Date()){return events(id,d).filter(e=>e.type===t).length}
function sleepActive(id){return [...s.events].reverse().find(e=>e.childId===id&&e.type==='nanna'&&!e.endAt)}
function sleepMin(id,d=new Date()){let k=dateKey(d),tot=0;s.events.filter(e=>e.childId===id&&e.type==='nanna'&&dateKey(new Date(e.at))===k).forEach(e=>tot+=Math.max(0,((e.endAt?new Date(e.endAt):new Date())-new Date(e.at))/60000));return Math.round(tot)}
function duration(m){let h=Math.floor(m/60),r=m%60;return h?`${h}h${r?' '+r+'m':''}`:`${r}m`}
function ownerLabel(x){return x==='jj'?'JJ':x==='kiki'?'Kiki':'Famiglia'}
function daysBetween(a,b){return Math.floor((dateObj(b)-dateObj(a))/86400000)}
function routineDue(r){return !r.lastDone||daysBetween(r.lastDone,dateKey())>=Number(r.everyDays||1)}
function dueSoon(x,n=7){let d=Math.ceil((dateObj(x.dueDate)-dateObj(dateKey()))/86400000);return d>=0&&d<=n}

function go(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));const target=document.getElementById(id);if(!target)return;target.classList.add('on');pageTitle.textContent={home:'La nostra giornata',person:'Registro',adult:'Noi',menu:'Menu',profiles:'Profili alimentari',health:'Salute',calendar:'Calendario',house:'Routine casa',shop:'Spesa',money:'Soldi',reminders:'Reminder'}[id]||'Fagiolini';if(id==='home')renderHome();if(id==='person')renderPerson();if(id==='adult')renderAdult();if(id==='menu')renderMenu();if(id==='profiles')renderProfiles();if(id==='health')renderHealth();if(id==='calendar')renderCalendar();if(id==='house')renderHouse();if(id==='shop')renderShop();if(id==='money')renderMoney();if(id==='reminders')renderReminders();scrollTo(0,0)}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());

function renderHome(){todayLabel.textContent=longDate();peopleCards.innerHTML=s.children.map(c=>c.type==='dog'?`<button class="personCard pet" data-person="${c.id}"><i>${c.emoji}</i><b>${c.name}</b><span>🎂 ${age(c.birthDate)}<br>💩 ${count(c.id,'cacca')} · 🐾 ${count(c.id,'traversina')}</span></button>`:`<button class="personCard" data-person="${c.id}"><i>${c.emoji}</i><b>${c.name}</b><span>🎂 ${age(c.birthDate)}<br>💩 ${count(c.id,'cacca')} · 🍼 ${count(c.id,'pappa')} · 😴 ${duration(sleepMin(c.id))}</span></button>`).join('');peopleCards.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{current=b.dataset.person;dayOffset=0;go('person')});document.querySelectorAll('[data-adult]').forEach(b=>b.onclick=()=>{currentAdult=b.dataset.adult;go('adult')});
let h=s.health.filter(x=>x.date===dateKey()),r=s.routines.filter(routineDue),d=s.subscriptions.filter(x=>dueSoon(x));dashEvents.textContent=`${h.length} impegni`;dashRoutines.textContent=`${r.length} da fare`;dashDue.textContent=`${d.length} vicine`;let feed=[];h.forEach(x=>feed.push(`<div class="row"><span>${x.kind==='visit'?'🩺':'💊'}</span><div class="grow"><b>${esc(x.title)}</b><div class="meta">${personName(x.person)}${x.time?' · '+x.time:''}</div></div></div>`));r.slice(0,2).forEach(x=>feed.push(`<div class="row"><span>${x.emoji}</span><div class="grow"><b>${esc(x.name)}</b><div class="meta">Routine da fare</div></div></div>`));d.slice(0,2).forEach(x=>feed.push(`<div class="row"><span>⏰</span><div class="grow"><b>${esc(x.name)}</b><div class="meta">${euro(x.amount)} · ${birthLabel(x.dueDate)}</div></div></div>`));homeFeed.innerHTML=feed.join('')||'<div class="muted">Niente di urgente oggi.</div>';let m=s.menu[dateKey()]||{};menuToday.innerHTML=`<div class="mealBox"><small>🍝 PRANZO</small><b>${esc(m.lunch||'Non impostato')}</b></div><div class="mealBox"><small>🌙 CENA</small><b>${esc(m.dinner||'Non impostata')}</b></div>`}

function actionKeys(c){return c.type==='dog'?['pappa','traversina','cacca','pipi','farmaco','toeletta']:['pappa','pannolino','cacca','nanna','bagnetto']}
function icon(t,id){return t==='pappa'&&id==='astro'?'🍽️':META[t]?.[0]||'•'}
function renderPerson(){let c=s.children.find(x=>x.id===current);personTitle.textContent=`${c.emoji} ${c.name}`;personStats.innerHTML=(c.type==='dog'?[['💩 Cacche',count(c.id,'cacca')],['🐾 Traversine',count(c.id,'traversina')],['🍽️ Pappe',count(c.id,'pappa')],['💧 Pipì',count(c.id,'pipi')]]:[['💩 Cacche',count(c.id,'cacca')],['🚼 Pannolini',count(c.id,'pannolino')],['🍼 Pappe',count(c.id,'pappa')],['😴 Sonno',duration(sleepMin(c.id))]]).map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');personActions.innerHTML=actionKeys(c).map(k=>`<button data-action="${k}">${icon(k,c.id)}<small>${META[k][1]}</small></button>`).join('');personActions.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>handleAction(current,b.dataset.action));let d=new Date();d.setDate(d.getDate()+dayOffset);dayLabel.textContent=dayOffset===0?'Oggi':longDate(d);dayNext.disabled=dayOffset>=0;let a=events(current,d);personTimeline.innerHTML=a.length?a.map(e=>`<div class="row"><b>${timeLabel(e.at)}</b><span>${icon(e.type,current)}</span><div class="grow"><b>${META[e.type]?.[1]||e.type}</b><div class="meta">${e.type==='nanna'?(e.endAt?'Fine '+timeLabel(e.endAt):'In corso'):esc(e.note||'')}</div></div><button class="del" data-evdel="${e.id}">✕</button></div>`).join(''):'<div class="muted">Niente registrato.</div>';personTimeline.querySelectorAll('[data-evdel]').forEach(b=>b.onclick=()=>{s.events=s.events.filter(e=>e.id!==b.dataset.evdel);save()})}
if(dayPrev) dayPrev.onclick=()=>{dayOffset--;renderPerson()};if(dayNext) dayNext.onclick=()=>{if(dayOffset<0){dayOffset++;renderPerson()}};
function handleAction(id,t){if(t==='cacca'){pendingPerson=id;poopDialog.showModal();return}if(t==='nanna'){pendingPerson=id;sleepText.textContent=sleepActive(id)?'Segno il risveglio?':'Segno l’inizio della nanna?';sleepDialog.showModal();return}s.events.push({id:crypto.randomUUID(),childId:id,type:t,at:new Date().toISOString(),note:''});save()}
if(poopForm) poopForm.onsubmit=e=>{e.preventDefault();s.events.push({id:crypto.randomUUID(),childId:pendingPerson,type:'cacca',at:new Date().toISOString(),note:[poopType.value,poopNote.value.trim()].filter(Boolean).join(' · ')});poopDialog.close();save()}
if(sleepForm) sleepForm.onsubmit=e=>{e.preventDefault();let a=sleepActive(pendingPerson);if(a)a.endAt=new Date().toISOString();else s.events.push({id:crypto.randomUUID(),childId:pendingPerson,type:'nanna',at:new Date().toISOString(),endAt:null,note:''});sleepDialog.close();save()}

function renderAdult(){let a=ADULTS[currentAdult],up=s.health.filter(x=>x.person===currentAdult&&x.date>=dateKey()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),p=s.expenses.filter(x=>x.person===currentAdult&&x.month===monthKey()),tot=p.reduce((q,x)=>q+Number(x.amount),0);adultTitle.textContent=`${a.emoji} ${a.name}`;adultSummary.innerHTML=`<div class="stat"><span>ETÀ</span><b>${age(a.birthDate)}</b></div><div class="stat"><span>SPESO QUESTO MESE</span><b>${euro(tot)}</b></div>`;adultExpenseTotal.textContent=euro(tot);let cats={};p.forEach(x=>cats[x.personalCategory||'Altro']=(cats[x.personalCategory||'Altro']||0)+Number(x.amount));adultExpenseBreakdown.innerHTML=Object.entries(cats).map(([k,v])=>`<div class="row"><div class="grow">${esc(k)}</div><b>${euro(v)}</b></div>`).join('');adultExpenseList.innerHTML=p.map(x=>`<div class="row"><div class="grow"><b>${esc(x.name)}</b><div class="meta">${esc(x.personalCategory||'Altro')}</div></div><b>${euro(x.amount)}</b><button class="del" data-pdel="${x.id}">✕</button></div>`).join('');adultExpenseList.querySelectorAll('[data-pdel]').forEach(b=>b.onclick=()=>{s.expenses=s.expenses.filter(x=>x.id!==b.dataset.pdel);save();renderAdult()});adultUpcoming.innerHTML=up.length?up.slice(0,8).map(x=>`<div class="row"><span>${x.kind==='visit'?'🩺':'💊'}</span><div><b>${esc(x.title)}</b><div class="meta">${longDate(dateObj(x.date))}${x.time?' · '+x.time:''}</div></div></div>`).join(''):'<div class="muted">Nessun impegno.</div>'}
if(adultExpenseForm) adultExpenseForm.onsubmit=e=>{e.preventDefault();s.expenses.push({id:crypto.randomUUID(),name:adultExpenseName.value.trim(),amount:Number(adultExpenseAmount.value),category:'Personale',personalCategory:adultExpenseCategory.value,person:currentAdult,month:monthKey(),date:dateKey(),recurring:false});adultExpenseName.value='';adultExpenseAmount.value='';save();renderAdult()}

const RECIPES=[['Pasta al pomodoro',['Pasta','Passata di pomodoro','Olio EVO','Parmigiano'],['Cuoci la pasta.','Scalda la passata.','Condisci e servi.']],['Risotto alle zucchine',['Riso','Zucchine','Brodo vegetale','Parmigiano'],['Cuoci le zucchine.','Aggiungi il riso e il brodo.','Manteca.']],['Pasta e lenticchie',['Pasta piccola','Lenticchie','Passata di pomodoro'],['Cuoci le lenticchie.','Aggiungi pomodoro.','Unisci la pasta.']],['Pollo e patate',['Pollo','Patate','Olio EVO'],['Taglia le patate.','Metti tutto in teglia.','Cuoci completamente.']],['Frittata di verdure',['Uova','Verdure','Parmigiano'],['Cuoci le verdure.','Unisci le uova.','Cuoci bene.']],['Polpette di zucchine',['Zucchine','Uovo','Pangrattato','Parmigiano'],['Grattugia le zucchine.','Impasta.','Forma e cuoci le polpette.']],['Riso con piselli',['Riso','Piselli','Brodo vegetale'],['Cuoci i piselli.','Aggiungi il riso.','Porta a cottura.']],['Pesce e patate',['Pesce','Patate','Olio EVO'],['Prepara le patate.','Aggiungi il pesce.','Cuoci completamente.']]];
function csv(v){return String(v||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean)}
function allowed(name){let ps=Object.values(s.profiles);return ps.every(p=>!csv(p.dislikes).some(x=>name.toLowerCase().includes(x))&&!csv(p.allergens).some(x=>name.toLowerCase().includes(x)))}
if(generateMenu) generateMenu.onclick=()=>{s.menuBackup=JSON.parse(JSON.stringify(s.menu));let pool=RECIPES.filter(r=>allowed(r[0]));if(pool.length<4)pool=RECIPES;for(let i=0;i<7;i++){let d=new Date();d.setDate(d.getDate()+i);let a=pool[(i*2)%pool.length],b=pool[(i*2+1)%pool.length];s.menu[dateKey(d)]={lunch:a[0],dinner:b[0],lunchAdapt:'Adatta consistenza, sale e pezzi all’età di Caty e Kiko.',dinnerAdapt:'Adatta consistenza, sale e pezzi all’età di Caty e Kiko.'}}save();renderMenu()}
if(undoMenu) undoMenu.onclick=()=>{if(s.menuBackup){s.menu=s.menuBackup;s.menuBackup=null;save();renderMenu()}}
function renderMenu(){menuWeek.innerHTML='';for(let i=0;i<7;i++){let d=new Date();d.setDate(d.getDate()+i);let k=dateKey(d),m=s.menu[k]||{};let el=document.createElement('div');el.className='menuDay';el.innerHTML=`<h3>${i===0?'Oggi · ':''}${longDate(d)}</h3><div class="mealLine"><label>🍝 Pranzo</label><input data-meal="${k}|lunch" value="${esc(m.lunch||'')}"><button data-recipe="${esc(m.lunch||'')}">👨‍🍳</button></div>${m.lunchAdapt?`<div class="adaptation">${esc(m.lunchAdapt)}</div>`:''}<div class="mealLine"><label>🌙 Cena</label><input data-meal="${k}|dinner" value="${esc(m.dinner||'')}"><button data-recipe="${esc(m.dinner||'')}">👨‍🍳</button></div>${m.dinnerAdapt?`<div class="adaptation">${esc(m.dinnerAdapt)}</div>`:''}`;menuWeek.appendChild(el)}menuWeek.querySelectorAll('[data-meal]').forEach(inp=>inp.onchange=()=>{let [k,f]=inp.dataset.meal.split('|');s.menu[k]=s.menu[k]||{};s.menu[k][f]=inp.value.trim();delete s.menu[k][f+'Adapt'];save();renderMenu()});menuWeek.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{if(b.dataset.recipe)openRecipe(b.dataset.recipe)})}
function openRecipe(name){let r=RECIPES.find(x=>x[0]===name)||[name,[name,'Olio EVO'],['Prepara gli ingredienti.','Cuoci completamente.','Servi.']];recipeDialog.dataset.name=name;recipeTitle.textContent=name;recipeBody.innerHTML=`<h4>Ingredienti</h4><ul>${r[1].map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>Come si fa</h4><ol>${r[2].map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="adaptation">👧👶 Adatta sale, consistenza e dimensione all’età dei bambini.</div>`;recipeDialog.showModal()}
if(recipeShopping) recipeShopping.onclick=()=>{let r=RECIPES.find(x=>x[0]===recipeDialog.dataset.name);if(r)r[1].forEach(n=>{if(!s.shopping.some(x=>x.name.toLowerCase()===n.toLowerCase()&&!x.done))s.shopping.push({id:crypto.randomUUID(),name:n,qty:'',category:'Alimentari',done:false})});recipeDialog.close();save();go('shop')}

function renderProfiles(){profileForms.innerHTML=[['caty','👧 Caty'],['kiko','👶 Kiko'],['jj','👨 JJ'],['kiki','👩 Kiki']].map(([id,l])=>{let p=s.profiles[id];return `<form class="profileCard" data-profile="${id}"><h3>${l}</h3><div class="profileGrid"><label>Piace<input name="likes" value="${esc(p.likes)}"></label><label>Non piace<input name="dislikes" value="${esc(p.dislikes)}"></label><label>Allergeni / esclusioni<input name="allergens" value="${esc(p.allergens)}"></label></div><button class="primary">Salva</button></form>`}).join('');profileForms.querySelectorAll('[data-profile]').forEach(f=>f.onsubmit=e=>{e.preventDefault();let d=new FormData(f);s.profiles[f.dataset.profile]={likes:d.get('likes'),dislikes:d.get('dislikes'),allergens:d.get('allergens')};save()})}

function fillPeople(){let o=[['caty','👧 Caty'],['kiko','👶 Kiko'],['astro','🐶 Astro'],['jj','👨 JJ'],['kiki','👩 Kiki']].map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('');visitPerson.innerHTML=o;medPerson.innerHTML=o}
if(visitForm) visitForm.onsubmit=e=>{e.preventDefault();s.health.push({id:crypto.randomUUID(),kind:'visit',person:visitPerson.value,title:visitTitle.value.trim(),date:visitDate.value,time:visitTime.value,note:visitNote.value.trim(),reminderDays:Number(visitReminder.value),notify:visitNotify.value});visitForm.reset();save();renderHealth()}
if(medicineForm) medicineForm.onsubmit=e=>{e.preventDefault();s.health.push({id:crypto.randomUUID(),kind:'medicine',person:medPerson.value,title:medName.value.trim(),dose:medDose.value.trim(),date:medDate.value,time:medTime.value,note:medNote.value.trim(),reminderDays:Number(medReminder.value),notify:medNotify.value});medicineForm.reset();save();renderHealth()}
function renderHealth(){fillPeople();let a=s.health.filter(x=>x.date>=dateKey()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));healthList.innerHTML=a.length?a.map(x=>`<div class="row"><span>${x.kind==='visit'?'🩺':'💊'}</span><div class="grow"><b>${esc(x.title)}</b><div class="meta">${personName(x.person)} · ${birthLabel(x.date)}${x.time?' · '+x.time:''} · 🔔 ${x.reminderDays}g prima</div></div><button class="del" data-hdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessun evento.</div>';healthList.querySelectorAll('[data-hdel]').forEach(b=>b.onclick=()=>{s.health=s.health.filter(x=>x.id!==b.dataset.hdel);save();renderHealth()})}

function dayItems(k){let a=[];let m=s.menu[k];if(m?.lunch)a.push(['🍝','Pranzo: '+m.lunch]);if(m?.dinner)a.push(['🌙','Cena: '+m.dinner]);s.health.filter(x=>x.date===k).forEach(x=>a.push([x.kind==='visit'?'🩺':'💊',`${personName(x.person)}: ${x.title}`]));s.subscriptions.filter(x=>x.dueDate===k).forEach(x=>a.push(['⏰',`${x.name}: ${euro(x.amount)}`]));s.events.filter(e=>dateKey(new Date(e.at))===k).forEach(e=>a.push([icon(e.type,e.childId),`${personName(e.childId)}: ${META[e.type]?.[1]||e.type}`]));return a}
function renderCalendar(){let base=new Date();base.setDate(1);base.setMonth(base.getMonth()+calOffset);calMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(base);let y=base.getFullYear(),m=base.getMonth(),start=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate(),cells=[];for(let i=0;i<42;i++){let n=i-start+1,d=new Date(y,m,n),k=dateKey(d),other=d.getMonth()!==m,has=dayItems(k).length;cells.push(`<button class="calDay ${other?'other':''} ${k===dateKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}">${d.getDate()}${has?`<div class="dots"><i class="dot"></i></div>`:''}</button>`)}calendarGrid.innerHTML=cells.join('');calendarGrid.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selectedDate=b.dataset.date;renderCalendar()});selectedDateTitle.textContent=longDate(dateObj(selectedDate));let a=dayItems(selectedDate);calendarDetails.innerHTML=a.length?a.map(x=>`<div class="row"><span>${x[0]}</span><div>${esc(x[1])}</div></div>`).join(''):'<div class="muted">Niente.</div>'}
if(calPrev) calPrev.onclick=()=>{calOffset--;renderCalendar()};if(calNext) calNext.onclick=()=>{calOffset++;renderCalendar()}

function renderHouse(){let steps=['Lavatrice da avviare','Lavatrice in corso','Da trasferire','Asciugatrice in corso','Da ritirare / piegare','Completato'],labels=['Avvia lavatrice','Lavatrice finita','Avvia asciugatrice','Asciugatrice finita','Bucato ritirato','Nuovo ciclo'],st=Number(s.laundry.step||0);laundryStatus.textContent=steps[st];laundryNext.textContent=labels[st];laundrySteps.innerHTML=steps.map((x,i)=>`<div class="laundryStep ${i<st?'done':''} ${i===st?'current':''}"><span>${i<st?'✓':i+1}</span><small>${x}</small></div>`).join('');routineList.innerHTML=[...s.routines].sort((a,b)=>Number(routineDue(b))-Number(routineDue(a))).map(r=>`<div class="row ${routineDue(r)?'due':''}"><span>${r.emoji}</span><div class="grow"><b>${esc(r.name)}</b><div class="meta">${r.lastDone?'Ultima: '+birthLabel(r.lastDone):'Mai fatta'} · ${ownerLabel(r.owner)}</div></div><button data-rdone="${r.id}" class="${routineDue(r)?'primary':''}">✓</button><button class="del" data-rdel="${r.id}">✕</button></div>`).join('');routineList.querySelectorAll('[data-rdone]').forEach(b=>b.onclick=()=>{let r=s.routines.find(x=>x.id===b.dataset.rdone);r.lastDone=dateKey();r.lastBy=memberName||'Famiglia';save();renderHouse()});routineList.querySelectorAll('[data-rdel]').forEach(b=>b.onclick=()=>{s.routines=s.routines.filter(x=>x.id!==b.dataset.rdel);save();renderHouse()})}
if(laundryNext) laundryNext.onclick=()=>{s.laundry.step=Number(s.laundry.step)>=5?0:Number(s.laundry.step)+1;s.laundry.updatedAt=new Date().toISOString();save();renderHouse()};if(laundryReset) laundryReset.onclick=()=>{s.laundry={step:0,updatedAt:null};save();renderHouse()};if(addRoutine) addRoutine.onclick=()=>routineDialog.showModal();if(routineForm) routineForm.onsubmit=e=>{e.preventDefault();s.routines.push({id:crypto.randomUUID(),name:routineName.value.trim(),emoji:'🏡',everyDays:Number(routineEvery.value),owner:routineOwner.value,lastDone:null});routineForm.reset();routineDialog.close();save();renderHouse()}

if(shopForm) shopForm.onsubmit=e=>{e.preventDefault();s.shopping.push({id:crypto.randomUUID(),name:shopName.value.trim(),qty:shopQty.value.trim(),category:shopCategory.value,done:false});shopForm.reset();save();renderShop()}
function renderShop(){let a=[...s.shopping].sort((a,b)=>Number(a.done)-Number(b.done));shopList.innerHTML=a.length?a.map(x=>`<div class="row ${x.done?'done':''}"><button data-shop="${x.id}">${x.done?'✅':'⬜️'}</button><div class="grow"><b>${esc(x.name)}</b><div class="meta">${esc(x.category||'Altro')}${x.qty?' · '+esc(x.qty):''}</div></div><button class="del" data-sdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Lista vuota.</div>';shopList.querySelectorAll('[data-shop]').forEach(b=>b.onclick=()=>{let x=s.shopping.find(i=>i.id===b.dataset.shop);x.done=!x.done;save();renderShop()});shopList.querySelectorAll('[data-sdel]').forEach(b=>b.onclick=()=>{s.shopping=s.shopping.filter(x=>x.id!==b.dataset.sdel);save();renderShop()})}

if(moneyForm) moneyForm.onsubmit=e=>{e.preventDefault();s.expenses.push({id:crypto.randomUUID(),name:moneyName.value.trim(),amount:Number(moneyAmount.value),category:moneyCategory.value,person:null,month:monthKey(),date:dateKey(),recurring:moneyRecurring.checked});moneyForm.reset();save();renderMoney()}
function nextDue(k,f){let d=dateObj(k);if(f==='monthly')d.setMonth(d.getMonth()+1);else if(f==='bimonthly')d.setMonth(d.getMonth()+2);else if(f==='quarterly')d.setMonth(d.getMonth()+3);else if(f==='annual')d.setFullYear(d.getFullYear()+1);return dateKey(d)}
function renderMoney(){let d=new Date();d.setDate(1);d.setMonth(d.getMonth()+moneyOffset);let mk=monthKey(d),a=s.expenses.filter(x=>x.month===mk),tot=a.reduce((q,x)=>q+Number(x.amount),0),jj=a.filter(x=>x.person==='jj').reduce((q,x)=>q+Number(x.amount),0),ki=a.filter(x=>x.person==='kiki').reduce((q,x)=>q+Number(x.amount),0);moneyMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(d);moneyNext.disabled=moneyOffset>=0;moneyStats.innerHTML=[['Totale',euro(tot)],['JJ personale',euro(jj)],['Kiki personale',euro(ki)],['Voci',a.length]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');moneyList.innerHTML=a.length?a.map(x=>`<div class="row"><div class="grow"><b>${esc(x.name)}</b><div class="meta">${esc(x.personalCategory||x.category||'Altro')}${x.person?' · '+personName(x.person):''}</div></div><b>${euro(x.amount)}</b><button class="del" data-edel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna spesa.</div>';moneyList.querySelectorAll('[data-edel]').forEach(b=>b.onclick=()=>{s.expenses=s.expenses.filter(x=>x.id!==b.dataset.edel);save();renderMoney()});let cats={};a.forEach(x=>{let k=x.person?'Personale '+personName(x.person):x.category||'Altro';cats[k]=(cats[k]||0)+Number(x.amount)});moneyCategories.innerHTML=Object.entries(cats).map(([k,v])=>`<div class="row"><div class="grow">${esc(k)}</div><b>${euro(v)}</b></div>`).join('');let subs=[...s.subscriptions].sort((a,b)=>a.dueDate.localeCompare(b.dueDate));subscriptionStats.innerHTML=[['Entro 7 giorni',subs.filter(x=>dueSoon(x)).length],['Attive',subs.length]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');subscriptionList.innerHTML=subs.length?subs.map(x=>`<div class="row ${x.dueDate<dateKey()?'overdue':''}"><span>${x.category==='Trasporti'?'🚆':'💳'}</span><div class="grow"><b>${esc(x.name)}</b><div class="meta">${ownerLabel(x.owner)} · ${birthLabel(x.dueDate)} · 🔔 ${x.reminderDays}g</div></div><b>${euro(x.amount)}</b><button class="primary" data-pay="${x.id}">Pagata</button><button class="del" data-subdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna scadenza.</div>';subscriptionList.querySelectorAll('[data-pay]').forEach(b=>b.onclick=()=>{let x=s.subscriptions.find(v=>v.id===b.dataset.pay);s.expenses.push({id:crypto.randomUUID(),name:x.name,amount:x.amount,category:x.category,person:x.owner==='family'?null:x.owner,month:monthKey(),date:dateKey(),recurring:false});if(x.frequency==='once')s.subscriptions=s.subscriptions.filter(v=>v.id!==x.id);else x.dueDate=nextDue(x.dueDate,x.frequency);save();renderMoney()});subscriptionList.querySelectorAll('[data-subdel]').forEach(b=>b.onclick=()=>{s.subscriptions=s.subscriptions.filter(x=>x.id!==b.dataset.subdel);save();renderMoney()})}
if(moneyPrev) moneyPrev.onclick=()=>{moneyOffset--;renderMoney()};if(moneyNext) moneyNext.onclick=()=>{if(moneyOffset<0){moneyOffset++;renderMoney()}};if(addSubscription) addSubscription.onclick=()=>{subDue.value=dateKey();subscriptionDialog.showModal()};if(subscriptionForm) subscriptionForm.onsubmit=e=>{e.preventDefault();s.subscriptions.push({id:crypto.randomUUID(),name:subName.value.trim(),amount:Number(subAmount.value),owner:subOwner.value,category:subCategory.value,dueDate:subDue.value,frequency:subFrequency.value,reminderDays:Number(subReminder.value),notify:subNotify.value});subscriptionForm.reset();subscriptionDialog.close();save();renderMoney()}

function renderReminders(){let a=[];s.health.forEach(x=>a.push({date:x.date,title:x.title,who:x.notify,days:x.reminderDays,type:x.kind==='visit'?'🩺':'💊'}));s.subscriptions.forEach(x=>a.push({date:x.dueDate,title:x.name,who:x.notify,days:x.reminderDays,type:'💳'}));a.sort((x,y)=>x.date.localeCompare(y.date));reminderList.innerHTML=a.length?a.map(x=>`<div class="row"><span>${x.type}</span><div class="grow"><b>${esc(x.title)}</b><div class="meta">${birthLabel(x.date)} · ${x.days}g prima · ${x.who==='both'?'JJ + Kiki':x.who.toUpperCase()}</div></div><span>🔔</span></div>`).join(''):'<div class="muted">Nessun reminder.</div>'}

function openQuick(){quickPerson='caty';renderQuick();quickDialog.showModal()}function renderQuick(){quickPeople.innerHTML=s.children.map(c=>`<button class="personCard ${c.type==='dog'?'pet':''}" data-qp="${c.id}"><i>${c.emoji}</i><b>${c.name}</b></button>`).join('');quickPeople.querySelectorAll('[data-qp]').forEach(b=>b.onclick=()=>{quickPerson=b.dataset.qp;renderQuick()});let c=s.children.find(x=>x.id===quickPerson);quickActions.innerHTML=actionKeys(c).map(k=>`<button data-qa="${k}">${icon(k,quickPerson)}<small>${META[k][1]}</small></button>`).join('');quickActions.querySelectorAll('[data-qa]').forEach(b=>b.onclick=()=>{quickDialog.close();handleAction(quickPerson,b.dataset.qa)})}if(quickRecord) quickRecord.onclick=openQuick;if(navQuick) navQuick.onclick=openQuick;

let upTimer=null;
let manualLogout=false;

function setSync(cls,t){
 syncStatus.className='syncStatus '+cls;
 syncStatus.querySelector('small').textContent=t
}

function enterApp(){
 loginScreen.classList.add('hidden');
}

function showLogin(msg=''){
 loginScreen.classList.remove('hidden');
 loginMessage.textContent=msg
}

async function boot(){
 // L'app è sempre accessibile con i dati locali.
 loginScreen.classList.add('hidden');
 renderAll();
 setSync('','Locale');

 try{
  const {data,error}=await sb.auth.getSession();
  if(error)throw error;

  session=data?.session||null;

  if(session){
   setSync('','Connessione…');
   await initCloud();
  }
 }catch(err){
  console.error('BOOT AUTH:',err);
  setSync('error','Solo locale');
 }
}

if(loginClose) loginClose.onclick=()=>{
 loginScreen.classList.add('hidden');
 renderAll();
 setSync('','Locale');
};

if(loginForm) loginForm.onsubmit=async e=>{
 e.preventDefault();

 loginMessage.textContent='';
 loginBtn.disabled=true;
 loginBtn.textContent='Accesso...';

 try{
  const {data,error}=await sb.auth.signInWithPassword({
   email:loginEmail.value.trim(),
   password:loginPassword.value
  });

  if(error)throw error;
  if(!data?.session)throw new Error('Sessione non ricevuta da Supabase');

  session=data.session;

  // Dopo login riuscito la schermata viene chiusa definitivamente.
  loginScreen.classList.add('hidden');
  renderAll();
  setSync('','Connessione…');

  // Il cloud non può bloccare l'ingresso.
  try{
   await initCloud();
  }catch(err){
   console.error('CLOUD AFTER LOGIN:',err);
   setSync('error','Solo locale');
  }

 }catch(err){
  console.error('LOGIN:',err);
  loginMessage.textContent='Accesso non riuscito: '+(err?.message||'controlla le credenziali');
  loginScreen.classList.remove('hidden');
 }finally{
  loginBtn.disabled=false;
  loginBtn.textContent='Accedi';
 }
};

async function initCloud(){
 if(!session)return;

 try{
  const {data:member,error:memberError}=await sb
   .from('family_members')
   .select('family_id,display_name')
   .eq('user_id',session.user.id)
   .maybeSingle();

  if(memberError)throw memberError;

  if(!member){
   cloudReady=false;
   familyId=null;
   memberName=session.user.user_metadata?.display_name||'';
   setSync('error','Non associato');
   return;
  }

  familyId=member.family_id;
  memberName=member.display_name||session.user.user_metadata?.display_name||'';

  const {data:row,error:stateError}=await sb
   .from('family_state')
   .select('data,updated_at')
   .eq('family_id',familyId)
   .maybeSingle();

  if(stateError)throw stateError;

  if(row?.data && Object.keys(row.data).length){
   s=normalize(row.data);
   lastUpdated=row.updated_at||null;
   localStorage.setItem(LS,JSON.stringify(s));
   renderAll();
  }else{
   await upload();
  }

  cloudReady=true;
  setSync('online','Sincronizzato');

  if(poll)clearInterval(poll);
  poll=setInterval(pull,8000);

 }catch(err){
  console.error('INIT CLOUD:',err);
  cloudReady=false;
  setSync('error','Solo locale');
 }
}

function uploadSoon(){
 clearTimeout(upTimer);
 if(!cloudReady||!familyId||!session)return;
 setSync('','Salvataggio…');
 upTimer=setTimeout(upload,400);
}

async function upload(){
 if(!familyId||!session)return;

 try{
  const now=new Date().toISOString();
  const {data,error}=await sb
   .from('family_state')
   .update({data:s,updated_at:now})
   .eq('family_id',familyId)
   .select('updated_at')
   .maybeSingle();

  if(error)throw error;

  lastUpdated=data?.updated_at||now;
  cloudReady=true;
  setSync('online','Sincronizzato');
 }catch(err){
  console.error('UPLOAD:',err);
  cloudReady=false;
  setSync('error','Da sincronizzare');
 }
}

async function pull(){
 if(!familyId||!session)return;

 try{
  const {data:row,error}=await sb
   .from('family_state')
   .select('data,updated_at')
   .eq('family_id',familyId)
   .maybeSingle();

  if(error)throw error;

  if(row?.updated_at && row.updated_at!==lastUpdated){
   s=normalize(row.data);
   lastUpdated=row.updated_at;
   localStorage.setItem(LS,JSON.stringify(s));
   renderAll();
  }

  cloudReady=true;
  setSync('online','Sincronizzato');
 }catch(err){
  console.error('PULL:',err);
  cloudReady=false;
  setSync('error','Offline');
 }
}

if(accountBtn) accountBtn.onclick=()=>{
 if(!session){
  loginMessage.textContent='';
  loginScreen.classList.remove('hidden');
  return;
 }

 accountInfo.innerHTML=`<div class="row"><span>👤</span><div><b>${esc(memberName||session.user.user_metadata?.display_name||'Fagiolini')}</b><div class="meta">${esc(session.user.email||'')}</div><div class="meta">${cloudReady?'☁️ Sincronizzato':'📱 Solo locale'}</div></div></div>`;
 accountDialog.showModal();
};

if(syncNow) syncNow.onclick=async()=>{
 syncNow.disabled=true;
 syncNow.textContent='Sincronizzo...';

 if(!session){
  accountDialog.close();
  loginScreen.classList.remove('hidden');
 }else if(!familyId){
  await initCloud();
 }else{
  await pull();
  await upload();
 }

 syncNow.disabled=false;
 syncNow.textContent='🔄 Sincronizza';
};

if(logoutBtn) logoutBtn.onclick=async()=>{
 if(poll)clearInterval(poll);
 poll=null;
 cloudReady=false;
 familyId=null;
 memberName='';

 try{await sb.auth.signOut()}catch{}

 session=null;
 accountDialog.close();
 setSync('','Locale');
 renderAll();
};

// Gli eventi auth aggiornano la sessione, ma NON controllano la visibilità della login.
sb.auth.onAuthStateChange((event,newSession)=>{
 if(newSession)session=newSession;
 if(event==='SIGNED_OUT')session=null;
});

function renderAll(){
 try{renderHome()}catch(e){console.error('renderHome',e)}
 try{if(person&&person.classList.contains('on'))renderPerson()}catch(e){console.error('renderPerson',e)}
 try{if(adult&&adult.classList.contains('on'))renderAdult()}catch(e){console.error('renderAdult',e)}
 try{if(menu&&menu.classList.contains('on'))renderMenu()}catch(e){console.error('renderMenu',e)}
 try{if(profiles&&profiles.classList.contains('on'))renderProfiles()}catch(e){console.error('renderProfiles',e)}
 try{if(health&&health.classList.contains('on'))renderHealth()}catch(e){console.error('renderHealth',e)}
 try{if(calendar&&calendar.classList.contains('on'))renderCalendar()}catch(e){console.error('renderCalendar',e)}
 try{if(house&&house.classList.contains('on'))renderHouse()}catch(e){console.error('renderHouse',e)}
 try{if(shop&&shop.classList.contains('on'))renderShop()}catch(e){console.error('renderShop',e)}
 try{if(money&&money.classList.contains('on'))renderMoney()}catch(e){console.error('renderMoney',e)}
 try{if(reminders&&reminders.classList.contains('on'))renderReminders()}catch(e){console.error('renderReminders',e)}
}
try{fillPeople()}catch(e){console.error(e)};try{renderHome()}catch(e){console.error(e)};boot();