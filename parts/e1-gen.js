
// ------------------------------------------------------------------
// Générateurs de calculs : des chiffres différents à chaque fois, avec la solution détaillée.
// Chaque générateur renvoie {q: HTML de l'énoncé, f: [{l: libellé, a: réponse, tol, u: unité}], sol: HTML}
// ------------------------------------------------------------------
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function ri(a,b){ return a+Math.floor(Math.random()*(b-a+1)); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function nf(x,d){ // format québécois : 12 345,67
  const neg=x<0; x=Math.abs(x); let s=(d===undefined?(Math.round(x*100)/100).toString():x.toFixed(d));
  let [i,f]=s.split('.'); i=i.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return (neg?'−':'')+i+(f?','+f:''); }
function r2(x){ return Math.round(x*100)/100; }
function r1(x){ return Math.round(x*10)/10; }
const NOMS=['Léa','Mathis','Chloé','Samuel','Maëlle','Noah','Rosalie','William','Florence','Jacob','Alice','Thomas','Zoé','Olivier','Camille'];

const GENS=[
{id:'opp',s:'s2',name:'Coût d\'option',desc:'Salaire perdu, intérêts perdus, meilleure option abandonnée',
 gen(){ const who=pick(NOMS), k=ri(0,2);
  if(k===0){ const h=ri(3,8), r=pick([15.75,16.10,16.50,17.25,18,18.75,19.50,20.25]); const a=r2(h*r);
    return {q:'<p>'+who+' peut faire un quart de travail de <b>'+h+' heures à '+nf(r,2)+' $/h</b> au dépanneur samedi, mais choisit plutôt d\'aller aux pommes avec ses amis. Quel est son coût d\'option ?</p>',
      f:[{l:'Coût d\'option',a:a,tol:0.01,u:'$'}],
      sol:'<p>Le coût d\'option, c\'est la valeur de la meilleure option abandonnée : le salaire du quart de travail.</p><p class="mono">'+h+' h × '+nf(r,2)+' $/h = <b>'+nf(a,2)+' $</b></p>'}; }
  if(k===1){ const m=ri(4,40)*500, t=pick([2,2.5,3,3.5,4,4.5,5,6]); const a=r2(m*t/100); const obj=pick(['une moto usagée','un ordinateur de jeu','un voyage à Cuba','des meubles pour son appartement']);
    return {q:'<p>'+who+' a <b>'+nf(m)+' $</b>. Il pourrait les placer dans un compte qui rapporte <b>'+nf(t)+' % par année</b>, mais il les dépense pour '+obj+'. Selon la méthode du corrigé du prof, quel est le coût d\'option de cet achat pour une année ?</p>',
      f:[{l:'Coût d\'option',a:a,tol:0.01,u:'$'}],
      sol:'<p>Le coût d\'option est ce que la meilleure option abandonnée aurait rapporté : les intérêts d\'un an.</p><p class="mono">'+nf(m)+' $ × '+nf(t)+' % = '+nf(m)+' × '+nf(t/100,3).replace(/0+$/,'')+' = <b>'+nf(a,2)+' $</b></p>'}; }
  const x=ri(6,15)*10, y=ri(6,15)*10+5, z=ri(4,12)*10; const best=Math.max(x,y,z);
  return {q:'<p>Dimanche, '+who+' a trois possibilités payantes : garder les enfants du voisin (<b>'+x+' $</b>), aider son oncle à déménager (<b>'+y+' $</b>) ou tondre des pelouses (<b>'+z+' $</b>). '+who+' choisit finalement de passer la journée à étudier pour l\'intra d\'économie. Quel est son coût d\'option ?</p>',
    f:[{l:'Coût d\'option',a:best,tol:0,u:'$'}],
    sol:'<p>Le coût d\'option n\'est pas la somme des options : c\'est la valeur de la <b>meilleure</b> option abandonnée, soit la plus payante.</p><p class="mono">max('+x+' ; '+y+' ; '+z+') = <b>'+best+' $</b></p>'}; }},

{id:'dep',s:'s14',name:'PIB par la méthode des dépenses',desc:'C + I + G + XN, avec des pièges à exclure',
 gen(){ const C=ri(55,75)*10+ri(0,9), I=ri(15,25)*10+ri(0,9), G=ri(20,30)*10+ri(0,9), X=ri(30,60)*10+ri(0,9), M=ri(30,60)*10+ri(0,9);
  const traps=shuffle([['Achats de voitures d\'occasion',ri(3,9)*10],['Achats d\'actions et d\'obligations',ri(5,15)*10],['Farine et levure achetées par les boulangeries',ri(2,8)*10],['Achats de maisons déjà construites (revente)',ri(4,12)*10]]).slice(0,2);
  const rows=shuffle([['Dépenses de consommation des ménages',C],['Investissement des entreprises (machines, bâtiments, stocks)',I],['Dépenses des administrations publiques',G],['Exportations',X],['Importations',M]].concat(traps));
  const XN=X-M, P=C+I+G+XN;
  return {q:'<p>Calculez le PIB selon la méthode des dépenses (en millions de $). Attention : certains postes ne doivent pas être comptés.</p><div class="tbl-wrap"><table class="data"><thead><tr><th>Poste</th><th>Millions $</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+nf(r[1])+'</td></tr>').join('')+'</tbody></table></div>',
   f:[{l:'Exportations nettes (XN)',a:XN,tol:0,u:'millions $'},{l:'PIB',a:P,tol:0,u:'millions $'}],
   sol:'<p><b>XN</b> = exportations − importations = '+nf(X)+' − '+nf(M)+' = <b>'+nf(XN)+'</b></p><p><b>PIB</b> = C + I + G + XN = '+nf(C)+' + '+nf(I)+' + '+nf(G)+' + ('+nf(XN)+') = <b>'+nf(P)+' millions $</b></p><p>Exclus : '+traps.map(t=>t[0].toLowerCase()).join(' ; ')+'. (Biens d\'occasion : déjà comptés l\'année de leur production. Valeurs mobilières : titres de propriété, pas de la production. Biens intermédiaires : déjà inclus dans le prix du bien final.)</p>'}; }},

{id:'nr',s:'s15',name:'PIB nominal, PIB réel et IIP',desc:'Deux biens, une année de base, une année courante',
 gen(){ const b=pick([['Bananes','sacs'],['Pommes','caisses'],['Pizzas','boîtes']]), c=pick([['Vélos','unités'],['Livres','unités'],['Chandails','unités']]);
  const y0=ri(2018,2021), y1=y0+ri(1,3);
  const q0a=ri(8,20)*10, p0a=ri(2,12), q0b=ri(3,12)*5, p0b=ri(10,60);
  const q1a=q0a+ri(-2,5)*5, p1a=p0a+ri(0,4), q1b=q0b+ri(-1,4)*5, p1b=p0b+ri(-3,12);
  const nom1=q1a*p1a+q1b*p1b, reel1=q1a*p0a+q1b*p0b, iip=r2(nom1/reel1*100);
  return {q:'<p>Une petite économie produit deux biens. <b>'+y0+' est l\'année de base.</b> Calculez le PIB nominal de '+y1+', le PIB réel de '+y1+' (aux prix de '+y0+') et l\'IIP (déflateur) de '+y1+', arrondi à deux décimales.</p><div class="tbl-wrap"><table class="data"><thead><tr><th></th><th>Qté '+y0+'</th><th>Prix '+y0+'</th><th>Qté '+y1+'</th><th>Prix '+y1+'</th></tr></thead><tbody><tr><td>'+b[0]+'</td><td>'+q0a+'</td><td>'+p0a+' $</td><td>'+q1a+'</td><td>'+p1a+' $</td></tr><tr><td>'+c[0]+'</td><td>'+q0b+'</td><td>'+p0b+' $</td><td>'+q1b+'</td><td>'+p1b+' $</td></tr></tbody></table></div>',
   f:[{l:'PIB nominal '+y1,a:nom1,tol:0,u:'$'},{l:'PIB réel '+y1,a:reel1,tol:0,u:'$'},{l:'IIP '+y1,a:iip,tol:0.011,u:''}],
   sol:'<p><b>PIB nominal '+y1+'</b> = prix de '+y1+' × quantités de '+y1+' = ('+p1a+' × '+q1a+') + ('+p1b+' × '+q1b+') = '+nf(p1a*q1a)+' + '+nf(p1b*q1b)+' = <b>'+nf(nom1)+' $</b></p><p><b>PIB réel '+y1+'</b> = prix de '+y0+' (base) × quantités de '+y1+' = ('+p0a+' × '+q1a+') + ('+p0b+' × '+q1b+') = '+nf(p0a*q1a)+' + '+nf(p0b*q1b)+' = <b>'+nf(reel1)+' $</b></p><p><b>IIP '+y1+'</b> = PIB nominal ÷ PIB réel × 100 = '+nf(nom1)+' ÷ '+nf(reel1)+' × 100 = <b>'+nf(iip,2)+'</b>. '+(iip>100?'Les prix ont augmenté d\'environ '+nf(r1(iip-100))+' % depuis l\'année de base.':iip<100?'Les prix ont baissé d\'environ '+nf(r1(100-iip))+' % depuis l\'année de base.':'Les prix n\'ont pas changé.')+'</p><p>Rappel : pour l\'année de base, PIB nominal = PIB réel et IIP = 100.</p>'}; }},

{id:'tab',s:'s15',name:'Compléter le tableau du PIB',desc:'Trouver le nominal, le réel ou l\'IIP manquant',
 gen(){ const base=ri(2019,2024); const rows=[]; let reel=ri(18000,26000)+ri(0,99)/100; const kinds=shuffle(['iip','reel','nom']);
  for(let k=0;k<3;k++){ const y=base-1+k; const iip=y===base?100:r2(100+(y-base)*ri(150,320)/100+ri(-40,40)/100); reel=r2(reel*(1+ri(-8,40)/1000)); const nom=r2(reel*iip/100); rows.push({y:y,nom:nom,iip:iip,reel:reel,miss:y===base?(kinds[k]==='iip'?'nom':kinds[k]):kinds[k]}); }
  const f=[], sol=[];
  rows.forEach(r=>{ if(r.miss==='iip'){ const a=r2(r.nom/r.reel*100); r.iip=a; f.push({l:'IIP '+r.y,a:a,tol:0.011,u:''}); sol.push('<p><b>IIP '+r.y+'</b> = nominal ÷ réel × 100 = '+nf(r.nom,2)+' ÷ '+nf(r.reel,2)+' × 100 = <b>'+nf(a,2)+'</b></p>'); }
    else if(r.miss==='reel'){ const a=r.nom/r.iip*100; f.push({l:'PIB réel '+r.y,a:r2(a),tol:0.011,u:'G$'}); sol.push('<p><b>PIB réel '+r.y+'</b> = nominal ÷ IIP × 100 = '+nf(r.nom,2)+' ÷ '+nf(r.iip,2)+' × 100 = <b>'+nf(a,2)+'</b></p>'); }
    else { const a=r.reel*r.iip/100; f.push({l:'PIB nominal '+r.y,a:r2(a),tol:0.011,u:'G$'}); sol.push('<p><b>PIB nominal '+r.y+'</b> = réel × IIP ÷ 100 = '+nf(r.reel,2)+' × '+nf(r.iip,2)+' ÷ 100 = <b>'+nf(a,2)+'</b></p>'); } });
  const cell=(r,k)=>r.miss===k?'<td class="miss">?</td>':'<td>'+nf(k==='iip'?r.iip:r[k],2)+'</td>';
  return {q:'<p>Complétez le tableau (milliards de $, <b>'+base+' = 100</b>). Arrondissez à deux décimales.</p><div class="tbl-wrap"><table class="data"><thead><tr><th>Année</th><th>PIB nominal</th><th>IIP</th><th>PIB réel</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+r.y+'</td>'+cell(r,'nom')+cell(r,'iip')+cell(r,'reel')+'</tr>').join('')+'</tbody></table></div>',
   f:f, sol:sol.join('')+'<p>Les trois formules viennent toutes de <span class="mono">IIP = PIB nominal ÷ PIB réel × 100</span>. Petit contrôle : si l\'IIP dépasse 100, le nominal est plus grand que le réel; sous 100, il est plus petit.</p>'}; }},

{id:'cr',s:'s16',name:'Taux de croissance',desc:'Croissance du PIB réel, récession ou non',
 gen(){ const y=ri(2015,2025); const a=ri(1800,2600); const g=pick([ri(-35,-5),ri(5,45),ri(5,45),ri(10,60)])/10; const b=Math.round(a*(1+g/100)); const t=(b-a)/a*100;
  return {q:'<p>Le PIB réel d\'un pays était de <b>'+nf(a)+' milliards $</b> en '+y+' et de <b>'+nf(b)+' milliards $</b> en '+(y+1)+'. Calculez le taux de croissance économique de '+(y+1)+' (une décimale).</p>',
   f:[{l:'Taux de croissance '+(y+1),a:r1(t),tol:0.051,u:'%'}],
   sol:'<p class="mono">('+nf(b)+' − '+nf(a)+') ÷ '+nf(a)+' × 100 = '+nf(b-a)+' ÷ '+nf(a)+' × 100 = <b>'+nf(r1(t),1)+' %</b></p><p>'+(t<0?'Le taux est <b>négatif</b> : selon le prof, un résultat négatif représente une <b>récession</b>.':'Le taux est positif : l\'économie a produit davantage de biens et services (croissance).')+' On utilise toujours le PIB <b>réel</b>, pour ne pas confondre une hausse des prix avec une hausse de la production.</p>'}; }},

{id:'ap',s:'s15',name:'Règle d\'approximation',desc:'% Δ réel ≈ % Δ nominal − % Δ déflateur',
 gen(){ const n0=ri(40,90)*10, gn=ri(20,110)/10, d0=pick([100,100,ri(101,112)]), gd=ri(5,60)/10; const n1=r1(n0*(1+gn/100)), d1=r2(d0*(1+gd/100));
  const pn=(n1-n0)/n0*100, pd=(d1-d0)/d0*100, pr=pn-pd;
  return {q:'<p>Le PIB nominal d\'un pays passe de <b>'+nf(n0)+' G$</b> à <b>'+nf(n1,1)+' G$</b> en un an, et le déflateur (IIP) passe de <b>'+nf(d0,2)+'</b> à <b>'+nf(d1,2)+'</b>. Calculez la croissance du PIB nominal, celle du déflateur, puis la croissance approximative du PIB réel (une décimale).</p>',
   f:[{l:'% Δ PIB nominal',a:r1(pn),tol:0.051,u:'%'},{l:'% Δ déflateur',a:r1(pd),tol:0.051,u:'%'},{l:'% Δ PIB réel (approx.)',a:r1(pr),tol:0.12,u:'%'}],
   sol:'<p>% Δ nominal = ('+nf(n1,1)+' − '+nf(n0)+') ÷ '+nf(n0)+' × 100 = <b>'+nf(r1(pn),1)+' %</b></p><p>% Δ déflateur = ('+nf(d1,2)+' − '+nf(d0,2)+') ÷ '+nf(d0,2)+' × 100 = <b>'+nf(r1(pd),1)+' %</b></p><p>% Δ réel ≈ '+nf(r1(pn),1)+' − '+nf(r1(pd),1)+' = <b>'+nf(r1(pn)-r1(pd),1)+' %</b> (règle de l\'évaluation formative du prof : la hausse du nominal = effet des prix + effet des quantités).</p>'}; }},

{id:'hab',s:'s16',name:'PIB par habitant',desc:'PIB ÷ population',
 gen(){ const pays=pick(['le Canada','le Québec','un pays fictif','la Norvège (fictif)','l\'Irlande (fictif)']); const pop=ri(40,450)/10; const P=Math.round(pop*ri(380,820)/10)*10;
  const a=Math.round(P*1e9/(pop*1e6));
  return {q:'<p>Le PIB de '+pays+' est de <b>'+nf(P)+' milliards $</b> et sa population est de <b>'+nf(pop,1)+' millions</b> d\'habitants. Calculez le PIB par habitant (arrondi au dollar près).</p>',
   f:[{l:'PIB par habitant',a:a,tol:1.5,u:'$'}],
   sol:'<p class="mono">'+nf(P)+' 000 000 000 $ ÷ '+nf(pop*1e6)+' = <b>'+nf(a)+' $ par habitant</b></p><p>Truc : milliards ÷ millions = milliers. '+nf(P)+' ÷ '+nf(pop,1)+' = '+nf(P/pop,3)+' milliers de $. Attention : c\'est un revenu <b>moyen</b>; il ne dit rien des inégalités (Gini) ni de la santé ou de l\'éducation (IDH).</p>'}; }},

{id:'ecart',s:'s11',name:'Pénurie ou surplus',desc:'Prix d\'équilibre, prix plafond ou plancher, écart',
 gen(){ const mk=pick([['cours de conduite','$','cours'],['4½ dans un quartier de Montréal','$/mois','logements'],['billets de spectacle','$','billets'],['heures de travail non spécialisé','$/h','travailleurs'],['litres de lait','$','milliers de litres']]);
  const step=pick([2,5,10,50,100]), p0=step*ri(3,10), prices=[0,1,2,3,4,5].map(k=>p0+k*step); const ie=ri(2,3);
  const qe=ri(20,60)*10, dq=ri(3,8)*10, oq=ri(3,8)*10; const rows=prices.map((p,k)=>({p:p,d:qe-(k-ie)*dq,o:qe+(k-ie)*oq}));
  const plaf=Math.random()<0.5; const kc=plaf?ri(0,ie-1):ri(ie+1,5); const r=rows[kc]; const gap=Math.abs(r.d-r.o);
  const isWork=mk[2]==='travailleurs';
  return {q:'<p>Voici le marché des '+mk[0]+'.</p><div class="tbl-wrap"><table class="data"><thead><tr><th>Prix ('+mk[1]+')</th><th>Quantité demandée</th><th>Quantité offerte</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+nf(x.p)+'</td><td>'+nf(x.d)+'</td><td>'+nf(x.o)+'</td></tr>').join('')+'</tbody></table></div><p>a) Quel est le prix d\'équilibre ? b) L\'État impose un <b>prix '+(plaf?'plafond':'plancher')+' de '+nf(r.p)+' '+mk[1]+'</b>. Calculez l\'ampleur de '+(plaf?'la pénurie':'du surplus')+' (en '+mk[2]+').</p>',
   f:[{l:'Prix d\'équilibre',a:rows[ie].p,tol:0,u:mk[1]},{l:plaf?'Pénurie':'Surplus',a:gap,tol:0,u:mk[2]}],
   sol:'<p>a) À <b>'+nf(rows[ie].p)+' '+mk[1]+'</b>, la quantité demandée et la quantité offerte sont égales ('+nf(rows[ie].d)+') : c\'est l\'équilibre.</p><p>b) Le prix '+(plaf?'plafond est <b>sous</b>':'plancher est <b>au-dessus</b>')+' du prix d\'équilibre, donc il a un effet. À '+nf(r.p)+' '+mk[1]+' : Qd = '+nf(r.d)+' et Qo = '+nf(r.o)+'. '+(plaf?'Pénurie = Qd − Qo':'Surplus = Qo − Qd')+' = <b>'+nf(gap)+' '+mk[2]+'</b>.'+(isWork&&!plaf?' Sur le marché du travail, ce surplus de travailleurs, c\'est du <b>chômage</b>.':'')+'</p>'}; }},

{id:'el',s:'s12',name:'Élasticité-prix de la demande',desc:'Variations en %, Ed, élastique ou non',
 gen(){ const it=pick(['billets de cinéma','essence','cafés au lait','jeux vidéo','abonnements de gym','paquets de gomme']); const p0=ri(4,40), dp=ri(1,6)*5; const p1=r2(p0*(1+dp/100)); const q0=ri(20,90)*100; const e=pick([ri(10,60),ri(110,300)])/100; const dq=-dp*e; const q1=Math.round(q0*(1+dq/100));
  const pq=(q1-q0)/q0*100, pp=(p1-p0)/p0*100, ed=Math.abs(pq/pp);
  return {q:'<p>Le prix des '+it+' passe de <b>'+nf(p0,2)+' $</b> à <b>'+nf(p1,2)+' $</b>, et la quantité demandée passe de <b>'+nf(q0)+'</b> à <b>'+nf(q1)+'</b>. Calculez la variation en % de la quantité demandée, la variation en % du prix (une décimale) et la valeur absolue de l\'élasticité-prix (deux décimales).</p>',
   f:[{l:'% Δ quantité demandée',a:r1(pq),tol:0.051,u:'%'},{l:'% Δ prix',a:r1(pp),tol:0.051,u:'%'},{l:'|Ed|',a:r2(ed),tol:0.021,u:''}],
   sol:'<p>% Δ Qd = ('+nf(q1)+' − '+nf(q0)+') ÷ '+nf(q0)+' × 100 = <b>'+nf(r1(pq),1)+' %</b></p><p>% Δ P = ('+nf(p1,2)+' − '+nf(p0,2)+') ÷ '+nf(p0,2)+' × 100 = <b>'+nf(r1(pp),1)+' %</b></p><p>Ed = '+nf(r1(pq),1)+' ÷ '+nf(r1(pp),1)+' = '+nf(r2(pq/pp),2)+', donc <b>|Ed| = '+nf(r2(ed),2)+'</b>. '+(ed>1?'Plus grand que 1 : la demande est <b>élastique</b>; la hausse de prix fait <b>baisser</b> la recette totale ('+nf(p0*q0)+' $ → '+nf(r2(p1*q1),2)+' $).':'Plus petit que 1 : la demande est <b>inélastique</b>; la hausse de prix fait <b>augmenter</b> la recette totale ('+nf(p0*q0)+' $ → '+nf(r2(p1*q1),2)+' $).')+'</p>'}; }}
];
