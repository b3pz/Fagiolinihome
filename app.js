const K='familyHubV2';const D={children:[{id:'caty',name:'Caty',emoji:'👧',type:'child'},{id:'kiko',name:'Kiko',emoji:'👶',type:'child'},{id:'astro',name:'Astro',emoji:'🐶',type:'dog'}],events:[],tasks:[{id:crypto.randomUUID(),text:'Controllare la routine di oggi',owner:'Famiglia',done:false}],house:[{id:crypto.randomUUID(),text:'Riordinare cucina',owner:'Famiglia',frequency:'giornaliera',done:[]},{id:crypto.randomUUID(),text:'Pulire bagno',owner:'Famiglia',frequency:'settimanale',done:[]}],shopping:[{id:crypto.randomUUID(),text:'Pannolini',qty:'',category:'Bambini',done:false},{id:crypto.randomUUID(),text:'Salviette',qty:'',category:'Bambini',done:false}],menu:{},expenses:[]};let s=load(),kid='caty',off=0,hf='tutte',pending=null,qkid='caty';const M={pappa:['🍼','Pappa'],pannolino:['🚼','Pannolino'],cacca:['💩','Cacca'],nanna:['😴','Nanna'],bagnetto:['🛁','Bagnetto'],passeggiata:['🦮','Passeggiata'],pipi:['💧','Pipì'],farmaco:['💊','Farmaco'],toeletta:['🛁','Toeletta']};
function load(){
  let out=structuredClone(D);
  try{
    let x=localStorage.getItem(K);
    if(x) out={...out,...JSON.parse(x)};
    else{
      let o=localStorage.getItem('familyHubV1');
      if(o){
        let p=JSON.parse(o);
        out={...out,children:p.children||D.children,events:p.events||[],tasks:p.tasks||D.tasks,shopping:(p.shopping||[]).map(x=>({...x,qty:'',category:'Altro'}))};
      }
    }
  }catch{}
  out.children=(out.children||[]).map(c=>{
    if(c.id==='domenico'||c.name==='Domenico')return {...c,id:'kiko',name:'Kiko',emoji:'👶',type:'child'};
    if(c.id==='caty')return {...c,name:'Caty',emoji:'👧',type:'child'};
    if(c.id==='kiko')return {...c,name:'Kiko',emoji:'👶',type:'child'};
    if(c.id==='astro')return {...c,name:'Astro',emoji:'🐶',type:'dog'};
    return c;
  });
  if(!out.children.some(c=>c.id==='astro'))out.children.push({id:'astro',name:'Astro',emoji:'🐶',type:'dog'});
  out.events=(out.events||[]).map(e=>e.childId==='domenico'?{...e,childId:'kiko'}:e);
  out.tasks=(out.tasks||[]).map(t=>({...t,owner:t.owner==='Papà'?'JJ':t.owner==='Mamma'?'Kiki':t.owner}));
  out.house=(out.house||[]).map(t=>({...t,owner:t.owner==='Papà'?'JJ':t.owner==='Mamma'?'Kiki':t.owner}));
  out.expenses=Array.isArray(out.expenses)?out.expenses:[];
  return out
}function save(){localStorage.setItem(K,JSON.stringify(s));renderAll()}function dk(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}function dOff(n){let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d}function tm(x){return new Date(x).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}function ld(d=new Date()){return new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(d)}function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}function evs(id,d=new Date()){let k=dk(d);return s.events.filter(e=>e.childId===id&&dk(new Date(e.at))===k).sort((a,b)=>new Date(b.at)-new Date(a.at))}function cnt(id,t){return evs(id).filter(e=>e.type===t).length}function sleepActive(id){return [...s.events].reverse().find(e=>e.childId===id&&e.type==='nanna'&&!e.endAt)}function sleepMin(id){return Math.round(evs(id).filter(e=>e.type==='nanna').reduce((a,e)=>a+(new Date(e.endAt||Date.now())-new Date(e.at))/60000,0))}function dur(m){let h=Math.floor(m/60),r=m%60;return h?(r?`${h}h ${r}m`:`${h}h`):`${r}m`}
function home(){
  date.textContent=ld();
  kids.innerHTML=s.children.map(c=>{
    if(c.type==='dog'){
      let a=evs(c.id),walk=a.find(e=>e.type==='passeggiata'),food=a.find(e=>e.type==='pappa');
      return `<button class="kid pet" data-k="${c.id}"><i>${c.emoji}</i><strong>${c.name}</strong><span class="muted">🦮 ${walk?tm(walk.at):'—'} · 🍽️ ${food?tm(food.at):'—'}<br>💩 ${cnt(c.id,'cacca')} oggi</span></button>`
    }
    return `<button class="kid" data-k="${c.id}"><i>${c.emoji}</i><strong>${c.name}</strong><span class="muted">💩 ${cnt(c.id,'cacca')} · 🚼 ${cnt(c.id,'pannolino')} · 🍼 ${cnt(c.id,'pappa')}<br>😴 ${dur(sleepMin(c.id))}</span></button>`
  }).join('');
  document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>openKid(b.dataset.k));
  let hd=s.house.filter(x=>!isDone(x)).slice(0,3);
  housePrev.innerHTML=hd.length?hd.map(x=>`<div class="row">🧹<div class="grow">${esc(x.text)}<div class="meta">${x.frequency} · ${x.owner}</div></div></div>`).join(''):'<div class="muted">Casa in ordine per oggi.</div>';
  let md=s.menu[dk()]||{};
  menuPrev.innerHTML=`<div class="meal"><span class="meta">🍝 Pranzo</span><b>${esc(md.pranzo||'Non impostato')}</b></div><div class="meal"><span class="meta">🌙 Cena</span><b>${esc(md.cena||'Non impostata')}</b></div>`;
  let tp=s.tasks.filter(x=>!x.done).slice(0,3);
  taskPrev.innerHTML=tp.length?tp.map(x=>`<div class="row"><span>☐</span><div>${esc(x.text)}</div></div>`).join(''):'<div class="muted">Nessun task.</div>';
  let sp=s.shopping.filter(x=>!x.done).slice(0,4);
  shopPrev.innerHTML=sp.length?sp.map(x=>`<div class="row">🛒<div>${esc(x.text)} ${x.qty?`· ${esc(x.qty)}`:''}<div class="meta">${esc(x.category)}</div></div></div>`).join(''):'<div class="muted">Lista vuota.</div>';
  if(typeof moneyPrev!=='undefined')renderMoneyPrev()
}
function openKid(id){kid=id;off=0;go('child');renderKid()}function renderKid(){
  let c=s.children.find(x=>x.id===kid);
  kidTitle.textContent=`${c.emoji} ${c.name}`;
  let actionBox=document.querySelector('#child .actions');
  if(c.type==='dog'){
    stats.innerHTML=[[`🦮 Passeggiate`,cnt(kid,'passeggiata')],[`🍽️ Pappe`,cnt(kid,'pappa')],[`💩 Cacche`,cnt(kid,'cacca')],[`💧 Pipì`,cnt(kid,'pipi')]].map(x=>`<div class="stat"><span class="meta">${x[0]}</span><b>${x[1]}</b></div>`).join('');
    actionBox.innerHTML=`<button data-ev="pappa">🍽️<small>Pappa</small></button><button data-ev="passeggiata">🦮<small>Passeggiata</small></button><button data-ev="cacca">💩<small>Cacca</small></button><button data-ev="pipi">💧<small>Pipì</small></button><button data-ev="farmaco">💊<small>Farmaco</small></button><button data-ev="toeletta">🛁<small>Toeletta</small></button>`;
  }else{
    stats.innerHTML=[[`💩 Cacche`,cnt(kid,'cacca')],[`🚼 Pannolini`,cnt(kid,'pannolino')],[`🍼 Pappe`,cnt(kid,'pappa')],[`😴 Sonno`,dur(sleepMin(kid))]].map(x=>`<div class="stat"><span class="meta">${x[0]}</span><b>${x[1]}</b></div>`).join('');
    actionBox.innerHTML=`<button data-ev="pappa">🍼<small>Pappa</small></button><button data-ev="pannolino">🚼<small>Pannolino</small></button><button data-ev="cacca">💩<small>Cacca</small></button><button data-ev="nanna">😴<small>Nanna</small></button><button data-ev="bagnetto">🛁<small>Bagnetto</small></button>`;
  }
  actionBox.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>handleEv(kid,b.dataset.ev));
  let d=dOff(off);day.textContent=off===0?'Oggi':ld(d);next.disabled=off>=0;let a=evs(kid,d);
  timeline.innerHTML=a.length?a.map(e=>{let mm=M[e.type]||['•',e.type];return `<div class="row"><b>${tm(e.at)}</b><span>${mm[0]}</span><div class="grow"><strong>${mm[1]}</strong><div class="meta">${e.type==='nanna'?(e.endAt?'Fine '+tm(e.endAt)+' · '+dur(Math.round((new Date(e.endAt)-new Date(e.at))/60000)):'In corso'):esc(e.note||'')}</div></div><button class="del" data-de="${e.id}">✕</button></div>`}).join(''):'<div class="muted">Nessun evento.</div>';
  timeline.querySelectorAll('[data-de]').forEach(b=>b.onclick=()=>{s.events=s.events.filter(e=>e.id!==b.dataset.de);save()})
}
prev.onclick=()=>{off--;renderKid()};next.onclick=()=>{if(off<0){off++;renderKid()}};
function addEv(id,t,n=''){s.events.push({id:crypto.randomUUID(),childId:id,type:t,note:n,at:new Date().toISOString()});save()}function handleEv(id,t){if(t==='cacca'){pending=id;poop.showModal()}else if(t==='nanna'){pending=id;sleepText.textContent=sleepActive(id)?'Vuoi segnare il risveglio adesso?':'Vuoi segnare l’inizio della nanna adesso?';sleep.showModal()}else addEv(id,t)}poopForm.onsubmit=e=>{e.preventDefault();addEv(pending,'cacca',[poopType.value,poopNote.value.trim()].filter(Boolean).join(' · '));poopNote.value='';poop.close()};sleepForm.onsubmit=e=>{e.preventDefault();let a=sleepActive(pending);if(a)a.endAt=new Date().toISOString();else s.events.push({id:crypto.randomUUID(),childId:pending,type:'nanna',note:'',at:new Date().toISOString(),endAt:null});save();sleep.close()};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
function listTasks(){taskList.innerHTML=s.tasks.map(x=>`<div class="row ${x.done?'done':''}"><button class="check" data-tt="${x.id}">${x.done?'✓':''}</button><div class="grow">${esc(x.text)}<div class="meta">${x.owner}</div></div><button class="del" data-dt="${x.id}">✕</button></div>`).join('')||'<div class="muted">Nessun task.</div>';taskList.querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>{let x=s.tasks.find(y=>y.id===b.dataset.tt);x.done=!x.done;save()});taskList.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>{s.tasks=s.tasks.filter(x=>x.id!==b.dataset.dt);save()})}taskForm.onsubmit=e=>{e.preventDefault();let t=taskText.value.trim();if(!t)return;s.tasks.unshift({id:crypto.randomUUID(),text:t,owner:taskOwner.value,done:false});taskText.value='';save()};
function pkey(x){let d=new Date();if(x.frequency==='giornaliera')return dk(d);if(x.frequency==='settimanale'){let z=new Date(d),n=(z.getDay()+6)%7;z.setDate(z.getDate()-n);return 'W-'+dk(z)}return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}function isDone(x){return (x.done||[]).includes(pkey(x))}function listHouse(){let a=hf==='tutte'?s.house:s.house.filter(x=>x.frequency===hf);houseList.innerHTML=a.map(x=>`<div class="row ${isDone(x)?'done':''}"><button class="check" data-th="${x.id}">${isDone(x)?'✓':''}</button><div class="grow">${esc(x.text)}<div class="meta">${x.owner} · ${x.frequency}</div></div><button class="del" data-dh="${x.id}">✕</button></div>`).join('')||'<div class="muted">Nessuna attività.</div>';houseList.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{let x=s.house.find(y=>y.id===b.dataset.th),k=pkey(x);x.done=x.done||[];x.done=x.done.includes(k)?x.done.filter(z=>z!==k):[...x.done,k];save()});houseList.querySelectorAll('[data-dh]').forEach(b=>b.onclick=()=>{s.house=s.house.filter(x=>x.id!==b.dataset.dh);save()})}houseForm.onsubmit=e=>{e.preventDefault();let t=houseText.value.trim();if(!t)return;s.house.unshift({id:crypto.randomUUID(),text:t,owner:houseOwner.value,frequency:freq.value,done:[]});houseText.value='';save()};document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{hf=b.dataset.f;document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('sel',x===b));listHouse()});
function listShop(){let a=[...s.shopping].sort((a,b)=>Number(a.done)-Number(b.done));shopList.innerHTML=a.map(x=>`<div class="row ${x.done?'done':''}"><button class="check" data-ts="${x.id}">${x.done?'✓':''}</button><div class="grow">${esc(x.text)} ${x.qty?`· ${esc(x.qty)}`:''}<div class="meta">${esc(x.category)}</div></div><button class="del" data-ds="${x.id}">✕</button></div>`).join('')||'<div class="muted">Lista vuota.</div>';shopList.querySelectorAll('[data-ts]').forEach(b=>b.onclick=()=>{let x=s.shopping.find(y=>y.id===b.dataset.ts);x.done=!x.done;save()});shopList.querySelectorAll('[data-ds]').forEach(b=>b.onclick=()=>{s.shopping=s.shopping.filter(x=>x.id!==b.dataset.ds);save()})}shopForm.onsubmit=e=>{e.preventDefault();let t=shopText.value.trim();if(!t)return;s.shopping.unshift({id:crypto.randomUUID(),text:t,qty:qty.value.trim(),category:cat.value,done:false});shopText.value='';qty.value='';save()};
function menuRender(){menuDays.innerHTML='';for(let i=0;i<7;i++){let d=dOff(i),k=dk(d),m=s.menu[k]||{},el=document.createElement('div');el.className='menuDay';el.innerHTML=`<h3>${i===0?'Oggi · ':''}${ld(d)}</h3><label>🍝 Pranzo</label><input data-m="${k}" data-meal="pranzo" value="${esc(m.pranzo||'')}" placeholder="Cosa mangiamo?"><label>🌙 Cena</label><input data-m="${k}" data-meal="cena" value="${esc(m.cena||'')}" placeholder="Cosa mangiamo?">`;menuDays.appendChild(el)}menuDays.querySelectorAll('[data-m]').forEach(x=>x.onchange=()=>{s.menu[x.dataset.m]=s.menu[x.dataset.m]||{};s.menu[x.dataset.m][x.dataset.meal]=x.value.trim();save()})}

let moff=0;
function mdate(){let d=new Date();d.setDate(1);d.setMonth(d.getMonth()+moff);return d}
function mkey(d=mdate()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function eur(v){return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(v)||0)}
function mitems(){let k=mkey();return s.expenses.filter(x=>x.month===k)}
function renderMoneyPrev(){
  let k=new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0'),a=s.expenses.filter(x=>x.month===k),t=a.reduce((q,x)=>q+Number(x.amount||0),0);
  moneyPrev.innerHTML=`<div class="moneyPrev"><span>Spese questo mese</span><b>${eur(t)}</b></div><div class="meta">${a.length} voci registrate</div>`
}
function repeatExpenses(){
  let k=mkey(),sources=s.expenses.filter(x=>x.repeat&&!x.sourceId),existing=new Set(s.expenses.filter(x=>x.month===k&&x.sourceId).map(x=>x.sourceId));
  sources.forEach(x=>{if(x.month!==k&&!existing.has(x.id))s.expenses.push({id:crypto.randomUUID(),name:x.name,amount:x.amount,category:x.category,month:k,repeat:true,sourceId:x.id})})
}
function renderMoney(){
  repeatExpenses();
  let d=mdate(),a=mitems(),tot=a.reduce((q,x)=>q+Number(x.amount||0),0),fix=a.filter(x=>x.repeat).reduce((q,x)=>q+Number(x.amount||0),0);
  mLabel.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(d);
  mNext.disabled=moff>=0;
  moneyStats.innerHTML=`<div class="stat"><span class="meta">TOTALE MESE</span><b>${eur(tot)}</b></div><div class="stat"><span class="meta">RICORRENTI</span><b>${eur(fix)}</b></div><div class="stat"><span class="meta">VARIABILI</span><b>${eur(tot-fix)}</b></div>`;
  moneyCount.textContent=a.length+' voci';
  moneyList.innerHTML=a.length?a.map(x=>`<div class="row"><span>${micon(x.category)}</span><div class="grow"><strong>${esc(x.name)}</strong><div class="meta">${esc(x.category)}${x.repeat?' · mensile':''}</div></div><b>${eur(x.amount)}</b><button class="del" data-dm="${x.id}">✕</button></div>`).join(''):'<div class="muted">Nessuna spesa questo mese.</div>';
  moneyList.querySelectorAll('[data-dm]').forEach(b=>b.onclick=()=>{s.expenses=s.expenses.filter(x=>x.id!==b.dataset.dm);save()});
  let cats={};a.forEach(x=>cats[x.category]=(cats[x.category]||0)+Number(x.amount||0));
  moneyCats.innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="catrow"><span>${micon(k)} ${esc(k)}</span><b>${eur(v)}</b></div>`).join('')||'<div class="muted">Nessun dato.</div>'
}
function micon(c){return ({Casa:'🏠',Bollette:'💡',Spesa:'🛒',Bambini:'👶',Cane:'🐶',Auto:'🚗',Svago:'🎬',Altro:'💶'})[c]||'💶'}
moneyForm.onsubmit=e=>{e.preventDefault();let n=moneyName.value.trim(),a=parseFloat(moneyAmount.value);if(!n||!Number.isFinite(a))return;s.expenses.push({id:crypto.randomUUID(),name:n,amount:a,category:moneyCat.value,month:mkey(),repeat:moneyRepeat.checked});moneyName.value='';moneyAmount.value='';moneyRepeat.checked=false;save()};
mPrev.onclick=()=>{moff--;renderMoney()};mNext.onclick=()=>{if(moff<0){moff++;renderMoney()}};
function go(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('on'));document.getElementById(v).classList.add('on');if(v==='home')home();if(v==='tasks')listTasks();if(v==='house')listHouse();if(v==='shop')listShop();if(v==='menu')menuRender();if(v==='money')renderMoney();scrollTo(0,0)}document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));quick.onclick=()=>{qkid=s.children[0].id;quickRender();quickDlg.showModal()};homeSegna.onclick=()=>{qkid=s.children[0].id;quickRender();quickDlg.showModal()};function quickRender(){
  qkids.innerHTML=s.children.map(c=>`<button data-qk="${c.id}">${c.emoji} ${c.name}</button>`).join('');
  qkids.querySelectorAll('[data-qk]').forEach(b=>b.onclick=()=>{qkid=b.dataset.qk;quickRender()});
  let c=s.children.find(x=>x.id===qkid),keys=c?.type==='dog'?['pappa','passeggiata','cacca','pipi','farmaco','toeletta']:['pappa','pannolino','cacca','nanna','bagnetto'];
  qev.innerHTML=keys.map(k=>`<button data-qe="${k}">${M[k][0]}<small>${M[k][1]}</small></button>`).join('');
  qev.querySelectorAll('[data-qe]').forEach(b=>b.onclick=()=>{quickDlg.close();handleEv(qkid,b.dataset.qe)})
}reset.onclick=()=>{if(confirm('Cancellare tutti i dati su questo dispositivo?')){localStorage.removeItem(K);s=structuredClone(D);save();go('home')}};function renderAll(){home();listTasks();listHouse();listShop();if(child.classList.contains('on'))renderKid();if(menu.classList.contains('on'))menuRender();if(money.classList.contains('on'))renderMoney()}if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));renderAll();