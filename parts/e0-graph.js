
// ------------------------------------------------------------------
// Graphiques d'offre et de demande dessinés en SVG (fiches, corrigés, prévisions).
// sdSVG(type, options) ; types : base, D+, D-, O+, O-, plafond, plancher, pen, sur,
// D+O+, D+O-, D-O+, D-O-, mvt, shiftD, demande, offre, el0, elinf, eltyp, laffer
// Options : x, y (titres d'axes), dl, ol (étiquettes des courbes), p, q, pc (étiquettes).
// ------------------------------------------------------------------
function sdSVG(kind,o){
  o=o||{};
  const W=360,H=252,X0=48,Y0=214,SX=28.6,SY=19.2;
  const X=x=>+(X0+x*SX).toFixed(1), Y=y=>+(Y0-y*SY).toFixed(1);
  const A=9,C=1,B=0.8;
  const dX=(y,sd)=>sd+(A-y)/B, oX=(y,so)=>so+(y-C)/B;
  const eq=(sd,so)=>{ const x=(A-C+B*(sd+so))/(2*B); return {x:x,y:C+B*(x-so)}; };
  const clip=(x1,y1,x2,y2)=>{ // garde le segment dans la zone utile
    const pts=[[x1,y1],[x2,y2]].map(p=>p.slice()); const xmin=0.25,xmax=9.9;
    const k=(y2-y1)/(x2-x1);
    pts.forEach(p=>{ if(p[0]<xmin){ p[1]=p[1]+k*(xmin-p[0]); p[0]=xmin; } if(p[0]>xmax){ p[1]=p[1]+k*(xmax-p[0]); p[0]=xmax; } });
    return pts; };
  const lineD=(sd,cls,lab)=>{ const p=clip(dX(9.3,sd),9.3,dX(0.55,sd),0.55); const cut=p[1][0]>8.6; return '<path class="'+cls+'" d="M'+X(p[0][0])+' '+Y(p[0][1])+' L'+X(p[1][0])+' '+Y(p[1][1])+'"/>'+(lab?'<text class="lD" x="'+(cut?X(p[1][0])-2:X(p[1][0])+4)+'" y="'+(cut?Y(p[1][1])+15:Y(p[1][1])-2)+'"'+(cut?' text-anchor="end"':'')+'>'+lab+'</text>':''); };
  const lineO=(so,cls,lab)=>{ const p=clip(oX(0.55,so),0.55,oX(9.3,so),9.3); const cut=p[1][0]>8.6; return '<path class="'+cls+'" d="M'+X(p[0][0])+' '+Y(p[0][1])+' L'+X(p[1][0])+' '+Y(p[1][1])+'"/>'+(lab?'<text class="lO" x="'+(cut?X(p[1][0])-6:X(p[1][0])+4)+'" y="'+(cut?Y(p[1][1])-8:Y(p[1][1])+4)+'"'+(cut?' text-anchor="end"':'')+'>'+lab+'</text>':''); };
  const guide=(x,y)=>'<path class="gd" d="M'+X(0)+' '+Y(y)+' H'+X(x)+' V'+Y(0)+'"/>';
  const dot=(x,y,lab,cls)=>'<circle class="'+(cls||'pt')+'" cx="'+X(x)+'" cy="'+Y(y)+'" r="4.2"/>'+(lab?'<text class="tk" x="'+(X(x)+7)+'" y="'+(Y(y)-7)+'">'+lab+'</text>':'');
  const tickP=(y,lab)=>'<text class="tk" x="'+(X0-6)+'" y="'+(Y(y)+4)+'" text-anchor="end">'+lab+'</text>';
  const tickQ=(x,lab)=>'<text class="tk" x="'+X(x)+'" y="'+(Y0+15)+'" text-anchor="middle">'+lab+'</text>';
  const arrowH=(y,x1,x2)=>{ const d=x2>x1?1:-1; const xa=X(x1+0.18*d), xb=X(x2-0.18*d), yy=Y(y); return '<path class="arrow" d="M'+xa+' '+yy+' H'+(xb-6*d)+'"/><path class="arrowh" d="M'+xb+' '+yy+' l'+(-9*d)+' -5 v10 z"/>'; };
  const axes=()=>'<path class="ax" d="M'+X0+' 14 V'+Y0+' H'+(W-10)+'"/><path class="pt" d="M'+X0+' 8 l-4.5 9 h9 z M'+(W-4)+' '+Y0+' l-9 -4.5 v9 z"/>'+
    '<text class="axl" x="'+(X0+8)+'" y="18">'+(o.y||'Prix')+'</text><text class="axl" x="'+(W-6)+'" y="'+(Y0+32)+'" text-anchor="end">'+(o.x||'Quantité')+'</text>';
  const DL=o.dl||'Demande', OL=o.ol||'Offre';
  let s='';
  const shift={'D+':[2,0],'D-':[-2,0],'O+':[0,2],'O-':[0,-2],'D+O+':[2.2,1.2],'D+O-':[2.2,-1.2],'D-O+':[-2.2,1.2],'D-O-':[-2.2,-1.2]}[kind];
  if(kind==='base'){
    const e=eq(0,0); s+=guide(e.x,e.y)+lineD(0,'cD',DL)+lineO(0,'cO',OL)+dot(e.x,e.y,o.e||'')+tickP(e.y,o.p||'P*')+tickQ(e.x,o.q||'Q*');
  } else if(shift){
    const sd=shift[0], so=shift[1], e1=eq(0,0), e2=eq(sd,so);
    s+=guide(e1.x,e1.y)+guide(e2.x,e2.y);
    s+=lineD(0,'cD',sd?'D₁':DL)+lineO(0,'cO',so?'O₁':OL);
    if(sd) s+=lineD(sd,'cD2','D₂')+arrowH(6.9,dX(6.9,0),dX(6.9,sd));
    if(so) s+=lineO(so,'cO2','O₂')+arrowH(3.1,oX(3.1,0),oX(3.1,so));
    s+=dot(e1.x,e1.y,'E₁')+dot(e2.x,e2.y,'E₂','pt2');
    const pUp=e2.y>e1.y, qUp=e2.x>e1.x;
    s+=tickP(e1.y,'P₁')+tickP(e2.y+(Math.abs(e2.y-e1.y)<0.6?(pUp?0.35:-0.35):0),'P₂')+tickQ(e1.x,'Q₁')+tickQ(e2.x+(Math.abs(e2.x-e1.x)<0.9?(qUp?0.45:-0.45):0),'Q₂');
  } else if(kind==='plafond'||kind==='pen'||kind==='plancher'||kind==='sur'){
    const low=(kind==='plafond'||kind==='pen'), py=low?3.4:6.6, e=eq(0,0);
    const qo=oX(py,0), qd=dX(py,0), qa=Math.min(qo,qd), qb=Math.max(qo,qd);
    s+=guide(e.x,e.y)+lineD(0,'cD',DL)+lineO(0,'cO',OL)+dot(e.x,e.y,'E');
    s+='<path class="ctl" d="M'+X(0)+' '+Y(py)+' H'+X(9.7)+'"/>';
    const lab=o.pl||(kind==='plafond'?'Prix plafond':kind==='plancher'?'Prix plancher':'Prix courant');
    s+='<text class="ctlab" x="'+(low?X(0.35):X(9.7))+'" y="'+(Y(py)+(low?-6:15))+'"'+(low?'':' text-anchor="end"')+'>'+lab+'</text>';
    s+='<path class="gd" d="M'+X(qo)+' '+Y(py)+' V'+Y(0)+' M'+X(qd)+' '+Y(py)+' V'+Y(0)+'"/>'+dot(qo,py,'')+dot(qd,py,'');
    s+='<path class="gap" d="M'+X(qa)+' '+(Y0-5)+' H'+X(qb)+'"/><text class="gapl" x="'+X((qa+qb)/2)+'" y="'+(Y0+15)+'" text-anchor="middle">'+(low?'Pénurie':'Surplus')+'</text>';
    s+=tickP(e.y,o.p||'P*')+tickP(py,o.pc||(low?'Pc':'Pp'))+tickQ(qo,'Qo')+tickQ(qd,'Qd');
  } else if(kind==='mvt'){
    const xa=3.4, xb=6.6, ya=A-B*xa, yb=A-B*xb;
    s+=guide(xa,ya)+guide(xb,yb)+lineD(0,'cD',DL)+dot(xa,ya,'A')+dot(xb,yb,'B','pt2');
    s+='<path class="arrow" d="M'+X(xa+0.35)+' '+Y(ya-0.28-0.15)+' L'+X(xb-0.45)+' '+Y(yb+0.36-0.15)+'"/>';
    s+=tickP(ya,o.pa||'P₁')+tickP(yb,o.pb||'P₂')+tickQ(xa,o.qa||'Q₁')+tickQ(xb,o.qb||'Q₂');
  } else if(kind==='shiftD'||kind==='shiftO'){
    const isD=kind==='shiftD', py=5;
    if(isD){ s+=lineD(0,'cD','D₁')+lineD(2,'cD2','D₂')+lineD(-2,'cD2','D₃')+arrowH(7.4,dX(7.4,0),dX(7.4,2))+arrowH(7.4,dX(7.4,0),dX(7.4,-2)); }
    else { s+=lineO(0,'cO','O₁')+lineO(2,'cO2','O₂')+lineO(-2,'cO2','O₃')+arrowH(2.6,oX(2.6,0),oX(2.6,2))+arrowH(2.6,oX(2.6,0),oX(2.6,-2)); }
    const q1=isD?dX(py,0):oX(py,0);
    s+='<path class="gd" d="M'+X(0)+' '+Y(py)+' H'+X(q1+2)+' M'+X(q1-2)+' '+Y(py)+' V'+Y(0)+' M'+X(q1)+' '+Y(py)+' V'+Y(0)+' M'+X(q1+2)+' '+Y(py)+' V'+Y(0)+'"/>';
    s+=tickP(py,o.p||'1,00 $')+tickQ(q1-2,o.q3||(isD?'800':'4 100'))+tickQ(q1,o.q1||(isD?'1 000':'4 550'))+tickQ(q1+2,o.q2||(isD?'1 200':'4 850'));
  } else if(kind==='demande'){ s+=lineD(0,'cD',DL); }
  else if(kind==='offre'){ s+=lineO(0,'cO',OL); }
  else if(kind==='el0'){ s+='<path class="cD" d="M'+X(5)+' '+Y(9.2)+' V'+Y(0.3)+'"/><text class="lD" x="'+(X(5)+6)+'" y="'+Y(8.6)+'">D (Ed = 0)</text>'+tickQ(5,'Q fixe'); }
  else if(kind==='elinf'){ s+='<path class="cD" d="M'+X(0.3)+' '+Y(5)+' H'+X(9.6)+'"/><text class="lD" x="'+X(9.6)+'" y="'+(Y(5)-7)+'" text-anchor="end">D (Ed → ∞)</text>'+tickP(5,'P fixe'); }
  else if(kind==='eltyp'){ s+=lineD(0,'cD','D'); }
  else if(kind==='laffer'){ s+='<path class="cD" d="M'+X(0)+' '+Y(0)+' Q'+X(5)+' '+Y(17)+' '+X(10)+' '+Y(0)+'"/>'+tickQ(0,'0 %')+tickQ(9.9,'100 %')+'<path class="gd" d="M'+X(5)+' '+Y(8.5)+' V'+Y(0)+'"/>'+tickQ(5,'taux optimal'); }
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+(o.aria||'Graphique d\'offre et de demande')+'">'+axes()+s+'</svg>';
}
function drawGraphs(root){
  Array.prototype.forEach.call((root||document).querySelectorAll('figure.g[data-g]'),f=>{
    if(f.querySelector('svg')) return;
    const d=f.dataset; f.insertAdjacentHTML('afterbegin',sdSVG(d.g,{x:d.x,y:d.y,dl:d.dl,ol:d.ol,p:d.p,q:d.q,pc:d.pc,pl:d.pl,aria:d.aria,e:d.e,q1:d.q1,q2:d.q2,q3:d.q3}));
  });
}
