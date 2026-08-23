const KEY='familyHubV2';
const DEFAULT={
 children:[
  {id:'caty',name:'Caty',emoji:'👧',type:'child'},
  {id:'kiko',name:'Kiko',emoji:'👶',type:'child'},
  {id:'astro',name:'Astro',emoji:'🐶',type:'dog'}
 ],
 events:[],tasks:[],house:[
  {id:crypto.randomUUID(),text:'Riordinare cucina',owner:'Famiglia',frequency:'giornaliera',done:[]},
  {id:crypto.randomUUID(),text:'Pulire bagno',owner:'Famiglia',frequency:'settimanale',done:[]}
 ],
 shopping:[],menu:{},expenses:[],health:[],
 profiles:{
  caty:{ageMonths:20,likes:'',dislikes:'',allergens:''},
  kiko:{ageMonths:6,likes:'',dislikes:'',allergens:''},
  jj:{ageMonths:420,likes:'',dislikes:'',allergens:''},
  kiki:{ageMonths:420,likes:'',dislikes:'',allergens:''}
 }
};
const META={
 pappa:['🍼','Pappa'],pannolino:['🚼','Pannolino'],cacca:['💩','Cacca'],nanna:['😴','Nanna'],bagnetto:['🛁','Bagnetto'],
 passeggiata:['🦮','Passeggiata'],pipi:['💧','Pipì'],farmaco:['💊','Farmaco'],toeletta:['🛁','Toeletta']
};
let s=load(),current='caty',dayOffset=0,quickPerson='caty',pendingPerson=null,moneyOffset=0,calOffset=0,selectedDate=dateKey();

function load(){
 let out=structuredClone(DEFAULT);
 try{const raw=localStorage.getItem(KEY);if(raw)out={...out,...JSON.parse(raw)}}catch{}
 out.children=(out.children||[]).map(c=>{
  if(c.id==='domenico'||c.name==='Domenico')return {...c,id:'kiko',name:'Kiko',emoji:'👶',type:'child'};
  if(c.id==='astro')return {...c,name:'Astro',emoji:'🐶',type:'dog'};
  if(c.id==='caty')return {...c,name:'Caty',emoji:'👧',type:'child'};
  if(c.id==='kiko')return {...c,name:'Kiko',emoji:'👶',type:'child'};
  return c
 });
 if(!out.children.some(c=>c.id==='astro'))out.children.push({id:'astro',name:'Astro',emoji:'🐶',type:'dog'});
 out.events=(out.events||[]).map(e=>e.childId==='domenico'?{...e,childId:'kiko'}:e);
 out.health=Array.isArray(out.health)?out.health:[];
 out.expenses=Array.isArray(out.expenses)?out.expenses:[];
 out.profiles={...DEFAULT.profiles,...(out.profiles||{})};
 out.house=Array.isArray(out.house)?out.house:[];
 out.shopping=Array.isArray(out.shopping)?out.shopping:[];
 out.tasks=Array.isArray(out.tasks)?out.tasks:[];
 out.menu=out.menu||{};
 return out
}
function save(){localStorage.setItem(KEY,JSON.stringify(s));renderAll()}
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
function personName(id){return ({caty:'Caty',kiko:'Kiko',astro:'Astro',jj:'JJ',kiki:'Kiki',family:'Famiglia'})[id]||id}

function go(id){
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
 document.getElementById(id).classList.add('on');
 const titles={home:'La nostra giornata',person:'Registro',menu:'Menu famiglia',profiles:'Profili alimentari',health:'Visite e medicine',calendar:'Calendario',house:'Casa',shop:'Spesa',money:'Soldi'};
 pageTitle.textContent=titles[id]||'Fagiolini';
 if(id==='home')renderHome();if(id==='menu')renderMenu();if(id==='profiles')renderProfiles();if(id==='health')renderHealth();if(id==='calendar')renderCalendar();if(id==='house')renderHouse();if(id==='shop')renderShop();if(id==='money')renderMoney();
 scrollTo(0,0)
}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());

function renderHome(){
 todayLabel.textContent=longDate();
 peopleCards.innerHTML=s.children.map(c=>{
  if(c.type==='dog'){
   let ev=events(c.id),walk=ev.find(e=>e.type==='passeggiata');
   return `<button class="personCard pet" data-person="${c.id}"><i>${c.emoji}</i><b>${c.name}</b><span class="muted">🦮 ${walk?timeLabel(walk.at):'—'}<br>💩 ${count(c.id,'cacca')} oggi</span></button>`
  }
  return `<button class="personCard" data-person="${c.id}"><i>${c.emoji}</i><b>${c.name}</b><span class="muted">💩 ${count(c.id,'cacca')} · 🚼 ${count(c.id,'pannolino')}<br>🍼 ${count(c.id,'pappa')} · 😴 ${duration(sleepMinutes(c.id))}</span></button>`
 }).join('');
 peopleCards.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>openPerson(b.dataset.person));

 const healthToday=s.health.filter(h=>h.date===dateKey());
 const dueHouse=s.house.filter(h=>!houseDone(h));
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
function personActionKeys(c){return c.type==='dog'?['pappa','passeggiata','cacca','pipi','farmaco','toeletta']:['pappa','pannolino','cacca','nanna','bagnetto']}
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
 let pool=familyRecipePool();if(pool.length<5){alert('Con i filtri attuali rimangono poche ricette. Controlla allergeni e cibi non graditi nei profili.');return}
 let choices=shuffle(pool),idx=0;
 for(let i=0;i<7;i++){let d=offsetDate(i),k=dateKey(d);if(idx>=choices.length){choices=shuffle(pool);idx=0}let lunch=choices[idx++];if(idx>=choices.length){choices=shuffle(pool);idx=0}let dinner=choices[idx++];s.menu[k]={lunch:lunch.name,dinner:dinner.name,lunchAdapt:{caty:adaptation(lunch,'caty'),kiko:adaptation(lunch,'kiko')},dinnerAdapt:{caty:adaptation(dinner,'caty'),kiko:adaptation(dinner,'kiko')}}}
 save();renderMenu()
};
function renderMenu(){
 menuWeek.innerHTML='';
 for(let i=0;i<7;i++){let d=offsetDate(i),k=dateKey(d),m=s.menu[k]||{};let el=document.createElement('div');el.className='menuDay'+(i===0?' today':'');el.innerHTML=`<h3>${i===0?'Oggi · ':''}${longDate(d)}</h3>
 <div class="mealEdit"><label>🍝 Pranzo</label><input data-menu="${k}" data-meal="lunch" value="${esc(m.lunch||'')}" placeholder="Cosa mangiamo?"></div>
 ${m.lunchAdapt?.caty?`<div class="adaptation">👧 ${esc(m.lunchAdapt.caty)}<br>👶 ${esc(m.lunchAdapt.kiko)}</div>`:''}
 <div class="mealEdit"><label>🌙 Cena</label><input data-menu="${k}" data-meal="dinner" value="${esc(m.dinner||'')}" placeholder="Cosa mangiamo?"></div>
 ${m.dinnerAdapt?.caty?`<div class="adaptation">👧 ${esc(m.dinnerAdapt.caty)}<br>👶 ${esc(m.dinnerAdapt.kiko)}</div>`:''}`;menuWeek.appendChild(el)}
 menuWeek.querySelectorAll('[data-menu]').forEach(inp=>inp.onchange=()=>{let k=inp.dataset.menu;s.menu[k]=s.menu[k]||{};s.menu[k][inp.dataset.meal]=inp.value.trim();save()})
}
function renderProfiles(){
 let people=[['caty','👧 Caty'],['kiko','👶 Kiko'],['jj','👨 JJ'],['kiki','👩 Kiki']];
 profileForms.innerHTML=people.map(([id,label])=>{let p=s.profiles[id]||{};return `<form class="profileCard" data-profile="${id}"><h3>${label}</h3><div class="profileGrid"><label>Età in mesi<input name="age" type="number" min="0" value="${Number(p.ageMonths||0)}"></label><label>Piace<input name="likes" value="${esc(p.likes||'')}" placeholder="es. pasta, zucchine"></label><label>Non piace<input name="dislikes" value="${esc(p.dislikes||'')}" placeholder="es. piselli, pesce"></label><label>Allergeni / esclusioni<input name="allergens" value="${esc(p.allergens||'')}" placeholder="es. latte, uova"></label></div><button class="primary">Salva profilo</button></form>`}).join('');
 profileForms.querySelectorAll('[data-profile]').forEach(f=>f.onsubmit=e=>{e.preventDefault();let id=f.dataset.profile,d=new FormData(f);s.profiles[id]={ageMonths:Number(d.get('age')||0),likes:d.get('likes').trim(),dislikes:d.get('dislikes').trim(),allergens:d.get('allergens').trim()};save();alert('Profilo salvato')})
}

function fillHealthPeople(){let opts=[['caty','👧 Caty'],['kiko','👶 Kiko'],['astro','🐶 Astro'],['jj','👨 JJ'],['kiki','👩 Kiki']].map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('');visitPerson.innerHTML=opts;medPerson.innerHTML=opts}
visitForm.onsubmit=e=>{e.preventDefault();s.health.push({id:crypto.randomUUID(),kind:'visit',person:visitPerson.value,title:visitTitle.value.trim(),date:visitDate.value,time:visitTime.value,note:visitNote.value.trim()});visitForm.reset();save();renderHealth()};
medicineForm.onsubmit=e=>{e.preventDefault();s.health.push({id:crypto.randomUUID(),kind:'medicine',person:medPerson.value,name:medName.value.trim(),title:medName.value.trim(),dose:medDose.value.trim(),date:medDate.value,time:medTime.value,note:medNote.value.trim()});medicineForm.reset();save();renderHealth()};
function renderHealth(){
 fillHealthPeople();let today=dateKey(),a=[...s.health].filter(h=>h.date>=today).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time));
 healthList.innerHTML=a.length?a.map(h=>`<div class="row"><span>${h.kind==='visit'?'🩺':'💊'}</span><div class="grow"><b>${esc(h.title)}</b><div class="meta">${personName(h.person)} · ${longDate(dateObj(h.date))}${h.time?' · '+h.time:''}${h.dose?' · '+esc(h.dose):''}${h.note?' · '+esc(h.note):''}</div></div><button class="del" data-health="${h.id}">✕</button></div>`).join(''):'<div class="muted">Nessun evento programmato.</div>';
 healthList.querySelectorAll('[data-health]').forEach(b=>b.onclick=()=>{s.health=s.health.filter(h=>h.id!==b.dataset.health);save();renderHealth()})
}

function monthBase(offset=0){let d=new Date();d.setDate(1);d.setMonth(d.getMonth()+offset);d.setHours(12,0,0,0);return d}
function dayData(k){
 let out=[];
 let menu=s.menu[k];if(menu?.lunch)out.push(['🍝','Pranzo: '+menu.lunch]);if(menu?.dinner)out.push(['🌙','Cena: '+menu.dinner]);
 s.health.filter(h=>h.date===k).forEach(h=>out.push([h.kind==='visit'?'🩺':'💊',`${personName(h.person)}: ${h.title}${h.time?' '+h.time:''}`]));
 s.events.filter(e=>dateKey(new Date(e.at))===k).forEach(e=>out.push([META[e.type]?.[0]||'•',`${personName(e.childId)}: ${META[e.type]?.[1]||e.type} ${timeLabel(e.at)}`]));
 return out
}
function renderCalendar(){
 let base=monthBase(calOffset),y=base.getFullYear(),m=base.getMonth();calMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(base);
 let first=new Date(y,m,1,12),start=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),prevDays=new Date(y,m,0).getDate(),cells=[];
 for(let i=0;i<42;i++){let num=i-start+1,other=false,d;if(num<1){d=new Date(y,m-1,prevDays+num,12);other=true}else if(num>days){d=new Date(y,m+1,num-days,12);other=true}else d=new Date(y,m,num,12);let k=dateKey(d),has=dayData(k).length;cells.push(`<button class="calDay ${other?'other':''} ${k===dateKey()?'today':''} ${k===selectedDate?'selected':''}" data-date="${k}">${d.getDate()}${has?`<div class="dots">${Array.from({length:Math.min(has,4)},()=>'<i class="dot"></i>').join('')}</div>`:''}</button>`)}
 calendarGrid.innerHTML=cells.join('');calendarGrid.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selectedDate=b.dataset.date;renderCalendarDetails();renderCalendar()});renderCalendarDetails()
}
function renderCalendarDetails(){let d=dateObj(selectedDate),a=dayData(selectedDate);selectedDateTitle.textContent=longDate(d);calendarDetails.innerHTML=a.length?a.map(x=>`<div class="row"><span>${x[0]}</span><div class="grow">${esc(x[1])}</div></div>`).join(''):'<div class="muted">Niente in programma o registrato.</div>'}
calPrev.onclick=()=>{calOffset--;renderCalendar()};calNext.onclick=()=>{calOffset++;renderCalendar()};

function housePeriod(h,d=new Date()){if(h.frequency==='giornaliera')return dateKey(d);if(h.frequency==='settimanale'){let x=new Date(d),n=(x.getDay()+6)%7;x.setDate(x.getDate()-n);return 'W'+dateKey(x)}return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function houseDone(h){return (h.done||h.doneDates||[]).includes(housePeriod(h))}
houseForm.onsubmit=e=>{e.preventDefault();s.house.push({id:crypto.randomUUID(),text:houseText.value.trim(),owner:houseOwner.value,frequency:houseFreq.value,done:[]});houseText.value='';save();renderHouse()};
function renderHouse(){houseList.innerHTML=s.house.length?s.house.map(h=>`<div class="row ${houseDone(h)?'done':''}"><button data-house="${h.id}">${houseDone(h)?'✅':'⬜️'}</button><div class="grow"><b>${esc(h.text)}</b><div class="meta">${h.owner} · ${h.frequency}</div></div><button class="del" data-hdel="${h.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna attività.</div>';houseList.querySelectorAll('[data-house]').forEach(b=>b.onclick=()=>{let h=s.house.find(x=>x.id===b.dataset.house);h.done=h.done||h.doneDates||[];let p=housePeriod(h);h.done=h.done.includes(p)?h.done.filter(x=>x!==p):[...h.done,p];save();renderHouse()});houseList.querySelectorAll('[data-hdel]').forEach(b=>b.onclick=()=>{s.house=s.house.filter(x=>x.id!==b.dataset.hdel);save();renderHouse()})}

shopForm.onsubmit=e=>{e.preventDefault();s.shopping.push({id:crypto.randomUUID(),text:shopText.value.trim(),qty:shopQty.value.trim(),category:shopCat.value,done:false});shopText.value='';shopQty.value='';save();renderShop()};
function renderShop(){let a=[...s.shopping].sort((a,b)=>Number(a.done)-Number(b.done));shopList.innerHTML=a.length?a.map(x=>`<div class="row ${x.done?'done':''}"><button data-shop="${x.id}">${x.done?'✅':'⬜️'}</button><div class="grow"><b>${esc(x.text)}</b><div class="meta">${esc(x.category)}${x.qty?' · '+esc(x.qty):''}</div></div><button class="del" data-sdel="${x.id}">✕</button></div>`).join(''):'<div class="muted">Lista vuota.</div>';shopList.querySelectorAll('[data-shop]').forEach(b=>b.onclick=()=>{let x=s.shopping.find(i=>i.id===b.dataset.shop);x.done=!x.done;save();renderShop()});shopList.querySelectorAll('[data-sdel]').forEach(b=>b.onclick=()=>{s.shopping=s.shopping.filter(x=>x.id!==b.dataset.sdel);save();renderShop()})}

function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function moneyDate(){return monthBase(moneyOffset)}
function euro(v){return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(v)||0)}
function ensureRecurring(){let k=monthKey(moneyDate()),sources=s.expenses.filter(x=>x.recurring&&!x.sourceId),existing=new Set(s.expenses.filter(x=>x.month===k&&x.sourceId).map(x=>x.sourceId));sources.forEach(x=>{if(x.month!==k&&!existing.has(x.id))s.expenses.push({...x,id:crypto.randomUUID(),month:k,sourceId:x.id,date:k+'-01'})})}
moneyForm.onsubmit=e=>{e.preventDefault();let d=moneyDate(),k=monthKey(d);s.expenses.push({id:crypto.randomUUID(),name:moneyName.value.trim(),amount:Number(moneyAmount.value),category:moneyCat.value,recurring:moneyRecurring.checked,month:k,date:moneyOffset===0?dateKey():k+'-01'});moneyName.value='';moneyAmount.value='';moneyRecurring.checked=false;save();renderMoney()};
function renderMoney(){ensureRecurring();let d=moneyDate(),k=monthKey(d),a=s.expenses.filter(x=>x.month===k),tot=a.reduce((q,x)=>q+Number(x.amount||0),0),fixed=a.filter(x=>x.recurring).reduce((q,x)=>q+Number(x.amount||0),0);moneyMonth.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(d);moneyNext.disabled=moneyOffset>=0;moneyStats.innerHTML=[['Totale',euro(tot)],['Ricorrenti',euro(fixed)],['Variabili',euro(tot-fixed)]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');moneyList.innerHTML=a.length?a.map(x=>`<div class="row"><span>💶</span><div class="grow"><b>${esc(x.name)}</b><div class="meta">${x.category}${x.recurring?' · mensile':''}</div></div><b>${euro(x.amount)}</b><button class="del" data-exp="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna spesa.</div>';moneyList.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{s.expenses=s.expenses.filter(x=>x.id!==b.dataset.exp);save();renderMoney()});let cats={};a.forEach(x=>cats[x.category]=(cats[x.category]||0)+Number(x.amount||0));moneyCategories.innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div class="moneyCategory"><span>${esc(c)}</span><b>${euro(v)}</b></div>`).join('')||'<div class="muted">Nessun dato.</div>'}
moneyPrev.onclick=()=>{moneyOffset--;renderMoney()};moneyNext.onclick=()=>{if(moneyOffset<0){moneyOffset++;renderMoney()}};

resetBtn.onclick=()=>{if(confirm('Vuoi davvero cancellare tutti i dati salvati su questo dispositivo?')){localStorage.removeItem(KEY);s=structuredClone(DEFAULT);save();go('home')}};
function renderAll(){renderHome();if(person.classList.contains('on'))renderPerson();if(menu.classList.contains('on'))renderMenu();if(profiles.classList.contains('on'))renderProfiles();if(health.classList.contains('on'))renderHealth();if(calendar.classList.contains('on'))renderCalendar();if(house.classList.contains('on'))renderHouse();if(shop.classList.contains('on'))renderShop();if(money.classList.contains('on'))renderMoney()}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
renderHome();fillHealthPeople();
