
// ------------------------------------------------------------------
// Moteur : fiches, quiz, calculs, examen blanc, cartes éclair.
// Progression 100 % localStorage (clé equilibre-383), aucun compte.
// ------------------------------------------------------------------
(function(){
const KEY='equilibre-383', DKEY='equilibre-383-draft';
const $=(s,r)=> (r||document).querySelector(s);
const $$=(s,r)=> Array.prototype.slice.call((r||document).querySelectorAll(s));
const FICHES=$$('.fiche').map(f=>f.id);
const TITLE={}; $$('.fiche').forEach(f=>TITLE[f.id]=f.getAttribute('data-title'));
const MASTERABLE=FICHES.filter(id=>id!=='s0');
const BYID={}; BANK.forEach(q=>BYID[q.id]=q);
const AUTO={qcm:1,vf:1,courte:1,calc:1,prev:1};

let state=load();
function load(){
  try{ const s=JSON.parse(localStorage.getItem(KEY)||'{}');
    return {mastered:s.mastered||{}, stats:s.stats||{}, cfg:s.cfg||null, exams:s.exams||[], calc:s.calc||{}}; }
  catch(e){ return {mastered:{},stats:{},cfg:null,exams:[],calc:{}}; }
}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(state)); }catch(e){} }
function stat(id){ return state.stats[id]||{seen:0,ok:0,ko:0,last:null}; }
function record(id,score){ const st=stat(id); st.seen++; if(score>=1) st.ok++; else st.ko++; st.last=score; state.stats[id]=st; save(); updateBadge(); }
function groupOf(s){ return GROUPS.find(g=>g.s.indexOf(s)>=0)||{id:'g0',name:'Synthèse'}; }
function toReview(){ return BANK.filter(q=>{ const st=stat(q.id); return st.seen>0 && st.last<1; }); }
function updateBadge(){ const n=toReview().length; const b=$('#n-quiz'); b.innerHTML=n?n+'<span class="lg"> à revoir</span>':''; b.style.display=n?'':'none'; }
function pct(a,b){ return b?Math.round(100*a/b):0; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt(x){ return (Math.round(x*100)/100).toString().replace('.',','); }
function lines(t){ const s=(t||'').trim(); if(!s) return 0; return s.split('\n').reduce((a,l)=>a+Math.max(1,Math.ceil(l.length/85)),0); }
function critHtml(q){ return q.crit?'<div class="crit"><b>Barème (4 points)</b><ol>'+q.crit.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ol></div>':''; }
function kwHtml(q){ return q.k?'<div class="kw">'+q.k.map(k=>'<span>'+esc(k)+'</span>').join('')+'</div>':''; }
function modelHtml(q){
  if(q.t==='dev') return '<div class="model"><span class="blabel">Réponse modèle</span>'+q.m+kwHtml(q)+'</div>'+critHtml(q);
  return '<div class="model"><span class="blabel">Réponse modèle</span><p>'+esc(q.m)+'</p>'+kwHtml(q)+'</div>';
}
// confirmation dans la page (confirm() ne s'affiche pas dans un Artifact)
function ask(msg,yes,no,okLabel){
  const d=document.createElement('div'); d.className='ask';
  d.innerHTML='<div class="ask-box" role="dialog" aria-modal="true"><p>'+esc(msg)+'</p><div class="row"><button type="button" class="btn primary" data-a="1">'+esc(okLabel||'Oui')+'</button><button type="button" class="btn ghost" data-a="0">Annuler</button></div></div>';
  document.body.appendChild(d);
  const close=v=>{ document.removeEventListener('keydown',key); d.remove(); if(v){ if(yes) yes(); } else if(no) no(); };
  const key=e=>{ if(e.key==='Escape') close(false); };
  document.addEventListener('keydown',key);
  d.addEventListener('click',e=>{ const b=e.target.closest('button[data-a]'); if(b) close(b.getAttribute('data-a')==='1'); else if(e.target===d) close(false); });
  d.querySelector('button[data-a="1"]').focus();
}
function ansHead(q){ const m=String(q.m||''); const i=m.indexOf('. '); const h=(i>0&&i<100)?m.slice(0,i):''; if(h) return h; const a=(q.acc&&q.acc[0])||''; return a.charAt(0).toUpperCase()+a.slice(1); }

// ---- correction automatique des réponses courtes et des nombres
const STOP={le:1,la:1,les:1,l:1,un:1,une:1,des:1,du:1,de:1,d:1,en:1,au:1,aux:1};
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/œ/g,'oe').replace(/[’'`]/g,' ').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w&&!STOP[w]).join(' '); }
function lev(a,b){ const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let p=[]; for(let j=0;j<=n;j++) p[j]=j; for(let i=1;i<=m;i++){ let c=[i]; for(let j=1;j<=n;j++){ c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); } p=c; } return p[n]; }
function matchShort(input,acc){
  const x=norm(input); if(!x||!acc||!acc.length) return false;
  return acc.some(a=>{ const y=norm(a); if(!y) return false; if(x===y) return true;
    const xw=x.split(' '), yw=y.split(' ');
    if(xw.length<=yw.length+3 && (' '+x+' ').indexOf(' '+y+' ')>=0) return true;
    if(/\d/.test(y)) return false;
    const d=lev(x,y); return (y.length>=5 && y.length<=8 && d<=1) || (y.length>8 && d<=2); });
}
function parseNum(s){
  let t=String(s||'').trim().replace(/[\s  ]/g,'').replace(/[$%]/g,'').replace(/[−–—]/g,'-');
  if(!t) return null;
  if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t=t.replace(/\./g,'');
  t=t.replace(',','.');
  const n=Number(t); return isFinite(n)?n:null;
}
function numOk(v,a,tol){ return v!==null && Math.abs(v-a)<=(tol||0)+1e-9; }

// ---- prévisions en 5 étapes
const S1=[['D1','Hausse de la demande'],['D-1','Baisse de la demande'],['O1','Hausse de l\'offre'],['O-1','Baisse de l\'offre']];
function prevKey(q){ return q.c+(q.d>0?'+':'-'); }
function prevAns(q){ const k=prevKey(q); return {s1:q.c+q.d, s2:q.det, s4:{'D+':1,'D-':-1,'O+':-1,'O-':1}[k], s5:{'D+':1,'D-':-1,'O+':1,'O-':-1}[k]}; }
function segHtml(name,opts,cur,attr){ return '<div class="seg" data-step="'+name+'" '+(attr||'')+'>'+opts.map(o=>'<button type="button" data-v="'+esc(o[0])+'" aria-pressed="'+(String(cur)===String(o[0]))+'">'+esc(o[1])+'</button>').join('')+'</div>'; }
function prevForm(sel,attr){
  sel=sel||{};
  const dets=Object.keys(DETS).map(k=>[k,(DETS[k].c==='D'?'D · ':'O · ')+DETS[k].n]);
  const ud=[['1','Hausse'],['-1','Baisse']];
  return '<div class="steps5" '+(attr||'')+'>'+
    '<div class="step5" data-s="s1"><span class="n">1</span><div><div class="lab">Courbe affectée et effet attendu</div>'+segHtml('s1',S1,sel.s1)+'</div></div>'+
    '<div class="step5" data-s="s2"><span class="n">2</span><div><div class="lab">Déterminant impliqué</div>'+segHtml('s2',dets,sel.s2)+'</div></div>'+
    '<div class="step5"><span class="n">3</span><div><div class="lab">Graphique du marché</div><p class="stat-line" style="margin:0">Trace-le sur une feuille (axes Prix et Quantité, courbe initiale, nouvelle courbe, E₁ et E₂), puis compare avec le corrigé.</p></div></div>'+
    '<div class="step5" data-s="s4"><span class="n">4</span><div><div class="lab">Effet sur le prix d\'équilibre</div>'+segHtml('s4',ud,sel.s4)+'</div></div>'+
    '<div class="step5" data-s="s5"><span class="n">5</span><div><div class="lab">Effet sur la quantité d\'équilibre</div>'+segHtml('s5',ud,sel.s5)+'</div></div></div>';
}
function bindPrev(box,sel,onChange){
  $$('.seg',box).forEach(seg=>seg.addEventListener('click',e=>{ const b=e.target.closest('button[data-v]'); if(!b||b.disabled) return;
    const st=seg.getAttribute('data-step'); let v=b.getAttribute('data-v'); if(st==='s4'||st==='s5') v=parseInt(v,10);
    sel[st]=v; $$('button',seg).forEach(x=>x.setAttribute('aria-pressed',String(x===b))); if(onChange) onChange(); }));
}
function prevScore(q,sel){ const a=prevAns(q); let n=0; ['s1','s2','s4','s5'].forEach(k=>{ if(String(sel[k])===String(a[k])) n++; }); return n; }
function prevMark(box,q,sel){ const a=prevAns(q);
  ['s1','s2','s4','s5'].forEach(k=>{ const st=$('.step5[data-s="'+k+'"]',box); const ok=String(sel[k])===String(a[k]); st.classList.add(ok?'ok':'ko');
    $$('.seg button',st).forEach(b=>{ b.disabled=true; const v=b.getAttribute('data-v'); if(String(v)===String(a[k])) b.classList.add('ok'); else if(String(v)===String(sel[k])) b.classList.add('ko'); }); }); }
function prevSolution(q){
  const k=prevKey(q), a=prevAns(q);
  const lab=S1.find(x=>x[0]===a.s1)[1];
  return '<div class="model"><span class="blabel">Corrigé en 5 étapes</span><ol style="margin:0 0 8px"><li><b>'+lab+'</b></li><li>Déterminant : <b>'+esc(DETS[q.det].n)+'</b></li><li>Graphique ci-dessous</li><li>Prix d\'équilibre : <b>'+(a.s4>0?'hausse ↑':'baisse ↓')+'</b></li><li>Quantité d\'équilibre : <b>'+(a.s5>0?'hausse ↑':'baisse ↓')+'</b></li></ol>'+
    '<figure class="g sm" style="max-width:360px">'+sdSVG(k,{})+'<figcaption>'+(q.c==='D'?'La demande':'L\'offre')+' se déplace '+(q.d>0?'vers la droite':'vers la gauche')+' : l\'équilibre passe de E₁ à E₂.</figcaption></figure>'+
    (q.w?'<p style="margin-top:10px">'+esc(q.w)+'</p>':'')+'</div>';
}

// ---------------- navigation
const VIEWS=['express','fiches','quiz','calc','exam','cards'];
function showView(v){
  VIEWS.forEach(x=>$('#view-'+x).classList.toggle('on',x===v));
  $$('.tab').forEach(t=>t.setAttribute('aria-selected', t.getAttribute('data-view')===v ? 'true':'false'));
  if(v==='quiz' && !quiz) renderQuizSetup();
  if(v==='calc' && !gen) renderCalcHome();
  if(v==='exam' && !exam) renderExamIntro();
  if(v==='cards' && !deck) renderCardsSetup();
}
$$('.tab').forEach(t=>t.addEventListener('click',()=>{ location.hash='#'+t.getAttribute('data-view'); }));
function route(){
  const h=(location.hash||'#express').slice(1);
  if(VIEWS.indexOf(h)>=0){ showView(h); if(h==='fiches'||h==='express') window.scrollTo(0,0); return; }
  if(/^x[a-f]$/.test(h) && $('#'+h)){ showView('express'); setTimeout(()=>{ $('#'+h).scrollIntoView({block:'start'}); },0); return; }
  if(/^s\d+$/.test(h) && $('#'+h)){ showView('fiches'); $('#toc').classList.remove('open'); setTimeout(()=>{ $('#'+h).scrollIntoView({block:'start'}); },0); return; }
  showView('express');
}
window.addEventListener('hashchange',route);
$$('.fiche').forEach(f=>f.style.scrollMarginTop='76px');

// ---------------- compte à rebours (intra : mercredi 30 septembre 2026, semaine 6)
(function(){ const el=$('#cd'); if(!el) return; const now=new Date(); const d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()); const ex=new Date(2026,8,30);
  const days=Math.round((ex-d0)/86400000);
  let txt=''; if(days>1) txt='Intra dans '+days+' jours'; else if(days===1) txt='Intra demain'; else if(days===0) txt='Intra aujourd\'hui';
  if(txt){ el.textContent=txt; el.hidden=false; } })();

// ---------------- fiches : sommaire, maîtrise, actions
const tocLinks=$$('#toc a');
$('#toc-btn').addEventListener('click',()=>$('#toc').classList.toggle('open'));
tocLinks.forEach(a=>a.addEventListener('click',()=>$('#toc').classList.remove('open')));
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ tocLinks.forEach(a=>a.classList.toggle('cur', a.getAttribute('href')==='#'+en.target.id)); } });
  },{rootMargin:'-70px 0px -75% 0px',threshold:0});
  $$('.fiche').forEach(f=>io.observe(f));
}
function refreshMastery(){
  const done=MASTERABLE.filter(id=>state.mastered[id]).length;
  $('#toc-pct').textContent=done+(done>1?' fiches maîtrisées':' fiche maîtrisée')+' sur '+MASTERABLE.length;
  $('#toc-bar').style.width=pct(done,MASTERABLE.length)+'%';
  tocLinks.forEach(a=>a.classList.toggle('done', !!state.mastered[a.getAttribute('href').slice(1)]));
  $$('.fiche').forEach(f=>{ const b=$('.btn-master',f); if(b){ const on=!!state.mastered[f.id]; b.textContent=on?'Fiche maîtrisée ✓':'Je maîtrise cette fiche'; b.classList.toggle('done',on); } });
}
$$('.fiche').forEach(f=>{
  const act=$('.sec-actions',f); if(!act) return;
  const id=f.id;
  if(id!=='s0'){ const b1=document.createElement('button'); b1.type='button'; b1.className='btn btn-master';
    b1.addEventListener('click',()=>{ state.mastered[id]=!state.mastered[id]; save(); refreshMastery(); });
    act.appendChild(b1); }
  const n=BANK.filter(q=>q.s===id && AUTO[q.t]).length;
  if(n){ const b2=document.createElement('button'); b2.type='button'; b2.className='btn primary'; b2.textContent='Quiz sur cette fiche ('+n+')';
    b2.addEventListener('click',()=>{ startQuiz({sections:[id],types:Object.keys(AUTO),n:0,prio:false,label:'Fiche '+id.slice(1)+' · '+TITLE[id]}); location.hash='#quiz'; });
    act.appendChild(b2); }
  const nd=BANK.filter(q=>q.s===id && q.t==='dev').length;
  if(nd){ const b3=document.createElement('button'); b3.type='button'; b3.className='btn ghost'; b3.textContent='Développements ('+nd+')';
    b3.addEventListener('click',()=>{ startQuiz({sections:[id],types:['dev'],n:0,prio:false,label:'Écrit · '+TITLE[id]}); location.hash='#quiz'; });
    act.appendChild(b3); }
  const gs=GENS.filter(g=>g.s===id);
  gs.forEach(g=>{ const b4=document.createElement('button'); b4.type='button'; b4.className='btn ghost'; b4.textContent='Calcul à l\'infini : '+g.name;
    b4.addEventListener('click',()=>{ location.hash='#calc'; startGen(g.id); }); act.appendChild(b4); });
});
(function(){ const act=$('#s0 .sec-actions'); if(!act) return;
  let framed=true; try{ framed=window.self!==window.top; }catch(e){}
  if(!framed){ const p=document.createElement('button'); p.type='button'; p.className='btn'; p.textContent='Imprimer les fiches'; p.addEventListener('click',()=>{ location.hash='#fiches'; setTimeout(()=>window.print(),150); }); act.appendChild(p); }
  const r=document.createElement('button'); r.type='button'; r.className='btn ghost'; r.textContent='Effacer ma progression';
  r.addEventListener('click',()=>ask('Effacer les fiches cochées, les résultats de quiz, de calculs et les examens blancs sur cet appareil ?',()=>{ state={mastered:{},stats:{},cfg:null,exams:[],calc:{}}; save(); try{localStorage.removeItem(DKEY);}catch(e){} refreshMastery(); updateBadge(); },null,'Effacer'));
  act.appendChild(r); })();

// ---------------- quiz
let quiz=null;
const qroot=$('#quiz-root');
function renderQuizSetup(){
  quiz=null;
  const cfg=state.cfg||{groups:GROUPS.map(g=>g.id),types:['qcm','vf','courte','calc','prev'],n:20,prio:false};
  const rev=toReview();
  const seen=Object.keys(state.stats).length;
  const oks=Object.keys(state.stats).reduce((a,k)=>a+state.stats[k].ok,0);
  const tot=Object.keys(state.stats).reduce((a,k)=>a+state.stats[k].seen,0);
  qroot.innerHTML=
   '<div class="card"><div class="eyebrow">Quiz</div><h2>Compose ton quiz</h2>'+
   '<p class="lead">Choisis les blocs de matière, les types de questions et le nombre. Chaque réponse est corrigée tout de suite, avec l\'explication, le graphique s\'il y a lieu, et un lien vers la fiche.</p>'+
   '<div class="field"><label>Blocs de matière</label><div class="chips" id="q-groups">'+GROUPS.map(g=>'<button type="button" class="chip" data-g="'+g.id+'" aria-pressed="'+(cfg.groups.indexOf(g.id)>=0)+'">'+g.name+'<span class="cnt">'+BANK.filter(q=>g.s.indexOf(q.s)>=0).length+'</span></button>').join('')+'</div></div>'+
   '<div class="field"><label>Types de questions</label><div class="chips" id="q-types">'+Object.keys(TYPES).map(t=>'<button type="button" class="chip" data-t="'+t+'" aria-pressed="'+(cfg.types.indexOf(t)>=0)+'">'+TYPES[t]+'<span class="cnt">'+BANK.filter(q=>q.t===t).length+'</span></button>').join('')+'</div></div>'+
   '<div class="row"><div class="field"><label for="q-n">Nombre de questions</label><select id="q-n"><option value="10">10</option><option value="20">20</option><option value="40">40</option><option value="0">Toutes</option></select></div>'+
   '<div class="field"><label>Priorité</label><button type="button" class="chip" id="q-prio" aria-pressed="'+!!cfg.prio+'">Prioriser mes erreurs</button></div></div>'+
   '<div class="row"><button type="button" class="btn primary" id="q-start">Commencer</button><span class="stat-line" id="q-avail"></span></div></div>'+
   '<div class="card"><div class="eyebrow">Ma progression</div>'+
   (seen?'<div class="score"><div><small>Questions vues</small><b>'+seen+'<span style="font-size:16px;color:var(--muted)"> / '+BANK.length+'</span></b></div><div><small>Taux de réussite</small><b>'+pct(oks,tot)+' %</b></div><div><small>À revoir</small><b>'+rev.length+'</b></div></div>'+
     '<div class="row">'+(rev.length?'<button type="button" class="btn primary" id="q-review">Refaire mes '+rev.length+' question'+(rev.length>1?'s':'')+' ratée'+(rev.length>1?'s':'')+'</button>':'')+'</div>'
    :'<p class="empty">Aucune question faite pour l\'instant. Les résultats restent sur cet appareil.</p>')+
   '</div>';
  $('#q-n').value=String(cfg.n);
  function readCfg(){ return {groups:$$('#q-groups .chip').filter(c=>c.getAttribute('aria-pressed')==='true').map(c=>c.getAttribute('data-g')), types:$$('#q-types .chip').filter(c=>c.getAttribute('aria-pressed')==='true').map(c=>c.getAttribute('data-t')), n:parseInt($('#q-n').value,10), prio:$('#q-prio').getAttribute('aria-pressed')==='true'}; }
  function avail(){ const c=readCfg(); const secs=GROUPS.filter(g=>c.groups.indexOf(g.id)>=0).reduce((a,g)=>a.concat(g.s),[]); const n=BANK.filter(q=>secs.indexOf(q.s)>=0 && c.types.indexOf(q.t)>=0).length; $('#q-avail').textContent=n+' question'+(n>1?'s':'')+' disponible'+(n>1?'s':'')+' avec ces choix'; $('#q-start').disabled=!n; return c; }
  $$('#q-groups .chip, #q-types .chip, #q-prio').forEach(c=>c.addEventListener('click',()=>{ c.setAttribute('aria-pressed', c.getAttribute('aria-pressed')==='true'?'false':'true'); avail(); }));
  $('#q-n').addEventListener('change',avail);
  avail();
  $('#q-start').addEventListener('click',()=>{ const c=avail(); state.cfg=c; save(); const secs=GROUPS.filter(g=>c.groups.indexOf(g.id)>=0).reduce((a,g)=>a.concat(g.s),[]); startQuiz({sections:secs,types:c.types,n:c.n,prio:c.prio,label:'Quiz'}); });
  const rb=$('#q-review'); if(rb) rb.addEventListener('click',()=>startQuiz({ids:rev.map(q=>q.id),n:0,label:'Mes erreurs'}));
}
const ORDER={qcm:0,vf:0,courte:0,calc:1,prev:2,dev:3};
function startQuiz(o){
  let list;
  if(o.ids){ list=BANK.filter(q=>o.ids.indexOf(q.id)>=0); }
  else { list=BANK.filter(q=>o.sections.indexOf(q.s)>=0 && o.types.indexOf(q.t)>=0); }
  shuffle(list);
  if(o.prio){ list.sort((a,b)=>{ const sa=stat(a.id), sb=stat(b.id); const ka=(sa.seen&&sa.last<1)?0:(sa.seen?2:1); const kb=(sb.seen&&sb.last<1)?0:(sb.seen?2:1); return ka-kb; }); }
  if(o.n) list=list.slice(0,o.n);
  list.sort((a,b)=>ORDER[a.t]-ORDER[b.t]);
  quiz={list:list.map(q=>({q:q, order:q.t==='qcm'?shuffle(q.o.map((_,i)=>i)):null, score:null, sel:{}})), i:0, label:o.label||'Quiz'};
  renderQuestion();
  window.scrollTo(0,0);
}
function renderQuestion(){
  const it=quiz.list[quiz.i], q=it.q, n=quiz.list.length;
  const g=groupOf(q.s);
  let body='';
  if(q.t==='qcm'){ body='<div class="opts" id="opts">'+it.order.map((oi,k)=>'<button type="button" class="opt" data-i="'+oi+'"><span class="k">'+(k+1)+'</span>'+esc(q.o[oi])+'</button>').join('')+'</div>'; }
  else if(q.t==='vf'){ body='<div class="opts" id="opts"><button type="button" class="opt" data-i="1"><span class="k">1</span>Vrai</button><button type="button" class="opt" data-i="0"><span class="k">2</span>Faux</button></div>'; }
  else if(q.t==='courte' && q.acc && q.acc.length){ body='<input type="text" id="q-in" autocomplete="off" spellcheck="false" placeholder="Ta réponse (un mot ou quelques mots)"><div class="row" style="margin-top:10px"><button type="button" class="btn primary" id="q-check">Vérifier</button><button type="button" class="btn ghost" id="q-idk">Je ne sais pas</button></div>'; }
  else if(q.t==='calc'){ body='<div class="calc-row"><span class="calc-in"><input type="text" inputmode="decimal" id="q-num" autocomplete="off" placeholder="Réponse"><span class="u">'+esc(q.u||'')+'</span></span><button type="button" class="btn primary" id="q-ncheck">Vérifier</button><button type="button" class="btn ghost" id="q-nidk">Voir la solution</button></div>'; }
  else if(q.t==='prev'){ body='<div class="mk">'+esc(q.mk||'')+'</div><div id="q-prev">'+prevForm(it.sel)+'</div><div class="row" style="margin-top:12px"><button type="button" class="btn primary" id="q-pcheck" disabled>Corriger mes 5 étapes</button></div>'; }
  else { body='<textarea id="q-text" placeholder="'+(q.t==='courte'?'Écris ta réponse en une ou deux phrases.':'Écris ta réponse ici (quelques phrases complètes, avec les bons termes), puis compare avec le corrigé.')+'"></textarea>'+(q.t==='dev'?'<div class="lines" id="q-lines">0 ligne</div>':'')+'<div class="row" style="margin-top:10px"><button type="button" class="btn primary" id="q-reveal">'+(q.t==='dev'?'Voir le corrigé et le barème':'Voir la réponse modèle')+'</button></div>'; }
  qroot.innerHTML='<div class="card"><div class="qhead"><span class="eyebrow">'+esc(quiz.label)+' · question '+(quiz.i+1)+' sur '+n+'</span><span class="qtype">'+TYPES[q.t]+' · '+esc(g.name)+'</span></div>'+
    '<div class="progress"><i style="width:'+pct(quiz.i,n)+'%"></i></div>'+
    '<div class="qtext">'+esc(q.q)+'</div>'+body+'<div id="q-fb"></div>'+
    '<div class="qnav"><button type="button" class="btn ghost" id="q-quit">Arrêter le quiz</button><span></span></div></div>';
  $('#q-quit').addEventListener('click',()=>{ const stop=()=>{ quiz=null; renderQuizSetup(); }; if(quiz.i===0) stop(); else ask('Arrêter ce quiz ? Les réponses déjà données sont retenues.',stop,null,'Arrêter'); });
  if(q.t==='qcm'||q.t==='vf'){ $$('#opts .opt').forEach(b=>b.addEventListener('click',()=>answerChoice(parseInt(b.getAttribute('data-i'),10)))); }
  else if($('#q-check')){ const inp=$('#q-in'); inp.focus({preventScroll:true});
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); checkShort(false); } });
    $('#q-check').addEventListener('click',()=>checkShort(false)); $('#q-idk').addEventListener('click',()=>checkShort(true)); }
  else if(q.t==='calc'){ const inp=$('#q-num'); inp.focus({preventScroll:true}); inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); checkCalc(false); } }); $('#q-ncheck').addEventListener('click',()=>checkCalc(false)); $('#q-nidk').addEventListener('click',()=>checkCalc(true)); }
  else if(q.t==='prev'){ const box=$('#q-prev'); bindPrev(box,it.sel,()=>{ $('#q-pcheck').disabled=!['s1','s2','s4','s5'].every(k=>it.sel[k]!==undefined); }); $('#q-pcheck').addEventListener('click',checkPrev); }
  else { $('#q-reveal').addEventListener('click',revealModel); const ta=$('#q-text'), ln=$('#q-lines'); if(ln) ta.addEventListener('input',()=>{ const k=lines(ta.value); ln.textContent=k+' ligne'+(k>1?'s':'')+' environ'; }); }
}
function fbLink(q){ return '<p style="margin-top:6px"><a href="#'+q.s+'" class="ui" style="font-size:13px">Relire la fiche : '+esc(TITLE[q.s])+'</a></p>'; }
function answerChoice(i){
  const it=quiz.list[quiz.i], q=it.q;
  const correct = q.t==='qcm' ? q.a : (q.a?1:0);
  const ok = i===correct;
  $$('#opts .opt').forEach(b=>{ b.disabled=true; const bi=parseInt(b.getAttribute('data-i'),10); if(bi===correct) b.classList.add('ok'); else if(bi===i) b.classList.add('ko'); });
  it.score=ok?1:0; record(q.id,it.score);
  $('#q-fb').innerHTML='<div class="fb '+(ok?'ok':'ko')+'"><span class="blabel">'+(ok?'Bonne réponse':'Mauvaise réponse')+'</span><p>'+esc(q.w)+'</p>'+fbLink(q)+'</div>';
  nextButton();
}
function checkShort(idk){
  const it=quiz.list[quiz.i], q=it.q; const inp=$('#q-in'); const val=inp.value;
  if(!idk && !val.trim()){ inp.focus(); return; }
  inp.disabled=true; $('#q-check').disabled=true; $('#q-idk').disabled=true;
  const ok=!idk && matchShort(val,q.acc);
  if(ok){ it.score=1; record(q.id,1);
    $('#q-fb').innerHTML='<div class="fb ok"><span class="blabel">Bonne réponse</span><p>'+esc(q.m)+'</p></div>'; nextButton(); return; }
  $('#q-fb').innerHTML='<div class="fb ko"><span class="blabel">'+(idk?'Réponse attendue':'Pas reconnue automatiquement')+'</span><p>'+esc(q.m)+'</p></div>'+
    '<div class="grade"><span class="eyebrow">'+(idk?'':'Ta réponse était-elle juste, formulée autrement ?')+'</span>'+(idk?'':'<button type="button" class="btn" data-g="1">Oui, j\'avais bon</button>')+'<button type="button" class="btn" data-g="0">'+(idk?'Continuer':'Non, raté')+'</button><a href="#'+q.s+'" class="btn ghost">Relire la fiche</a></div>';
  $$('#q-fb .grade .btn[data-g]').forEach(b=>b.addEventListener('click',()=>{ const s=parseFloat(b.getAttribute('data-g')); it.score=s; record(q.id,s); $$('#q-fb .grade .btn[data-g]').forEach(x=>{ x.disabled=true; x.classList.toggle('done',x===b); }); nextButton(); }));
}
function checkCalc(idk){
  const it=quiz.list[quiz.i], q=it.q; const inp=$('#q-num'); const v=parseNum(inp.value);
  if(!idk && v===null){ inp.focus(); return; }
  const ok=!idk && numOk(v,q.a,q.tol);
  inp.disabled=true; $('#q-ncheck').disabled=true; $('#q-nidk').disabled=true; inp.classList.add(ok?'ok':'ko');
  it.score=ok?1:0; record(q.id,it.score);
  $('#q-fb').innerHTML='<div class="fb '+(ok?'ok':'ko')+'"><span class="blabel">'+(ok?'Bonne réponse':(idk?'Solution':'Pas tout à fait'))+'</span>'+(ok?'':'<p>Réponse attendue : <b class="mono">'+esc(nf(q.a))+' '+esc(q.u||'')+'</b></p>')+'</div><div class="sol"><span class="blabel">Solution détaillée</span>'+q.m+'</div>'+fbLink(q);
  nextButton();
}
function checkPrev(){
  const it=quiz.list[quiz.i], q=it.q; const box=$('#q-prev');
  const n=prevScore(q,it.sel); prevMark(box,q,it.sel); $('#q-pcheck').disabled=true;
  it.score=n/4; record(q.id,it.score);
  $('#q-fb').innerHTML='<div class="fb '+(n===4?'ok':'ko')+'"><span class="blabel">'+n+' étape'+(n>1?'s':'')+' sur 4 réussie'+(n>1?'s':'')+'</span></div>'+prevSolution(q)+fbLink(q);
  nextButton();
}
function revealModel(){
  const it=quiz.list[quiz.i], q=it.q;
  $('#q-reveal').disabled=true;
  const written=q.t==='dev';
  const btns=written? [0,1,2,3,4].map(p=>'<button type="button" class="btn" data-g="'+(p/4)+'">'+p+' / 4</button>').join('')
    : '<button type="button" class="btn" data-g="1">Je l\'avais</button><button type="button" class="btn" data-g="0.5">À moitié</button><button type="button" class="btn" data-g="0">Raté</button>';
  $('#q-fb').innerHTML=modelHtml(q)+'<div class="grade"><span class="eyebrow">'+(written?'Ta note avec le barème :':'Auto-évaluation :')+'</span>'+btns+'</div>';
  $$('#q-fb .grade .btn').forEach(b=>b.addEventListener('click',()=>{ const s=parseFloat(b.getAttribute('data-g')); it.score=s; record(q.id,s); $$('#q-fb .grade .btn').forEach(x=>{ x.disabled=true; x.classList.toggle('done',x===b); }); nextButton(); }));
}
function nextButton(){
  const last=quiz.i===quiz.list.length-1;
  const nav=$('.qnav'); const b=document.createElement('button'); b.type='button'; b.className='btn primary'; b.textContent=last?'Voir mes résultats':'Question suivante';
  b.addEventListener('click',()=>{ if(last) renderResults(); else { quiz.i++; renderQuestion(); window.scrollTo(0,0); } });
  nav.lastElementChild.replaceWith(b); b.focus({preventScroll:true});
}
document.addEventListener('keydown',e=>{
  if(!quiz || !quiz.list || quiz.done || !$('#view-quiz').classList.contains('on')) return;
  if(e.target && (e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT'||e.target.tagName==='SELECT')) return;
  const opts=$$('#opts .opt:not(:disabled)');
  if(opts.length && /^[1-4]$/.test(e.key)){ const b=opts[parseInt(e.key,10)-1]; if(b) b.click(); }
  else if(e.key==='Enter'){ const nb=$('.qnav .btn.primary'); if(nb) nb.click(); }
});
function renderResults(){
  const L=quiz.list, n=L.length;
  const total=L.reduce((a,it)=>a+(it.score||0),0);
  const byG={}; L.forEach(it=>{ const g=groupOf(it.q.s); byG[g.id]=byG[g.id]||{name:g.name,n:0,s:0}; byG[g.id].n++; byG[g.id].s+=it.score||0; });
  const missed=L.filter(it=>(it.score||0)<1);
  const p=pct(total,n);
  const msg = p>=90?'Excellent. Cette partie est prête.': p>=75?'Solide. Relis les fiches des questions ratées et refais-les.': p>=50?'Ça avance. Concentre-toi sur les fiches ci-dessous avant de continuer.':'Relis les fiches concernées avant de refaire un quiz : ça vaut mieux que de deviner.';
  qroot.innerHTML='<div class="card"><div class="eyebrow">'+esc(quiz.label)+' · résultats</div><h2>'+fmt(total)+' sur '+n+'</h2><p class="lead">'+msg+'</p>'+
    '<div class="score"><div><small>Note</small><b>'+p+' %</b></div><div><small>Réussies</small><b>'+L.filter(it=>it.score>=1).length+'</b></div><div><small>À revoir</small><b>'+missed.length+'</b></div></div>'+
    '<ul class="bygroup">'+Object.keys(byG).map(k=>'<li><span>'+esc(byG[k].name)+'</span><span class="tnum">'+fmt(byG[k].s)+' / '+byG[k].n+'</span><span class="bar"><i style="width:'+pct(byG[k].s,byG[k].n)+'%"></i></span></li>').join('')+'</ul>'+
    '<div class="row">'+(missed.length?'<button type="button" class="btn primary" id="r-redo">Refaire les '+missed.length+' ratée'+(missed.length>1?'s':'')+'</button>':'')+'<button type="button" class="btn" id="r-new">Nouveau quiz</button><a class="btn ghost" href="#fiches">Retour aux fiches</a></div></div>'+
    (missed.length?'<div class="card"><div class="eyebrow">À revoir</div><ul class="missed">'+missed.map(it=>'<li>'+esc(it.q.q)+' <a href="#'+it.q.s+'">Fiche '+it.q.s.slice(1)+' : '+esc(TITLE[it.q.s])+'</a></li>').join('')+'</ul></div>':'');
  const rd=$('#r-redo'); if(rd) rd.addEventListener('click',()=>startQuiz({ids:missed.map(it=>it.q.id),n:0,label:'Reprise'}));
  $('#r-new').addEventListener('click',()=>{ quiz=null; renderQuizSetup(); });
  quiz={done:true,list:L,label:quiz.label};
  window.scrollTo(0,0);
}

// ---------------- calculs à l'infini
let gen=null;
const kroot=$('#calc-root');
function renderCalcHome(){
  gen=null;
  const nb=BANK.filter(q=>q.t==='calc').length;
  kroot.innerHTML='<div class="card"><div class="eyebrow">Calculs</div><h2>Des calculs à l\'infini</h2><p class="lead">Chaque exercice est tiré au hasard : de nouveaux chiffres à chaque fois, avec la solution détaillée étape par étape. Fais-en au moins deux de chaque sorte avant l\'intra.</p>'+
    '<div class="gen-list">'+GENS.map(g=>{ const c=state.calc[g.id]; return '<button type="button" class="gen" data-gen="'+g.id+'">'+(c&&c.ok?'<span class="done-n">'+c.ok+' réussi'+(c.ok>1?'s':'')+'</span>':'')+'<b>'+esc(g.name)+'</b><small>'+esc(g.desc)+' · <a href="#'+g.s+'" onclick="event.stopPropagation()">fiche '+g.s.slice(1)+'</a></small></button>'; }).join('')+'</div></div>'+
    '<div class="card"><div class="eyebrow">Banque</div><h2 style="font-size:26px">Les '+nb+' calculs rédigés</h2><p class="lead" style="font-size:17px">Des problèmes écrits à partir des exercices du prof (évaluation formative sur le PIB, prix artificiels, coût d\'option).</p><div class="row"><button type="button" class="btn primary" id="k-bank">Faire 10 calculs de la banque</button></div></div>';
  $$('.gen',kroot).forEach(b=>b.addEventListener('click',()=>startGen(b.getAttribute('data-gen'))));
  $('#k-bank').addEventListener('click',()=>{ startQuiz({sections:FICHES,types:['calc'],n:10,prio:true,label:'Calculs de la banque'}); location.hash='#quiz'; });
}
function startGen(id){
  const g=GENS.find(x=>x.id===id); if(!g) return;
  const p=g.gen(); gen={g:g,p:p,done:false};
  kroot.innerHTML='<div class="card"><div class="qhead"><span class="eyebrow">Calcul · '+esc(g.name)+'</span><span class="qtype">Fiche '+g.s.slice(1)+'</span></div>'+
    '<div class="qtext" style="font-size:18.5px">'+p.q+'</div>'+
    p.f.map((f,k)=>'<div class="calc-row"><label for="k-'+k+'" style="flex:1 1 200px">'+esc(f.l)+'</label><span class="calc-in"><input type="text" inputmode="decimal" id="k-'+k+'" autocomplete="off"><span class="u">'+esc(f.u||'')+'</span></span></div>').join('')+
    '<div class="row" style="margin-top:12px"><button type="button" class="btn primary" id="k-check">Vérifier</button><button type="button" class="btn ghost" id="k-sol">Voir la solution</button></div><div id="k-fb"></div>'+
    '<div class="qnav"><button type="button" class="btn ghost" id="k-back">Tous les calculs</button><button type="button" class="btn" id="k-new">Nouveau calcul du même type</button></div></div>';
  const first=$('#k-0'); if(first) first.focus({preventScroll:true});
  $$('.calc-in input',kroot).forEach(inp=>inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); checkGen(false); } }));
  $('#k-check').addEventListener('click',()=>checkGen(false));
  $('#k-sol').addEventListener('click',()=>checkGen(true));
  $('#k-back').addEventListener('click',()=>{ renderCalcHome(); window.scrollTo(0,0); });
  $('#k-new').addEventListener('click',()=>{ startGen(id); window.scrollTo(0,0); });
  window.scrollTo(0,0);
}
function checkGen(show){
  const p=gen.p; let good=0, filled=0;
  p.f.forEach((f,k)=>{ const inp=$('#k-'+k); const v=parseNum(inp.value); if(v!==null) filled++; const ok=numOk(v,f.a,f.tol); if(ok) good++; inp.classList.remove('ok','ko'); if(v!==null||show) inp.classList.add(ok?'ok':'ko'); });
  if(!show && !filled){ $('#k-0').focus(); return; }
  const all=good===p.f.length;
  if(!gen.done && (all||show)){ gen.done=true; const c=state.calc[gen.g.id]||{n:0,ok:0}; c.n++; if(all && !show) c.ok++; state.calc[gen.g.id]=c; save(); }
  if(all||show){ $$('.calc-in input',kroot).forEach(i=>i.disabled=true); $('#k-check').disabled=true; $('#k-sol').disabled=true; }
  $('#k-fb').innerHTML=(all?'<div class="fb ok"><span class="blabel">Tout est juste</span><p>'+good+' sur '+p.f.length+'.</p></div>':
    (show?'<div class="fb ko"><span class="blabel">Réponses attendues</span><p class="mono">'+p.f.map(f=>esc(f.l)+' : '+esc(nf(f.a))+' '+esc(f.u||'')).join('<br>')+'</p></div>':'<div class="fb ko"><span class="blabel">'+good+' sur '+p.f.length+'</span><p>Les cases en rouge sont fausses. Corrige-les, ou clique « Voir la solution ».</p></div>'))+
    (all||show?'<div class="sol"><span class="blabel">Solution détaillée</span>'+p.sol+'</div>':'');
}

// ---------------- examen blanc
// A : 16 questions à 1 pt (8 qcm, 6 vf, 2 courtes) · B : 4 calculs à 2 pts · C : 2 prévisions à 4 pts · D : 2 développements au choix sur 3, à 4 pts. Total 40.
let exam=null;
const eroot=$('#exam-root');
function loadDraft(){ try{ const d=JSON.parse(localStorage.getItem(DKEY)||'null'); if(d && d.a && d.a.every(x=>BYID[x.id]) && d.b.every(x=>BYID[x.id]) && d.c.every(x=>BYID[x.id]) && d.d.every(x=>BYID[x.id])) return d; }catch(e){} return null; }
function saveDraft(){ if(!exam||exam.submitted) return; try{ localStorage.setItem(DKEY,JSON.stringify({a:exam.a.map(x=>({id:x.q.id,order:x.order,sel:x.sel,text:x.text})),b:exam.b.map(x=>({id:x.q.id,text:x.text})),c:exam.c.map(x=>({id:x.q.id,sel:x.sel})),d:exam.d.map(x=>({id:x.q.id,pick:x.pick,text:x.text})),end:exam.end,mins:exam.mins})); }catch(e){} }
function clearDraft(){ try{ localStorage.removeItem(DKEY); }catch(e){} }
function renderExamIntro(){
  exam=null;
  const d=loadDraft();
  eroot.innerHTML='<div class="qwrap"><div class="card"><div class="eyebrow">Examen blanc</div><h2>Une copie complète, sur 40</h2>'+
    '<p class="lead">Le plan de cours dit seulement « examen individuel en classe, 15 % ». Cette copie reprend donc les formats des exercices formatifs du prof : <b>A</b>, 16 questions à choix, vrai ou faux et réponses courtes (16 pts); <b>B</b>, 4 calculs (8 pts); <b>C</b>, 2 prévisions en 5 étapes avec graphique (8 pts); <b>D</b>, 2 courts développements au choix sur 3 (8 pts).</p>'+
    '<p class="stat-line" style="margin-top:0">A, B et C sont corrigées automatiquement. Pour D, tu te notes avec le corrigé et le barème : sois sévère.</p>'+
    '<div class="field"><label for="e-dur">Durée</label><select id="e-dur"><option value="90">1 h 30</option><option value="110">1 h 50 (une séance complète)</option><option value="60">1 h (version rapide)</option><option value="0">Sans limite</option></select></div>'+
    '<div class="row"><button type="button" class="btn primary" id="e-start">Commencer l\'examen</button>'+(d?'<button type="button" class="btn" id="e-resume">Reprendre l\'examen en cours</button>':'')+'</div>'+
    '<p class="stat-line">La durée réelle de l\'intra n\'est pas indiquée dans le plan de cours.</p></div>'+
    '<div class="card"><div class="eyebrow">Mes examens blancs</div>'+(state.exams.length?'<ul class="bygroup">'+state.exams.slice().reverse().map(x=>'<li><span>'+esc(x.date)+'</span><span class="tnum">'+fmt(x.score)+' / '+x.total+'</span><span class="bar"><i style="width:'+pct(x.score,x.total)+'%"></i></span></li>').join('')+'</ul>':'<p class="empty">Aucun examen blanc fait pour l\'instant.</p>')+'</div></div>';
  $('#e-start').addEventListener('click',()=>{ const go=()=>{ clearDraft(); startExam(parseInt($('#e-dur').value,10)); }; if(d) ask('Commencer un nouvel examen ? L\'examen en cours sera abandonné.',go,null,'Nouvel examen'); else go(); });
  const rs=$('#e-resume'); if(rs) rs.addEventListener('click',()=>resumeExam(d));
}
function pickSpread(filter,count){
  const buckets=GROUPS.map(g=>shuffle(BANK.filter(q=>filter(q) && g.s.indexOf(q.s)>=0)));
  const out=[]; let guard=0;
  while(out.length<count && guard<1000){ guard++; let any=false; for(const b of shuffle(buckets.slice())){ if(out.length>=count) break; if(b.length){ out.push(b.pop()); any=true; } } if(!any) break; }
  return out;
}
function startExam(mins){
  const a=pickSpread(q=>q.t==='qcm',8).concat(pickSpread(q=>q.t==='vf',6),pickSpread(q=>q.t==='courte'&&q.acc&&q.acc.length,2));
  const b=pickSpread(q=>q.t==='calc',4), c=pickSpread(q=>q.t==='prev',2), d=pickSpread(q=>q.t==='dev',3);
  exam={a:a.map(q=>({q:q,order:q.t==='qcm'?shuffle(q.o.map((_,i)=>i)):null,sel:null,text:'',score:null,override:false})),
        b:b.map(q=>({q:q,text:'',score:null})), c:c.map(q=>({q:q,sel:{},score:null})), d:d.map(q=>({q:q,pick:false,text:'',score:null})),
        mins:mins,end:mins?Date.now()+mins*60000:0,timer:null,submitted:false};
  if(mins) exam.timer=setInterval(tickExam,1000);
  saveDraft(); renderExamPaper(); window.scrollTo(0,0);
}
function resumeExam(d){
  exam={a:d.a.map(x=>({q:BYID[x.id],order:x.order,sel:x.sel,text:x.text||'',score:null,override:false})),
        b:d.b.map(x=>({q:BYID[x.id],text:x.text||'',score:null})), c:d.c.map(x=>({q:BYID[x.id],sel:x.sel||{},score:null})), d:d.d.map(x=>({q:BYID[x.id],pick:!!x.pick,text:x.text||'',score:null})),
        mins:d.mins,end:d.end,timer:null,submitted:false};
  if(exam.end && exam.end<=Date.now()){ submitExam(true); return; }
  if(exam.end) exam.timer=setInterval(tickExam,1000);
  renderExamPaper(); window.scrollTo(0,0);
}
function tickExam(){
  if(!exam||exam.submitted) return;
  const el=$('#e-timer'); if(!el) return;
  const left=exam.end-Date.now();
  if(left<=0){ clearInterval(exam.timer); submitExam(true); return; }
  const h=Math.floor(left/3600000), m=Math.floor((left%3600000)/60000), s=Math.floor((left%60000)/1000);
  el.textContent=(h?h+' h ':'')+(m<10?'0':'')+m+':'+(s<10?'0':'')+s; el.classList.toggle('low',left<10*60000);
}
function renderExamPaper(){
  const picks=exam.d.filter(x=>x.pick).length;
  let h='<div class="ewrap"><div class="ebar"><span class="eyebrow">Examen blanc · copie</span><span class="row">'+(exam.mins?'<span class="timer" id="e-timer">--:--</span>':'')+'<button type="button" class="btn primary sm" id="e-submit-top">Remettre ma copie</button></span></div>';
  h+='<div class="paper"><div class="part-h"><h3>Partie A · Questions à répondre rapidement</h3><span class="pts">16 points · 16 × 1</span></div>';
  exam.a.forEach((it,k)=>{ const q=it.q; let body='';
    if(q.t==='qcm') body='<div class="opts">'+it.order.map((oi,j)=>'<button type="button" class="opt'+(it.sel===oi?' sel':'')+'" data-a="'+k+'" data-i="'+oi+'"><span class="k">'+String.fromCharCode(97+j)+'</span>'+esc(q.o[oi])+'</button>').join('')+'</div>';
    else if(q.t==='vf') body='<div class="opts"><button type="button" class="opt'+(it.sel===1?' sel':'')+'" data-a="'+k+'" data-i="1"><span class="k">V</span>Vrai</button><button type="button" class="opt'+(it.sel===0?' sel':'')+'" data-a="'+k+'" data-i="0"><span class="k">F</span>Faux</button></div>';
    else body='<input type="text" data-at="'+k+'" autocomplete="off" spellcheck="false" placeholder="Réponse courte" value="'+esc(it.text)+'">';
    h+='<div class="eq"><span class="n">Question '+(k+1)+' · '+TYPES[q.t]+' · 1 pt</span><div class="qtext">'+esc(q.q)+'</div>'+body+'</div>'; });
  h+='</div>';
  h+='<div class="paper"><div class="part-h"><h3>Partie B · Calculs</h3><span class="pts">8 points · 4 × 2</span></div><p class="stat-line" style="margin-top:0">Fais tes calculs sur une feuille, puis inscris le résultat (virgule ou point, les deux marchent).</p>';
  exam.b.forEach((it,k)=>{ h+='<div class="eq"><span class="n">Calcul '+(k+1)+' · 2 pts</span><div class="qtext">'+esc(it.q.q)+'</div><span class="calc-in"><input type="text" inputmode="decimal" data-bt="'+k+'" autocomplete="off" value="'+esc(it.text)+'"><span class="u">'+esc(it.q.u||'')+'</span></span></div>'; });
  h+='</div>';
  h+='<div class="paper"><div class="part-h"><h3>Partie C · Prévisions en 5 étapes</h3><span class="pts">8 points · 2 × 4</span></div>';
  exam.c.forEach((it,k)=>{ h+='<div class="eq"><span class="n">Situation '+(k+1)+' · 4 pts (1 par étape, le graphique est dans le corrigé)</span><div class="qtext">'+esc(it.q.q)+'</div><div class="mk">'+esc(it.q.mk||'')+'</div>'+prevForm(it.sel,'data-c="'+k+'"')+'</div>'; });
  h+='</div>';
  h+='<div class="paper"><div class="part-h"><h3>Partie D · Courts développements</h3><span class="pts">8 points · 2 × 4</span></div><p class="stat-line" style="margin-top:0">Choisis <b>2 questions sur 3</b>. Réponds en phrases complètes, avec les termes exacts du cours. <span id="d-count">'+picks+' / 2 choisies</span></p>';
  exam.d.forEach((it,k)=>{ const dis=!it.pick && picks>=2;
    h+='<div class="eq'+(it.pick?'':' off')+'"><label class="pick"><input type="checkbox" data-d="'+k+'"'+(it.pick?' checked':'')+(dis?' disabled':'')+'> Je choisis cette question</label><div class="qtext">'+esc(it.q.q)+'</div>'+(it.pick?'<textarea data-dt="'+k+'" placeholder="Une phrase qui répond directement, l\'explication avec les termes du cours, un exemple.">'+esc(it.text)+'</textarea><div class="lines" data-dl="'+k+'"></div>':'')+'</div>'; });
  h+='</div><div class="row" style="margin-top:18px;justify-content:space-between"><button type="button" class="btn ghost" id="e-quit">Abandonner</button><button type="button" class="btn primary" id="e-submit">Remettre ma copie</button></div></div>';
  eroot.innerHTML=h;
  if(exam.mins) tickExam();
  $$('.opt[data-a]').forEach(b=>b.addEventListener('click',()=>{ const k=parseInt(b.getAttribute('data-a'),10); exam.a[k].sel=parseInt(b.getAttribute('data-i'),10); $$('.opt[data-a="'+k+'"]').forEach(x=>x.classList.toggle('sel',x===b)); saveDraft(); }));
  $$('input[data-at]').forEach(inp=>inp.addEventListener('input',()=>{ exam.a[parseInt(inp.getAttribute('data-at'),10)].text=inp.value; saveDraft(); }));
  $$('input[data-bt]').forEach(inp=>inp.addEventListener('input',()=>{ exam.b[parseInt(inp.getAttribute('data-bt'),10)].text=inp.value; saveDraft(); }));
  $$('.steps5[data-c]').forEach(box=>{ const k=parseInt(box.getAttribute('data-c'),10); bindPrev(box,exam.c[k].sel,saveDraft); });
  $$('input[data-d]').forEach(c=>c.addEventListener('change',()=>{ const k=parseInt(c.getAttribute('data-d'),10); const it=exam.d[k];
    const apply=()=>{ it.pick=c.checked; if(!it.pick) it.text=''; saveDraft(); const y=window.scrollY; renderExamPaper(); window.scrollTo(0,y); const ta=$('textarea[data-dt="'+k+'"]'); if(ta) ta.focus({preventScroll:true}); };
    if(!c.checked && it.text.trim()){ ask('Retirer cette question ? Ta réponse sera effacée.',apply,()=>{ c.checked=true; },'Retirer'); return; }
    apply(); }));
  $$('textarea[data-dt]').forEach(ta=>{ const k=ta.getAttribute('data-dt'); const ln=$('[data-dl="'+k+'"]'); const up=()=>{ const n=lines(ta.value); ln.textContent=n?n+' ligne'+(n>1?'s':'')+' environ':''; }; up();
    ta.addEventListener('input',()=>{ exam.d[parseInt(k,10)].text=ta.value; up(); saveDraft(); }); });
  const sub=()=>{ const p=exam.d.filter(x=>x.pick).length; const miss=exam.a.filter(x=>x.sel===null&&!x.text.trim()).length+exam.b.filter(x=>!x.text.trim()).length+exam.c.filter(x=>Object.keys(x.sel).length<4).length;
    let warn=[]; if(miss) warn.push(miss+' question'+(miss>1?'s':'')+' sans réponse complète'); if(p<2) warn.push('seulement '+p+' développement'+(p>1?'s':'')+' choisi'+(p>1?'s':'')+' sur 2');
    if(!warn.length) submitExam(false); else ask('Attention : '+warn.join(', ')+'. Remettre quand même ?',()=>submitExam(false),null,'Remettre'); };
  $('#e-submit').addEventListener('click',sub); $('#e-submit-top').addEventListener('click',sub);
  $('#e-quit').addEventListener('click',()=>ask('Abandonner cet examen blanc ? Rien ne sera enregistré.',()=>{ if(exam.timer) clearInterval(exam.timer); clearDraft(); exam=null; renderExamIntro(); window.scrollTo(0,0); },null,'Abandonner'));
}
function submitExam(timeout){
  if(exam.timer) clearInterval(exam.timer);
  exam.submitted=true; clearDraft();
  exam.a.forEach(it=>{ const q=it.q;
    if(q.t==='qcm') it.score=it.sel===q.a?1:0;
    else if(q.t==='vf') it.score=(it.sel!==null && (it.sel===1)===q.a)?1:0;
    else it.score=matchShort(it.text,q.acc)?1:0;
    record(q.id,it.score); });
  exam.b.forEach(it=>{ it.score=numOk(parseNum(it.text),it.q.a,it.q.tol)?2:0; record(it.q.id,it.score/2); });
  exam.c.forEach(it=>{ it.score=prevScore(it.q,it.sel); record(it.q.id,it.score/4); });
  exam.timeout=timeout; renderCorrection(); window.scrollTo(0,0);
}
function examTotals(){
  const A=exam.a.reduce((s,it)=>s+it.score,0), Bp=exam.b.reduce((s,it)=>s+it.score,0), Cp=exam.c.reduce((s,it)=>s+it.score,0);
  const chosen=exam.d.filter(x=>x.pick); const graded=chosen.every(x=>x.score!==null);
  const D=chosen.reduce((s,x)=>s+(x.score||0),0);
  return {A:A,B:Bp,C:Cp,D:D,graded:graded,total:A+Bp+Cp+D};
}
function ptsButtons(cur,attr){ return '<div class="pts-btns" '+attr+'><span class="eyebrow">Ma note :</span>'+[0,0.5,1,1.5,2,2.5,3,3.5,4].map(p=>'<button type="button" class="btn sm'+(cur===p?' done':'')+'" data-v="'+p+'">'+fmt(p)+'</button>').join('')+'</div>'; }
function renderCorrection(){
  const T=examTotals();
  let h='<div class="ewrap"><div class="card" id="e-head">'+headHtml(T)+'</div>';
  h+='<div class="paper"><div class="part-h"><h3>Partie A · corrigée automatiquement</h3><span class="pts" id="c-a">'+fmt(T.A)+' / 16</span></div>';
  exam.a.forEach((it,k)=>{ const q=it.q; let you=''; const ok=it.score>0;
    if(q.t==='qcm') you='<p class="res '+(ok?'ok':'ko')+'">Ta réponse : <b>'+(it.sel===null?'aucune':esc(q.o[it.sel]))+'</b>'+(ok?' ✓':'')+'</p>'+(ok?'':'<p class="res">Bonne réponse : <b>'+esc(q.o[q.a])+'</b></p>')+'<p style="font-size:15px;color:var(--ink-2);margin-top:6px">'+esc(q.w)+'</p>';
    else if(q.t==='vf') you='<p class="res '+(ok?'ok':'ko')+'">Ta réponse : <b>'+(it.sel===null?'aucune':(it.sel===1?'Vrai':'Faux'))+'</b>'+(ok?' ✓':'')+'</p>'+(ok?'':'<p class="res">Bonne réponse : <b>'+(q.a?'Vrai':'Faux')+'</b></p>')+'<p style="font-size:15px;color:var(--ink-2);margin-top:6px">'+esc(q.w)+'</p>';
    else you='<p class="res '+(ok?'ok':'ko')+'">Ta réponse : <b>'+(it.text.trim()?esc(it.text):'aucune')+'</b>'+(ok?' ✓':'')+'</p><p class="res">Réponse attendue : <b>'+esc(ansHead(q))+'</b></p><p style="font-size:15px;color:var(--ink-2);margin-top:6px">'+esc(q.m)+'</p>'+
      (!ok && it.text.trim()?'<div class="grade"><button type="button" class="btn sm'+(it.override?' done':'')+'" data-ov="'+k+'">'+(it.override?'Comptée juste ✓':'Ma réponse était juste (autre formulation)')+'</button></div>':'');
    h+='<div class="eq"><span class="n">Question '+(k+1)+' · '+TYPES[q.t]+' · <a href="#'+q.s+'">fiche '+q.s.slice(1)+'</a></span><div class="qtext">'+esc(q.q)+'</div>'+you+'</div>'; });
  h+='</div>';
  h+='<div class="paper"><div class="part-h"><h3>Partie B · calculs</h3><span class="pts">'+fmt(T.B)+' / 8</span></div>';
  exam.b.forEach((it,k)=>{ const ok=it.score>0; h+='<div class="eq"><span class="n">Calcul '+(k+1)+' · <a href="#'+it.q.s+'">fiche '+it.q.s.slice(1)+'</a></span><div class="qtext">'+esc(it.q.q)+'</div><p class="res '+(ok?'ok':'ko')+'">Ta réponse : <b class="mono">'+(it.text.trim()?esc(it.text):'aucune')+'</b> '+esc(it.q.u||'')+(ok?' ✓':'')+'</p>'+(ok?'':'<p class="res">Réponse attendue : <b class="mono">'+esc(nf(it.q.a))+' '+esc(it.q.u||'')+'</b></p>')+'<div class="sol"><span class="blabel">Solution</span>'+it.q.m+'</div></div>'; });
  h+='</div>';
  h+='<div class="paper"><div class="part-h"><h3>Partie C · prévisions</h3><span class="pts">'+fmt(T.C)+' / 8</span></div>';
  exam.c.forEach((it,k)=>{ h+='<div class="eq"><span class="n">Situation '+(k+1)+' · '+it.score+' / 4 · <a href="#'+it.q.s+'">fiche '+it.q.s.slice(1)+'</a></span><div class="qtext">'+esc(it.q.q)+'</div><div class="mk">'+esc(it.q.mk||'')+'</div><div data-cc="'+k+'">'+prevForm(it.sel)+'</div>'+prevSolution(it.q)+'</div>'; });
  h+='</div>';
  const chosen=exam.d.filter(x=>x.pick);
  h+='<div class="paper"><div class="part-h"><h3>Partie D · à noter avec le barème</h3><span class="pts" id="c-d">'+fmt(T.D)+' / 8</span></div>';
  if(!chosen.length) h+='<p class="empty">Aucune question choisie.</p>';
  exam.d.forEach((it,k)=>{ if(!it.pick) return; const q=it.q;
    h+='<div class="eq"><span class="n"><a href="#'+q.s+'">fiche '+q.s.slice(1)+'</a></span><div class="qtext">'+esc(q.q)+'</div><p class="res">Ta réponse :</p><div class="fb" style="white-space:pre-wrap;margin-top:4px">'+(it.text.trim()?esc(it.text):'<span class="empty">aucune réponse</span>')+'</div>'+modelHtml(q)+ptsButtons(it.score,'data-gd="'+k+'"')+'</div>'; });
  const others=exam.d.filter(x=>!x.pick);
  if(others.length) h+='<p class="stat-line">Question non choisie (à réviser aussi) : '+others.map(x=>esc(x.q.q)).join(' · ')+'</p>';
  h+='</div></div>';
  eroot.innerHTML=h;
  $$('[data-cc]').forEach(box=>{ const k=parseInt(box.getAttribute('data-cc'),10); prevMark(box,exam.c[k].q,exam.c[k].sel); });
  bindCorrection();
}
function headHtml(T){
  const all=T.graded;
  return '<div class="eyebrow">Examen blanc · correction</div><h2>'+(all?fmt(T.total)+' / 40 · '+pct(T.total,40)+' %':'Note ta partie D')+'</h2>'+
    (exam.timeout?'<p class="lead">Le temps est écoulé : la copie a été remise automatiquement.</p>':'')+
    '<div class="score"><div><small>A · choix et courtes</small><b>'+fmt(T.A)+'<span style="font-size:16px;color:var(--muted)"> / 16</span></b></div><div><small>B · calculs</small><b>'+fmt(T.B)+'<span style="font-size:16px;color:var(--muted)"> / 8</span></b></div><div><small>C · prévisions</small><b>'+fmt(T.C)+'<span style="font-size:16px;color:var(--muted)"> / 8</span></b></div><div><small>D · développements</small><b>'+(all?fmt(T.D):'…')+'<span style="font-size:16px;color:var(--muted)"> / 8</span></b></div></div>'+
    (all?'<p class="lead">'+(T.total>=34?'Excellent : tu es prêt.':T.total>=28?'Bien. Relis les corrigés des questions où tu as perdu des points.':T.total>=24?'La note de passage est là, mais il reste du travail : reprends les fiches des questions ratées.':'Reprends l\'Express et les fiches des questions ratées, puis refais un examen blanc.')+'</p><div class="row"><button type="button" class="btn primary" id="e-again">Nouvel examen blanc</button><a class="btn ghost" href="#fiches">Retour aux fiches</a></div>'
      :'<p class="stat-line">Compare tes développements au corrigé, puis clique ta note. Une réponse sans les termes exacts du cours vaut la moitié.</p>');
}
function bindCorrection(){
  function refresh(){ const T=examTotals(); $('#e-head').innerHTML=headHtml(T); $('#c-a').textContent=fmt(T.A)+' / 16'; $('#c-d').textContent=fmt(T.D)+' / 8';
    const ag=$('#e-again'); if(ag) ag.addEventListener('click',()=>{ exam=null; renderExamIntro(); window.scrollTo(0,0); });
    if(T.graded && !exam.saved){ exam.saved=true; state.exams.push({date:new Date().toLocaleDateString('fr-CA',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}),score:T.total,total:40}); if(state.exams.length>20) state.exams.shift(); save(); }
    else if(T.graded && exam.saved){ state.exams[state.exams.length-1].score=T.total; save(); } }
  $$('[data-ov]').forEach(b=>b.addEventListener('click',()=>{ const it=exam.a[parseInt(b.getAttribute('data-ov'),10)]; it.override=!it.override; it.score=it.override?1:0; if(state.stats[it.q.id]){ state.stats[it.q.id].last=it.score; save(); updateBadge(); } b.classList.toggle('done',it.override); b.textContent=it.override?'Comptée juste ✓':'Ma réponse était juste (autre formulation)'; refresh(); }));
  $$('.pts-btns').forEach(box=>box.addEventListener('click',e=>{ const b=e.target.closest('button[data-v]'); if(!b) return; const v=parseFloat(b.getAttribute('data-v'));
    const it=exam.d[parseInt(box.getAttribute('data-gd'),10)];
    const first=it.score===null; it.score=v; if(first) record(it.q.id,v/4); else { state.stats[it.q.id].last=v/4; save(); updateBadge(); }
    $$('button[data-v]',box).forEach(x=>x.classList.toggle('done',x===b)); refresh(); }));
  refresh();
}

// ---------------- cartes éclair
let deck=null;
const croot=$('#cards-root');
function renderCardsSetup(){
  deck=null;
  const cards=BANK.filter(q=>q.t==='courte');
  croot.innerHTML='<div class="card"><div class="eyebrow">Cartes éclair</div><h2>Une question, une réponse</h2><p class="lead">Définitions, déterminants, formules : réfléchis, retourne la carte, puis dis honnêtement si tu l\'avais. Les cartes « à revoir » reviennent en fin de paquet.</p>'+
    '<div class="field"><label>Blocs de matière</label><div class="chips" id="c-groups">'+GROUPS.map(g=>'<button type="button" class="chip" data-g="'+g.id+'" aria-pressed="true">'+g.name+'<span class="cnt">'+cards.filter(q=>g.s.indexOf(q.s)>=0).length+'</span></button>').join('')+'</div></div>'+
    '<div class="row"><button type="button" class="btn primary" id="c-start">Commencer</button><span class="stat-line" id="c-avail"></span></div></div>';
  function sel(){ const gs=$$('#c-groups .chip').filter(c=>c.getAttribute('aria-pressed')==='true').map(c=>c.getAttribute('data-g')); const secs=GROUPS.filter(g=>gs.indexOf(g.id)>=0).reduce((a,g)=>a.concat(g.s),[]); const l=cards.filter(q=>secs.indexOf(q.s)>=0); $('#c-avail').textContent=l.length+' carte'+(l.length>1?'s':''); $('#c-start').disabled=!l.length; return l; }
  $$('#c-groups .chip').forEach(c=>c.addEventListener('click',()=>{ c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')==='true'?'false':'true'); sel(); }));
  sel();
  $('#c-start').addEventListener('click',()=>{ deck={queue:shuffle(sel().slice()),flipped:false,ok:0,again:0,total:0}; deck.total=deck.queue.length; renderCard(); });
}
function renderCard(){
  if(!deck.queue.length){ croot.innerHTML='<div class="card"><div class="eyebrow">Cartes éclair · terminé</div><h2>Paquet terminé</h2><div class="score"><div><small>Sues du premier coup</small><b>'+deck.ok+'</b></div><div><small>Revues</small><b>'+deck.again+'</b></div></div><div class="row"><button type="button" class="btn primary" id="c-new">Nouveau paquet</button><a class="btn ghost" href="#fiches">Retour aux fiches</a></div></div>'; $('#c-new').addEventListener('click',renderCardsSetup); return; }
  const q=deck.queue[0];
  const done=deck.total-deck.queue.length;
  croot.innerHTML='<div class="card"><div class="qhead"><span class="eyebrow">Cartes éclair · '+deck.queue.length+' restante'+(deck.queue.length>1?'s':'')+'</span><span class="qtype">'+esc(TITLE[q.s])+'</span></div>'+
    '<div class="progress"><i style="width:'+pct(Math.max(0,done),deck.total)+'%"></i></div>'+
    '<div class="flash" id="c-card" role="button" tabindex="0"><div class="side" id="c-front">'+esc(q.q)+'</div><div class="side back" id="c-back" hidden>'+(q.acc&&q.acc.length?'<p style="font-family:var(--f-display);font-size:26px;margin-bottom:6px">'+esc(ansHead(q))+'</p>':'')+'<p>'+esc(q.m)+'</p></div><div class="hint" id="c-hint">Clique ou appuie sur Espace pour retourner</div></div>'+
    '<div class="grade" id="c-grade" hidden><button type="button" class="btn" data-r="ok">Je l\'avais</button><button type="button" class="btn" data-r="again">À revoir</button><a href="#'+q.s+'" class="btn ghost">Relire la fiche</a></div>'+
    '<div class="qnav"><button type="button" class="btn ghost" id="c-quit">Arrêter</button></div></div>';
  const flip=()=>{ if(deck.flipped) return; deck.flipped=true; $('#c-front').hidden=true; $('#c-back').hidden=false; $('#c-hint').hidden=true; $('#c-grade').hidden=false; };
  $('#c-card').addEventListener('click',flip);
  $('#c-card').addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); flip(); } });
  $$('#c-grade .btn[data-r]').forEach(b=>b.addEventListener('click',()=>{ const r=b.getAttribute('data-r'); deck.queue.shift(); deck.flipped=false; if(r==='ok'){ deck.ok++; record(q.id,1); } else { deck.again++; record(q.id,0); deck.queue.push(q); } renderCard(); }));
  $('#c-quit').addEventListener('click',()=>{ deck=null; renderCardsSetup(); });
  $('#c-card').focus({preventScroll:true});
}

// ---------------- révision express : mini-tests
$$('[data-express]').forEach(b=>b.addEventListener('click',()=>{
  const k=b.getAttribute('data-express');
  if(k==='a'){ const l=shuffle(BANK.filter(q=>q.t==='qcm')).slice(0,6).concat(shuffle(BANK.filter(q=>q.t==='vf')).slice(0,4),shuffle(BANK.filter(q=>q.t==='courte'&&q.acc&&q.acc.length)).slice(0,2)); startQuiz({ids:l.map(q=>q.id),n:0,label:'Mini-test · définitions et pièges'}); location.hash='#quiz'; }
  else if(k==='prev'){ startQuiz({sections:FICHES,types:['prev'],n:4,prio:true,label:'Mini-test · prévisions'}); location.hash='#quiz'; }
  else if(k==='calc'){ startQuiz({sections:FICHES,types:['calc'],n:5,prio:true,label:'Mini-test · calculs'}); location.hash='#quiz'; }
  else if(k==='dev'){ startQuiz({sections:FICHES,types:['dev'],n:2,prio:true,label:'Mini-test · développement'}); location.hash='#quiz'; }
  else if(GENS.find(g=>g.id===k)){ location.hash='#calc'; startGen(k); }
}));
(function(){ const btn=$('#x-chrono'), out=$('#x-timer'); if(!btn) return; let t0=null, id=null;
  btn.addEventListener('click',()=>{ if(id){ clearInterval(id); id=null; btn.textContent='Relancer le chrono'; return; }
    t0=Date.now(); out.hidden=false; btn.textContent='Arrêter le chrono';
    id=setInterval(()=>{ const s=Math.floor((Date.now()-t0)/1000); const m=Math.floor(s/60); out.textContent=(m<10?'0':'')+m+':'+(s%60<10?'0':'')+(s%60); out.classList.toggle('low',m>=30); },1000); });
})();

// ---------------- démarrage
drawGraphs(document);
refreshMastery(); updateBadge();
route();
})();
