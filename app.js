
const STORAGE_KEY = "familyHubV1";
const defaultState = {
  children: [
    { id: "caty", name: "Caty", emoji: "👧" },
    { id: "domenico", name: "Domenico", emoji: "👶" }
  ],
  events: [],
  tasks: [
    { id: crypto.randomUUID(), text: "Controllare la routine di oggi", owner: "Famiglia", done: false }
  ],
  shopping: [
    { id: crypto.randomUUID(), text: "Pannolini", done: false },
    { id: crypto.randomUUID(), text: "Salviette", done: false }
  ]
};

let state = loadState();
let currentChildId = "caty";
let quickChildId = "caty";
let pendingPoopChildId = null;

const eventMeta = {
  pappa: { icon: "🍼", label: "Pappa" },
  pannolino: { icon: "🚼", label: "Pannolino" },
  cacca: { icon: "💩", label: "Cacca" },
  nanna: { icon: "😴", label: "Nanna" },
  bagnetto: { icon: "🛁", label: "Bagnetto" }
};

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return structuredClone(defaultState);
  try{
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      children: parsed.children?.length ? parsed.children : defaultState.children
    };
  }catch{
    return structuredClone(defaultState);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function todayKey(date = new Date()){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

function timeLabel(iso){
  return new Date(iso).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
}

function dateLabel(){
  return new Intl.DateTimeFormat("it-IT",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
}

function childEvents(childId){
  const tk = todayKey();
  return state.events
    .filter(e => e.childId === childId && todayKey(new Date(e.at)) === tk)
    .sort((a,b) => new Date(b.at)-new Date(a.at));
}

function lastEvent(childId,type){
  return childEvents(childId).find(e=>e.type===type);
}

function renderHome(){
  document.getElementById("todayDate").textContent = dateLabel();

  const cards = document.getElementById("childrenCards");
  cards.innerHTML = state.children.map(c=>{
    const poop = lastEvent(c.id,"cacca");
    const diaper = lastEvent(c.id,"pannolino");
    return `
      <button class="child-card" data-child="${c.id}">
        <span class="avatar">${c.emoji}</span>
        <strong>${c.name}</strong>
        <div class="mini">💩 ${poop ? timeLabel(poop.at) : "—"} &nbsp; 🚼 ${diaper ? timeLabel(diaper.at) : "—"}</div>
      </button>`;
  }).join("");

  cards.querySelectorAll("[data-child]").forEach(btn=>{
    btn.addEventListener("click",()=>openChild(btn.dataset.child));
  });

  renderTaskPreview();
  renderShoppingPreview();
}

function renderTaskPreview(){
  const box = document.getElementById("todayTasks");
  const active = state.tasks.filter(t=>!t.done).slice(0,4);
  box.innerHTML = active.length ? active.map(t=>`
    <div class="list-row">
      <span class="checkbox"></span>
      <div class="grow">${escapeHtml(t.text)}<div class="owner">${escapeHtml(t.owner)}</div></div>
    </div>`).join("") : `<div class="empty">Nessun task da fare.</div>`;
}

function renderShoppingPreview(){
  const box = document.getElementById("shoppingPreview");
  const active = state.shopping.filter(i=>!i.done).slice(0,4);
  box.innerHTML = active.length ? active.map(i=>`
    <div class="list-row"><span>🛒</span><div class="grow">${escapeHtml(i.text)}</div></div>`
  ).join("") : `<div class="empty">Lista della spesa vuota.</div>`;
}

function openChild(id){
  currentChildId = id;
  showView("child");
  renderChild();
}

function renderChild(){
  const child = state.children.find(c=>c.id===currentChildId);
  if(!child) return;
  document.getElementById("childNameTitle").textContent = `${child.emoji} ${child.name}`;

  const events = childEvents(child.id);
  const types = ["cacca","pannolino","pappa","nanna"];
  const summary = document.getElementById("childSummary");
  summary.innerHTML = types.map(type=>{
    const last = events.find(e=>e.type===type);
    return `<div class="stat">
      <div class="label">${eventMeta[type].icon} Ultima ${eventMeta[type].label.toLowerCase()}</div>
      <div class="value">${last ? timeLabel(last.at) : "—"}</div>
    </div>`;
  }).join("");

  document.getElementById("eventCount").textContent = `${events.length} eventi`;
  const timeline = document.getElementById("childTimeline");
  timeline.innerHTML = events.length ? events.map(e=>`
    <div class="timeline-item">
      <div class="timeline-time">${timeLabel(e.at)}</div>
      <div class="timeline-icon">${eventMeta[e.type].icon}</div>
      <div class="timeline-main">
        <strong>${eventMeta[e.type].label}</strong>
        ${e.note ? `<div class="timeline-note">${escapeHtml(e.note)}</div>` : ""}
      </div>
      <button class="delete-btn" data-del-event="${e.id}">✕</button>
    </div>
  `).join("") : `<div class="empty">Nessun evento registrato oggi.</div>`;

  timeline.querySelectorAll("[data-del-event]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.events = state.events.filter(e=>e.id!==btn.dataset.delEvent);
      saveState();
    })
  });
}

function addEvent(childId,type,note=""){
  state.events.push({
    id: crypto.randomUUID(),
    childId,
    type,
    note,
    at: new Date().toISOString()
  });
  saveState();
}

function showPoopDialog(childId){
  pendingPoopChildId = childId;
  document.getElementById("poopNote").value = "";
  document.getElementById("poop-normal").checked = true;
  document.getElementById("poopDialog").showModal();
}

document.querySelectorAll(".quick-action").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const type = btn.dataset.event;
    if(type==="cacca") showPoopDialog(currentChildId);
    else addEvent(currentChildId,type);
  });
});

document.getElementById("poopForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const type = new FormData(e.target).get("poopType");
  const extra = document.getElementById("poopNote").value.trim();
  const note = [type,extra].filter(Boolean).join(" · ");
  addEvent(pendingPoopChildId || currentChildId,"cacca",note);
  document.getElementById("poopDialog").close();
});

document.getElementById("closePoopDialog").addEventListener("click",()=>document.getElementById("poopDialog").close());

function renderTasks(){
  const box = document.getElementById("tasksList");
  box.innerHTML = state.tasks.length ? state.tasks.map(t=>`
    <div class="list-row ${t.done?"done":""}">
      <button class="checkbox" data-toggle-task="${t.id}">${t.done?"✓":""}</button>
      <div class="grow">${escapeHtml(t.text)}<div class="owner">${escapeHtml(t.owner)}</div></div>
      <button class="delete-btn" data-delete-task="${t.id}">✕</button>
    </div>`).join("") : `<div class="empty">Nessun task.</div>`;

  box.querySelectorAll("[data-toggle-task]").forEach(btn=>btn.addEventListener("click",()=>{
    const t=state.tasks.find(x=>x.id===btn.dataset.toggleTask); if(t)t.done=!t.done; saveState();
  }));
  box.querySelectorAll("[data-delete-task]").forEach(btn=>btn.addEventListener("click",()=>{
    state.tasks=state.tasks.filter(x=>x.id!==btn.dataset.deleteTask); saveState();
  }));
}

document.getElementById("taskForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const input=document.getElementById("taskInput");
  const text=input.value.trim();
  if(!text)return;
  state.tasks.unshift({id:crypto.randomUUID(),text,owner:document.getElementById("taskOwner").value,done:false});
  input.value="";
  saveState();
});

function renderShopping(){
  const box = document.getElementById("shoppingList");
  box.innerHTML = state.shopping.length ? state.shopping.map(i=>`
    <div class="list-row ${i.done?"done":""}">
      <button class="checkbox" data-toggle-shop="${i.id}">${i.done?"✓":""}</button>
      <div class="grow">${escapeHtml(i.text)}</div>
      <button class="delete-btn" data-delete-shop="${i.id}">✕</button>
    </div>`).join("") : `<div class="empty">Lista vuota.</div>`;
  box.querySelectorAll("[data-toggle-shop]").forEach(btn=>btn.addEventListener("click",()=>{
    const i=state.shopping.find(x=>x.id===btn.dataset.toggleShop); if(i)i.done=!i.done; saveState();
  }));
  box.querySelectorAll("[data-delete-shop]").forEach(btn=>btn.addEventListener("click",()=>{
    state.shopping=state.shopping.filter(x=>x.id!==btn.dataset.deleteShop); saveState();
  }));
}

document.getElementById("shoppingForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const input=document.getElementById("shoppingInput");
  const text=input.value.trim();
  if(!text)return;
  state.shopping.unshift({id:crypto.randomUUID(),text,done:false});
  input.value="";
  saveState();
});

function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  const map={home:"homeView",child:"childView",tasks:"tasksView",shopping:"shoppingView"};
  document.getElementById(map[name]).classList.add("active");
  document.querySelectorAll(".nav-item[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===name));
  if(name==="tasks")renderTasks();
  if(name==="shopping")renderShopping();
  if(name==="home")renderHome();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll("[data-nav]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.nav)));

const quickDialog=document.getElementById("quickDialog");
document.getElementById("quickAddBtn").addEventListener("click",()=>{
  renderQuickDialog();
  quickDialog.showModal();
});
document.getElementById("childrenNavBtn").addEventListener("click",()=>{
  quickChildId=state.children[0].id;
  renderQuickDialog(true);
  quickDialog.showModal();
});

function renderQuickDialog(openOnly=false){
  const chooser=document.getElementById("quickChildChooser");
  chooser.innerHTML=state.children.map(c=>`<button type="button" data-qchild="${c.id}" class="${c.id===quickChildId?"selected":""}">${c.emoji} ${c.name}</button>`).join("");
  chooser.querySelectorAll("[data-qchild]").forEach(btn=>btn.addEventListener("click",()=>{
    quickChildId=btn.dataset.qchild;
    renderQuickDialog(openOnly);
  }));

  const events=document.getElementById("quickEventChooser");
  if(openOnly){
    events.innerHTML=`<button type="button" class="quick-action" data-open-child="${quickChildId}"><span>📋</span>Apri scheda</button>`;
    events.querySelector("[data-open-child]").addEventListener("click",()=>{
      quickDialog.close();
      openChild(quickChildId);
    });
  }else{
    events.innerHTML=Object.entries(eventMeta).map(([key,m])=>`
      <button type="button" class="quick-action" data-qevent="${key}"><span>${m.icon}</span>${m.label}</button>`).join("");
    events.querySelectorAll("[data-qevent]").forEach(btn=>btn.addEventListener("click",()=>{
      const type=btn.dataset.qevent;
      quickDialog.close();
      if(type==="cacca") showPoopDialog(quickChildId);
      else addEvent(quickChildId,type);
    }));
  }
}

document.getElementById("resetBtn").addEventListener("click",()=>{
  if(confirm("Vuoi cancellare tutti i dati salvati su questo dispositivo?")){
    localStorage.removeItem(STORAGE_KEY);
    state=structuredClone(defaultState);
    saveState();
    showView("home");
  }
});

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function renderAll(){
  renderHome();
  renderTasks();
  renderShopping();
  if(document.getElementById("childView").classList.contains("active"))renderChild();
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

renderAll();
