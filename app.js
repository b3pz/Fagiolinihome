const K='familyHubV2';const D={children:[{id:'caty',name:'Caty',emoji:'👧'},{id:'kiko',name:'Kiko',emoji:'👶'}],events:[],tasks:[{id:crypto.randomUUID(),text:'Controllare la routine di oggi',owner:'Famiglia',done:false}],house:[{id:crypto.randomUUID(),text:'Riordinare cucina',owner:'Famiglia',frequency:'giornaliera',done:[]},{id:crypto.randomUUID(),text:'Pulire bagno',owner:'Famiglia',frequency:'settimanale',done:[]}],shopping:[{id:crypto.randomUUID(),text:'Pannolini',qty:'',category:'Bambini',done:false},{id:crypto.randomUUID(),text:'Salviette',qty:'',category:'Bambini',done:false}],menu:{}};let s=load(),kid='caty',off=0,hf='tutte',pending=null,qkid='caty';const M={pappa:['🍼','Pappa'],pannolino:['🚼','Pannolino'],cacca:['💩','Cacca'],nanna:['😴','Nanna'],bagnetto:['🛁','Bagnetto']};
function load(){try{let x=localStorage.getItem(K);if(x)return {...structuredClone(D),...JSON.parse(x)};let o=localStorage.getItem('familyHubV1');if(o){let p=JSON.parse(o);return {...structuredClone(D),children:p.children||D.children,events:p.events||[],tasks:p.tasks||D.tasks,shopping:(p.shopping||[]).map(x=>({...x,qty:'',category:'Altro'}))}}}catch{}return structuredClone(D)}function save(){localStorage.setItem(K,JSON.stringify(s));renderAll()}function dk(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}function dOff(n){let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d}function tm(x){return new Date(x).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}function ld(d=new Date()){return new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(d)}function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}function evs(id,d=new Date()){let k=dk(d);return s.events.filter(e=>e.childId===id&&dk(new Date(e.at))===k).sort((a,b)=>new Date(b.at)-new Date(a.at))}function cnt(id,t){return evs(id).filter(e=>e.type===t).length}function sleepActive(id){return [...s.events].reverse().find(e=>e.childId===id&&e.type==='nanna'&&!e.endAt)}function sleepMin(id){return Math.round(evs(id).filter(e=>e.type==='nanna').reduce((a,e)=>a+(new Date(e.endAt||Date.now())-new Date(e.at))/60000,0))}function dur(m){let h=Math.floor(m/60),r=m%60;return h?(r?`${h}h ${r}m`:`${h}h`):`${r}m`}
function home(){date.textContent=ld();kids.innerHTML=s.children.map(c=>`<button class="kid" data-k="${c.id}"><i>${c.emoji}</i><strong>${c.name}</strong><span class="muted">💩 ${cnt(c.id,'cacca')} · 🚼 ${cnt(c.id,'pannolino')} · 🍼 ${cnt(c.id,'pappa')}<br>😴 ${dur(sleepMin(c.id))}</span></button>`).join('');document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>openKid(b.dataset.k));let hd=s.house.filter(x=>!isDone(x)).slice(0,3);housePrev.innerHTML=hd.length?hd.map(x=>`<div class="row">🧹<div class="grow">${esc(x.text)}<div class="meta">${x.frequency} · ${x.owner}</div></div></div>`).join(''):'<div class="muted">Casa in ordine per oggi.</div>';let md=s.menu[dk()]||{};menuPrev.innerHTML=`<div class="meal"><span class="meta">🍝 Pranzo</span><b>${esc(md.pranzo||'Non impostato')}</b></div><div class="meal"><span class="meta">🌙 Cena</span><b>${esc(md.cena||'Non impostata')}</b></div>`;let tp=s.tasks.filter(x=>!x.done).slice(0,3);taskPrev.innerHTML=tp.length?tp.map(x=>`<div class="row"><span>☐</span><div>${esc(x.text)}</div></div>`).join(''):'<div class="muted">Nessun task.</div>';let sp=s.shopping.filter(x=>!x.done).slice(0,4);shopPrev.innerHTML=sp.length?sp.map(x=>`<div class="row">🛒<div>${esc(x.text)} ${x.qty?`· ${esc(x.qty)}`:''}<div class="meta">${esc(x.category)}</div></div></div>`).join(''):'<div class="muted">Lista vuota.</div>'}
function openKid(id){kid=id;off=0;go('child');renderKid()}function renderKid(){let c=s.children.find(x=>x.id===kid);kidTitle.textContent=`${c.emoji} ${c.name}`;stats.innerHTML=[[`💩 Cacche`,cnt(kid,'cacca')],[`🚼 Pannolini`,cnt(kid,'pannolino')],[`🍼 Pappe`,cnt(kid,'pappa')],[`😴 Sonno`,dur(sleepMin(kid))]].map(x=>`<div class="stat"><span class="meta">${x[0]}</span><b>${x[1]}</b></div>`).join('');let d=dOff(off);day.textContent=off===0?'Oggi':ld(d);next.disabled=off>=0;let a=evs(kid,d);timeline.innerHTML=a.length?a.map(e=>`<div class="row"><b>${tm(e.at)}</b><span>${M[e.type][0]}</span><div class="grow"><strong>${M[e.type][1]}</strong><div class="meta">${e.type==='nanna'?(e.endAt?'Fine '+tm(e.endAt)+' · '+dur(Math.round((new Date(e.endAt)-new Date(e.at))/60000)):'In corso'):esc(e.note||'')}</div></div><button class="del" data-de="${e.id}">✕</button></div>`).join(''):'<div class="muted">Nessun evento.</div>';timeline.querySelectorAll('[data-de]').forEach(b=>b.onclick=()=>{s.events=s.events.filter(e=>e.id!==b.dataset.de);save()})}prev.onclick=()=>{off--;renderKid()};next.onclick=()=>{if(off<0){off++;renderKid()}};
function addEv(id,t,n=''){s.events.push({id:crypto.randomUUID(),childId:id,type:t,note:n,at:new Date().toISOString()});save()}document.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>handleEv(kid,b.dataset.ev));function handleEv(id,t){if(t==='cacca'){pending=id;poop.showModal()}else if(t==='nanna'){pending=id;sleepText.textContent=sleepActive(id)?'Vuoi segnare il risveglio adesso?':'Vuoi segnare l’inizio della nanna adesso?';sleep.showModal()}else addEv(id,t)}poopForm.onsubmit=e=>{e.preventDefault();addEv(pending,'cacca',[poopType.value,poopNote.value.trim()].filter(Boolean).join(' · '));poopNote.value='';poop.close()};sleepForm.onsubmit=e=>{e.preventDefault();let a=sleepActive(pending);if(a)a.endAt=new Date().toISOString();else s.events.push({id:crypto.randomUUID(),childId:pending,type:'nanna',note:'',at:new Date().toISOString(),endAt:null});save();sleep.close()};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
function listTasks(){taskList.innerHTML=s.tasks.map(x=>`<div class="row ${x.done?'done':''}"><button class="check" data-tt="${x.id}">${x.done?'✓':''}</button><div class="grow">${esc(x.text)}<div class="meta">${x.owner}</div></div><button class="del" data-dt="${x.id}">✕</button></div>`).join('')||'<div class="muted">Nessun task.</div>';taskList.querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>{let x=s.tasks.find(y=>y.id===b.dataset.tt);x.done=!x.done;save()});taskList.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>{s.tasks=s.tasks.filter(x=>x.id!==b.dataset.dt);save()})}taskForm.onsubmit=e=>{e.preventDefault();let t=taskText.value.trim();if(!t)return;s.tasks.unshift({id:crypto.randomUUID(),text:t,owner:taskOwner.value,done:false});taskText.value='';save()};
function pkey(x){let d=new Date();if(x.frequency==='giornaliera')return dk(d);if(x.frequency==='settimanale'){let z=new Date(d),n=(z.getDay()+6)%7;z.setDate(z.getDate()-n);return 'W-'+dk(z)}return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}function isDone(x){return (x.done||[]).includes(pkey(x))}function listHouse(){let a=hf==='tutte'?s.house:s.house.filter(x=>x.frequency===hf);houseList.innerHTML=a.map(x=>`<div class="row ${isDone(x)?'done':''}"><button class="check" data-th="${x.id}">${isDone(x)?'✓':''}</button><div class="grow">${esc(x.text)}<div class="meta">${x.owner} · ${x.frequency}</div></div><button class="del" data-dh="${x.id}">✕</button></div>`).join('')||'<div class="muted">Nessuna attività.</div>';houseList.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{let x=s.house.find(y=>y.id===b.dataset.th),k=pkey(x);x.done=x.done||[];x.done=x.done.includes(k)?x.done.filter(z=>z!==k):[...x.done,k];save()});houseList.querySelectorAll('[data-dh]').forEach(b=>b.onclick=()=>{s.house=s.house.filter(x=>x.id!==b.dataset.dh);save()})}houseForm.onsubmit=e=>{e.preventDefault();let t=houseText.value.trim();if(!t)return;s.house.unshift({id:crypto.randomUUID(),text:t,owner:houseOwner.value,frequency:freq.value,done:[]});houseText.value='';save()};document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{hf=b.dataset.f;document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('sel',x===b));listHouse()});
function listShop(){let a=[...s.shopping].sort((a,b)=>Number(a.done)-Number(b.done));shopList.innerHTML=a.map(x=>`<div class="row ${x.done?'done':''}"><button class="check" data-ts="${x.id}">${x.done?'✓':''}</button><div class="grow">${esc(x.text)} ${x.qty?`· ${esc(x.qty)}`:''}<div class="meta">${esc(x.category)}</div></div><button class="del" data-ds="${x.id}">✕</button></div>`).join('')||'<div class="muted">Lista vuota.</div>';shopList.querySelectorAll('[data-ts]').forEach(b=>b.onclick=()=>{let x=s.shopping.find(y=>y.id===b.dataset.ts);x.done=!x.done;save()});shopList.querySelectorAll('[data-ds]').forEach(b=>b.onclick=()=>{s.shopping=s.shopping.filter(x=>x.id!==b.dataset.ds);save()})}shopForm.onsubmit=e=>{e.preventDefault();let t=shopText.value.trim();if(!t)return;s.shopping.unshift({id:crypto.randomUUID(),text:t,qty:qty.value.trim(),category:cat.value,done:false});shopText.value='';qty.value='';save()};
function menuRender(){menuDays.innerHTML='';for(let i=0;i<7;i++){let d=dOff(i),k=dk(d),m=s.menu[k]||{},el=document.createElement('div');el.className='menuDay';el.innerHTML=`<h3>${i===0?'Oggi · ':''}${ld(d)}</h3><label>🍝 Pranzo</label><input data-m="${k}" data-meal="pranzo" value="${esc(m.pranzo||'')}" placeholder="Cosa mangiamo?"><label>🌙 Cena</label><input data-m="${k}" data-meal="cena" value="${esc(m.cena||'')}" placeholder="Cosa mangiamo?">`;menuDays.appendChild(el)}menuDays.querySelectorAll('[data-m]').forEach(x=>x.onchange=()=>{s.menu[x.dataset.m]=s.menu[x.dataset.m]||{};s.menu[x.dataset.m][x.dataset.meal]=x.value.trim();save()})}
function go(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('on'));document.getElementById(v).classList.add('on');if(v==='home')home();if(v==='tasks')listTasks();if(v==='house')listHouse();if(v==='shop')listShop();if(v==='menu')menuRender();scrollTo(0,0)}document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));quick.onclick=()=>{qkid=s.children[0].id;quickRender();quickDlg.showModal()};kidsBtn.onclick=()=>{openKid(s.children[0].id)};function quickRender(){qkids.innerHTML=s.children.map(c=>`<button data-qk="${c.id}">${c.emoji} ${c.name}</button>`).join('');qkids.querySelectorAll('[data-qk]').forEach(b=>b.onclick=()=>{qkid=b.dataset.qk;quickRender()});qev.innerHTML=Object.entries(M).map(([k,v])=>`<button data-qe="${k}">${v[0]}<small>${v[1]}</small></button>`).join('');qev.querySelectorAll('[data-qe]').forEach(b=>b.onclick=()=>{quickDlg.close();handleEv(qkid,b.dataset.qe)})}reset.onclick=()=>{if(confirm('Cancellare tutti i dati su questo dispositivo?')){localStorage.removeItem(K);s=structuredClone(D);save();go('home')}};function renderAll(){home();listTasks();listHouse();listShop();if(child.classList.contains('on'))renderKid();if(menu.classList.contains('on'))menuRender()}if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));renderAll()function renderChild(){
  const child=state.children.find(c=>c.id===currentChildId);if(!child)return;
  document.getElementById("childNameTitle").textContent=`${child.emoji} ${child.name}`;
  document.getElementById("childTypeHint").textContent=child.type==="dog"?"Il nostro piccolo a quattro zampe":"La giornata di oggi";

  const quickWrap=document.querySelector("#childView .quick-grid");
  if(child.type==="dog"){
    quickWrap.innerHTML=`
      <button class="quick-action" data-event="pappa"><span>🍽️</span>Pappa</button>
      <button class="quick-action" data-event="passeggiata"><span>🦮</span>Passeggiata</button>
      <button class="quick-action" data-event="cacca"><span>💩</span>Cacca</button>
      <button class="quick-action" data-event="pipi"><span>💧</span>Pipì</button>
      <button class="quick-action" data-event="farmaco"><span>💊</span>Farmaco</button>
      <button class="quick-action" data-event="toeletta"><span>🛁</span>Toeletta</button>`;
    document.getElementById("childSummary").innerHTML=`
      <div class="stat"><div class="label">🦮 Passeggiate</div><div class="value">${countToday(child.id,"passeggiata")}</div></div>
      <div class="stat"><div class="label">🍽️ Pappe</div><div class="value">${countToday(child.id,"pappa")}</div></div>
      <div class="stat"><div class="label">💩 Cacche</div><div class="value">${countToday(child.id,"cacca")}</div></div>
      <div class="stat"><div class="label">💧 Pipì</div><div class="value">${countToday(child.id,"pipi")}</div></div>`;
  }else{
    quickWrap.innerHTML=`
      <button class="quick-action" data-event="pappa"><span>🍼</span>Pappa</button>
      <button class="quick-action" data-event="pannolino"><span>🚼</span>Pannolino</button>
      <button class="quick-action" data-event="cacca"><span>💩</span>Cacca</button>
      <button class="quick-action" data-event="nanna"><span>😴</span>Nanna</button>
      <button class="quick-action" data-event="bagnetto"><span>🛁</span>Bagnetto</button>`;
    const sleep=sleepMinutesForDay(child.id,new Date());
    document.getElementById("childSummary").innerHTML=`
      <div class="stat"><div class="label">💩 Cacche oggi</div><div class="value">${countToday(child.id,"cacca")}</div></div>
      <div class="stat"><div class="label">🚼 Pannolini</div><div class="value">${countToday(child.id,"pannolino")}</div></div>
      <div class="stat"><div class="label">🍼 Pappe</div><div class="value">${countToday(child.id,"pappa")}</div></div>
      <div class="stat"><div class="label">😴 Sonno oggi</div><div class="value">${formatDuration(sleep)}</div></div>`;
  }

  quickWrap.querySelectorAll(".quick-action[data-event]").forEach(btn=>btn.onclick=()=>{
    const type=btn.dataset.event;
    if(type==="cacca")showPoopDialog(currentChildId);
    else if(type==="nanna")handleSleep(currentChildId);
    else addEvent(currentChildId,type);
  });

  const day=dateFromOffset(childDayOffset);
  document.getElementById("childDayLabel").textContent=childDayOffset===0?"Oggi":longDate(day);
  document.getElementById("nextDayBtn").disabled=childDayOffset>=0;

  const events=eventsForDay(child.id,day);
  const timeline=document.getElementById("childTimeline");
  timeline.innerHTML=events.length?events.map(e=>{
    let note=e.note||"";
    if(e.type==="nanna"){
      note=e.endAt?`Fine ${timeLabel(e.endAt)} · ${formatDuration(Math.round((new Date(e.endAt)-new Date(e.at))/60000))}`:"In corso";
    }
    const meta=eventMeta[e.type]||{icon:"•",label:e.type};
    return `<div class="timeline-item">
      <div class="timeline-time">${timeLabel(e.at)}</div>
      <div class="timeline-icon">${meta.icon}</div>
      <div class="timeline-main"><strong>${meta.label}</strong>${note?`<div class="timeline-note">${escapeHtml(note)}</div>`:""}</div>
      <button class="edit-btn" data-edit-event="${e.id}">✎</button>
      <button class="delete-btn" data-del-event="${e.id}">✕</button>
    </div>`;
  }).join(""):`<div class="empty">Ancora niente registrato per questa giornata.</div>`;
  timeline.querySelectorAll("[data-del-event]").forEach(b=>b.onclick=()=>{state.events=state.events.filter(e=>e.id!==b.dataset.delEvent);saveState()});
  timeline.querySelectorAll("[data-edit-event]").forEach(b=>b.onclick=()=>openEditEvent(b.dataset.editEvent));
}

function renderQuickDialog(openOnly=false){
  const chooser=document.getElementById("quickChildChooser");
  chooser.innerHTML=state.children.map(c=>`<button type="button" data-qchild="${c.id}" class="${c.id===quickChildId?"selected":""}">${c.emoji} ${c.name}</button>`).join("");
  chooser.querySelectorAll("[data-qchild]").forEach(b=>b.onclick=()=>{quickChildId=b.dataset.qchild;renderQuickDialog(openOnly)});
  const selected=state.children.find(c=>c.id===quickChildId);
  const events=document.getElementById("quickEventChooser");
  if(openOnly){
    events.innerHTML=`<button type="button" class="quick-action" data-open-child="${quickChildId}"><span>📋</span>Apri scheda</button>`;
    events.querySelector("[data-open-child]").onclick=()=>{quickDialog.close();openChild(quickChildId)};
  }else{
    const keys=selected?.type==="dog"?["pappa","passeggiata","cacca","pipi","farmaco","toeletta"]:["pappa","pannolino","cacca","nanna","bagnetto"];
    events.innerHTML=keys.map(k=>`<button type="button" class="quick-action" data-qevent="${k}"><span>${eventMeta[k].icon}</span>${eventMeta[k].label}</button>`).join("");
    events.querySelectorAll("[data-qevent]").forEach(b=>b.onclick=()=>{
      const type=b.dataset.qevent;quickDialog.close();
      if(type==="cacca")showPoopDialog(quickChildId);else if(type==="nanna")handleSleep(quickChildId);else addEvent(quickChildId,type);
    });
  }
}

;