// Assemble les morceaux de parts/ en une seule page autonome, après avoir vérifié la banque de questions.
//  - equilibre-383.html : fragment (sans <html>/<head>/<body>) pour l'Artifact
//  - docs/index.html    : page complète (ouverture locale en double-clic, ou GitHub Pages)
// Usage : node build.js            (échoue si la banque a une erreur bloquante)
const fs=require('fs'),p=require('path');
const P=x=>fs.readFileSync(p.join(__dirname,'parts',x),'utf8');

// ---------- logo : la croix de l'offre et de la demande
function logo(size){ return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M6 4 V34 H37" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 9 L33 30" stroke="var(--dem)" stroke-width="3" stroke-linecap="round"/><path d="M11 30 L33 9" stroke="var(--off)" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="19.5" r="3.2" fill="currentColor"/></svg>'; }
function heroGraph(){ return '<svg class="hero-g" viewBox="0 0 400 300" aria-hidden="true" focusable="false"><g fill="none" stroke-linecap="round"><path d="M40 10 V270 H395" stroke="currentColor" stroke-width="2"/><path d="M70 40 L330 250" stroke="var(--dem)" stroke-width="5"/><path d="M140 40 L390 242" stroke="var(--dem)" stroke-width="4" stroke-dasharray="12 9"/><path d="M70 250 L340 30" stroke="var(--off)" stroke-width="5"/><path d="M40 145 H200 V270 M40 118 H233 V270" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 5"/></g><circle cx="200" cy="145" r="7" fill="currentColor"/><circle cx="233" cy="118" r="7" fill="var(--dem)"/></svg>'; }

// ---------- banque : fusion et vérification
const fiches=['b1-fiches.html','b2-fiches.html','b3-fiches.html','b4-fiches.html'].filter(f=>fs.existsSync(p.join(__dirname,'parts',f))).map(P).join('\n');
const SECS=new Set([...fiches.matchAll(/<section class="fiche" id="(s\d+)"/g)].map(m=>m[1]));
const bankDir=p.join(__dirname,'parts','bank');
let qbank=[];
for(const f of fs.readdirSync(bankDir).filter(f=>f.endsWith('.json')).sort()){
  try{ const a=JSON.parse(fs.readFileSync(p.join(bankDir,f),'utf8')); qbank=qbank.concat(a); console.log('banque',f,':',a.length,'questions'); }
  catch(e){ console.error('ERREUR JSON dans',f,':',e.message); process.exit(1); } }
const DETS=['revenu','biens_associes','gouts','nb_consommateurs','anticipations','intrants','technologie','nb_entreprises','subventions','climat'];
const DETC={revenu:'D',biens_associes:'D',gouts:'D',nb_consommateurs:'D',anticipations:'D',intrants:'O',technologie:'O',nb_entreprises:'O',subventions:'O',climat:'O'};
const errors=[], warns=[];
const ids=new Set();
const DASH=/[—–]/;
for(const q of qbank){
  const tag=(q&&q.id)||'(sans id)';
  if(!q.id) errors.push(tag+' : id manquant'); else if(ids.has(q.id)) errors.push(tag+' : id en double'); else ids.add(q.id);
  if(!SECS.has(q.s)) errors.push(tag+' : fiche inconnue '+q.s);
  if(['qcm','vf','courte','calc','prev','dev'].indexOf(q.t)<0) errors.push(tag+' : type inconnu '+q.t);
  if(!q.q||typeof q.q!=='string') errors.push(tag+' : énoncé manquant');
  if(q.t==='qcm'){ if(!Array.isArray(q.o)||q.o.length<3) errors.push(tag+' : options'); if(!(Number.isInteger(q.a)&&q.a>=0&&q.a<(q.o||[]).length)) errors.push(tag+' : index de réponse'); if(q.o&&new Set(q.o).size!==q.o.length) errors.push(tag+' : options en double'); }
  if(q.t==='vf' && typeof q.a!=='boolean') errors.push(tag+' : a doit être true/false');
  if((q.t==='qcm'||q.t==='vf') && !q.w) warns.push(tag+' : pas d\'explication');
  if(q.t==='courte'){ if(!q.m) errors.push(tag+' : réponse modèle manquante'); if(!Array.isArray(q.acc)) errors.push(tag+' : acc doit être un tableau'); }
  if(q.t==='calc'){ if(typeof q.a!=='number'||!isFinite(q.a)) errors.push(tag+' : a doit être un nombre'); if(typeof q.tol!=='number') errors.push(tag+' : tol manquant'); if(!q.m) errors.push(tag+' : solution manquante'); if(q.u===undefined) q.u=''; }
  if(q.t==='prev'){ if(q.c!=='D'&&q.c!=='O') errors.push(tag+' : c doit être D ou O'); if(q.d!==1&&q.d!==-1) errors.push(tag+' : d doit être 1 ou -1'); if(DETS.indexOf(q.det)<0) errors.push(tag+' : déterminant inconnu '+q.det); else if(DETC[q.det]!==q.c) errors.push(tag+' : déterminant '+q.det+' incompatible avec la courbe '+q.c); }
  if(q.t==='dev'){ if(!q.m) errors.push(tag+' : réponse modèle manquante'); if(!Array.isArray(q.crit)) warns.push(tag+' : pas de barème'); }
  if(DASH.test(JSON.stringify(q))) errors.push(tag+' : tiret long ou moyen');
}
const core=P('d1-core.js');
const ALL=[P('b0-topbar.html'),P('f-express.html'),fiches,P('c-views.html'),core,P('e0-graph.js'),P('e1-gen.js'),P('e2-app.js')].join('\n');
const dashLines=ALL.split('\n').map((l,i)=>[i,l]).filter(([i,l])=>DASH.test(l.replace(/\[−–—\]/g,'')));
if(dashLines.length) warns.push(dashLines.length+' ligne(s) de contenu avec un tiret long ou moyen : '+dashLines.slice(0,5).map(([i,l])=>l.trim().slice(0,70)).join(' | '));
// liens internes vers des fiches qui n'existent pas
for(const m of (P('f-express.html')+fiches).matchAll(/href="#(s\d+)"/g)){ if(!SECS.has(m[1])) errors.push('lien vers une fiche inexistante : #'+m[1]); }
if(warns.length) console.warn('AVERTISSEMENTS :\n  '+warns.slice(0,25).join('\n  '));
if(errors.length){ console.error('ERREURS ('+errors.length+') :\n  '+errors.slice(0,40).join('\n  ')); process.exit(1); }

// ---------- statistiques
const types={}; qbank.forEach(q=>types[q.t]=(types[q.t]||0)+1);
console.log('Questions :',qbank.length,'=',JSON.stringify(types));
const perS={}; qbank.forEach(q=>perS[q.s]=(perS[q.s]||0)+1); console.log('Par fiche :',Object.keys(perS).sort((a,b)=>+a.slice(1)-+b.slice(1)).map(s=>s+':'+perS[s]).join(' '));

// ---------- assemblage
const head=P('a-head.html');
const bankJs='\nconst QBANK = '+JSON.stringify(qbank)+';\n'+core+'\nconst BANK = QBANK.concat(CORE);\n';
let body=[P('b0-topbar.html'),P('f-express.html'),fiches,P('c-views.html'),'<script>',bankJs,P('e0-graph.js'),P('e1-gen.js'),P('e2-app.js'),'</script>',''].join('\n');
body=body.split('<!--LOGO-->').join(logo(34)).split('<!--HERO-->').join(heroGraph());
const frag=head+'\n'+body;
fs.writeFileSync(p.join(__dirname,'equilibre-383.html'),frag);
fs.mkdirSync(p.join(__dirname,'docs'),{recursive:true});
const full='<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="robots" content="noindex">\n'+head+'\n</head>\n<body>\n'+body+'</body>\n</html>\n';
fs.writeFileSync(p.join(__dirname,'docs','index.html'),full);
console.log('equilibre-383.html :',(frag.length/1024).toFixed(0),'Ko ; docs/index.html écrit');
