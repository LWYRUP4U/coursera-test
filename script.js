// ---- Navigation ----
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('section.page');
function showPage(id){
  pages.forEach(p=>p.classList.toggle('active', p.id === id));
  navLinks.forEach(l=>l.classList.toggle('active', l.dataset.target === id));
  const first = document.getElementById(id);
  if(first) first.scrollIntoView({behavior:'instant', block:'start'});
  document.querySelector('.content').scrollTo(0,0);
  window.scrollTo(0,0);
  localStorage.setItem('sp101_lastpage', id);
  document.getElementById('topbar-title').textContent = document.querySelector('#'+id+' .page-head h1')?.textContent || 'Español 101';
  document.getElementById('sidebar').classList.remove('open');
}
navLinks.forEach(l=>l.addEventListener('click', ()=>showPage(l.dataset.target)));
document.getElementById('menu-btn').addEventListener('click', ()=>document.getElementById('sidebar').classList.toggle('open'));

const startPage = localStorage.getItem('sp101_lastpage') || 'home';
showPage(document.getElementById(startPage) ? startPage : 'home');

// ---- Global search across vocab + phrases ----
const globalSearch = document.getElementById('global-search');
globalSearch.addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('.vocab-item').forEach(li=>{
    const match = !q || li.dataset.es.includes(q) || li.dataset.en.includes(q);
    li.classList.toggle('hide', !match);
  });
  document.querySelectorAll('.vocab-card').forEach(card=>{
    const anyVisible = [...card.querySelectorAll('.vocab-item')].some(li=>!li.classList.contains('hide'));
    card.classList.toggle('hide', !anyVisible);
  });
  document.querySelectorAll('table.tbl tbody tr').forEach(tr=>{
    if(!tr.closest('#vocab, #phrases')) return;
    const text = tr.textContent.toLowerCase();
    tr.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
  if(q){ showPage('vocab'); }
});

// ---- Vocab category chip filter ----
document.querySelectorAll('.chip[data-cat]').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('.chip[data-cat]').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    const cat = chip.dataset.cat;
    document.querySelectorAll('.vocab-card').forEach(card=>{
      const show = cat === 'all' || card.querySelector('h4').textContent.trim() === cat;
      card.classList.toggle('hide', !show);
    });
  });
});

// ---- Study Tracker (localStorage) ----
const STUDY_KEY = 'sp101_study_log';
const seedStudy = [{"date": "2026-06-23", "topic": "Alphabet & pronunciation", "minutes": 30, "confidence": 4, "notes": "Comfortable with vowels"}, {"date": "2026-06-24", "topic": "Gender & articles", "minutes": 25, "confidence": 3, "notes": "Need more practice with exceptions"}, {"date": "2026-06-25", "topic": "Present tense -AR verbs", "minutes": 40, "confidence": 4, "notes": "Felt confident"}, {"date": "2026-06-26", "topic": "Ser vs Estar", "minutes": 35, "confidence": 3, "notes": "Still mixing them up sometimes"}, {"date": "2026-06-27", "topic": "Reflexive pronouns", "minutes": 20, "confidence": 3, "notes": "Daily routine vocab practice"}, {"date": "2026-06-28", "topic": "Preterite vs Imperfect", "minutes": 45, "confidence": 2, "notes": "Tricky — needs review"}, {"date": "2026-06-29", "topic": "Numbers & telling time", "minutes": 30, "confidence": 4, "notes": "Good progress"}];
function loadStudy(){
  const raw = localStorage.getItem(STUDY_KEY);
  return raw ? JSON.parse(raw) : seedStudy;
}
function saveStudy(rows){ localStorage.setItem(STUDY_KEY, JSON.stringify(rows)); renderStudy(); }
function renderStudy(){
  const rows = loadStudy();
  const tbody = document.getElementById('study-body');
  tbody.innerHTML = rows.map((r,i)=>`<tr><td>${r.date}</td><td>${r.topic}</td><td>${r.minutes}</td><td>${r.confidence}/5</td><td>${r.notes||''}</td><td><button class="btn secondary" data-i="${i}" onclick="delStudy(${i})">Delete</button></td></tr>`).join('');
  const totalMin = rows.reduce((a,r)=>a+Number(r.minutes||0),0);
  const avgConf = rows.length ? (rows.reduce((a,r)=>a+Number(r.confidence||0),0)/rows.length).toFixed(1) : 0;
  document.getElementById('study-total-min').textContent = totalMin;
  document.getElementById('study-total-hr').textContent = (totalMin/60).toFixed(1);
  document.getElementById('study-avg-conf').textContent = avgConf;
  document.getElementById('study-days').textContent = rows.length;
}
function delStudy(i){ const rows = loadStudy(); rows.splice(i,1); saveStudy(rows); }
document.getElementById('study-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = e.target;
  const rows = loadStudy();
  rows.push({date:f.date.value || new Date().toISOString().slice(0,10), topic:f.topic.value, minutes:f.minutes.value, confidence:f.confidence.value, notes:f.notes.value});
  saveStudy(rows);
  f.reset();
});
renderStudy();

// ---- Listening Log (localStorage) ----
const LISTEN_KEY = 'sp101_listen_log';
const seedListen = [{"date": "2026-06-23", "title": "Destinos (intro ep.)", "type": "TV series", "minutes": 25, "subs": "Spanish subs", "comp": 2}, {"date": "2026-06-24", "title": "Easy Spanish (street interviews)", "type": "YouTube", "minutes": 15, "subs": "Spanish subs", "comp": 3}, {"date": "2026-06-25", "title": "Dreaming Spanish (beginner)", "type": "YouTube", "minutes": 20, "subs": "No subs", "comp": 2}, {"date": "2026-06-26", "title": "Notes in Spanish (podcast)", "type": "Podcast", "minutes": 30, "subs": "None", "comp": 2}, {"date": "2026-06-27", "title": "Extr@ en español Ep.1", "type": "TV series", "minutes": 22, "subs": "English subs", "comp": 3}, {"date": "2026-06-28", "title": "Coffee Break Spanish", "type": "Podcast", "minutes": 18, "subs": "None", "comp": 3}, {"date": "2026-06-29", "title": "Pablo el Patagónico", "type": "YouTube", "minutes": 12, "subs": "Spanish subs", "comp": 4}];
function loadListen(){ const raw = localStorage.getItem(LISTEN_KEY); return raw ? JSON.parse(raw) : seedListen; }
function saveListen(rows){ localStorage.setItem(LISTEN_KEY, JSON.stringify(rows)); renderListen(); }
function renderListen(){
  const rows = loadListen();
  const tbody = document.getElementById('listen-body');
  tbody.innerHTML = rows.map((r,i)=>`<tr><td>${r.date}</td><td>${r.title}</td><td>${r.type}</td><td>${r.minutes}</td><td>${r.subs}</td><td>${r.comp}/5</td><td><button class="btn secondary" onclick="delListen(${i})">Delete</button></td></tr>`).join('');
  const totalMin = rows.reduce((a,r)=>a+Number(r.minutes||0),0);
  const avgComp = rows.length ? (rows.reduce((a,r)=>a+Number(r.comp||0),0)/rows.length).toFixed(1) : 0;
  document.getElementById('listen-total-min').textContent = totalMin;
  document.getElementById('listen-total-hr').textContent = (totalMin/60).toFixed(1);
  document.getElementById('listen-avg-comp').textContent = avgComp;
  document.getElementById('listen-sessions').textContent = rows.length;
  // by type bars
  const byType = {};
  rows.forEach(r=>{ byType[r.type] = (byType[r.type]||0) + Number(r.minutes||0); });
  const max = Math.max(1, ...Object.values(byType));
  const bars = document.getElementById('listen-bars');
  bars.innerHTML = Object.entries(byType).map(([t,m])=>`
    <div class="bar-row"><div>${t}</div><div class="bar-track"><div class="bar-fill" style="width:${(m/max*100).toFixed(0)}%"></div></div><div>${m}m</div></div>
  `).join('') || '<p class="note">No sessions logged yet.</p>';
}
function delListen(i){ const rows = loadListen(); rows.splice(i,1); saveListen(rows); }
document.getElementById('listen-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = e.target;
  const rows = loadListen();
  rows.push({date:f.date.value || new Date().toISOString().slice(0,10), title:f.title.value, type:f.type.value, minutes:f.minutes.value, subs:f.subs.value, comp:f.comp.value});
  saveListen(rows);
  f.reset();
});
renderListen();

// ---- Progress Dashboard (localStorage skill ratings) ----
const SKILL_KEY = 'sp101_skills';
const seedSkills = {"Reading": 3, "Writing": 2, "Listening": 2, "Speaking": 2, "Grammar — present tense": 4, "Grammar — past tense": 2, "Vocabulary": 3, "Pronunciation": 3};
function loadSkills(){ const raw = localStorage.getItem(SKILL_KEY); return raw ? JSON.parse(raw) : seedSkills; }
function saveSkills(obj){ localStorage.setItem(SKILL_KEY, JSON.stringify(obj)); renderSkills(); }
function renderSkills(){
  const skills = loadSkills();
  const wrap = document.getElementById('skills-wrap');
  wrap.innerHTML = Object.entries(skills).map(([name,val])=>`
    <div class="bar-row">
      <div>${name}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${val*20}%"></div></div>
      <div><input type="range" min="1" max="5" value="${val}" data-skill="${name}" style="width:70px;vertical-align:middle;"></div>
    </div>`).join('');
  wrap.querySelectorAll('input[type=range]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      const cur = loadSkills();
      cur[inp.dataset.skill] = Number(inp.value);
      saveSkills(cur);
    });
  });
  // combined hours
  const studyMin = loadStudy().reduce((a,r)=>a+Number(r.minutes||0),0);
  const listenMin = loadListen().reduce((a,r)=>a+Number(r.minutes||0),0);
  document.getElementById('combined-hours').textContent = ((studyMin+listenMin)/60).toFixed(1);
  document.getElementById('combined-study').textContent = (studyMin/60).toFixed(1);
  document.getElementById('combined-listen').textContent = (listenMin/60).toFixed(1);
}
renderSkills();

// re-render skills combined hours whenever study/listen change too
const _origSaveStudy = saveStudy; saveStudy = function(r){ _origSaveStudy(r); renderSkills(); };
const _origSaveListen = saveListen; saveListen = function(r){ _origSaveListen(r); renderSkills(); };
