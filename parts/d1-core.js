
// ------------------------------------------------------------------
// Groupes de fiches, types de questions, déterminants.
// Les questions elles-mêmes sont dans parts/bank/*.json (fusionnées par build.js).
// ------------------------------------------------------------------
const GROUPS = [
  {id:'g1', name:'Rareté et choix', s:['s1','s2','s3']},
  {id:'g2', name:'La demande', s:['s4','s5']},
  {id:'g3', name:'L\'offre', s:['s6','s7']},
  {id:'g4', name:'Équilibre et prévisions', s:['s8','s9','s10']},
  {id:'g5', name:'Prix artificiels et élasticité', s:['s11','s12']},
  {id:'g6', name:'Le PIB', s:['s13','s14']},
  {id:'g7', name:'PIB réel, croissance, bien-être', s:['s15','s16','s17']},
  {id:'g8', name:'Gauche et droite', s:['s18']}
];
const TYPES = {qcm:'Choix multiple', vf:'Vrai ou faux', courte:'Réponse courte', calc:'Calcul', prev:'Prévision en 5 étapes', dev:'Court développement'};
const DETS = {
  revenu:{c:'D', n:'Le revenu des consommateurs'},
  biens_associes:{c:'D', n:'Le prix des biens associés (substituts, compléments)'},
  gouts:{c:'D', n:'Les goûts et les préférences'},
  nb_consommateurs:{c:'D', n:'Le nombre de consommateurs'},
  anticipations:{c:'D', n:'Les anticipations des consommateurs'},
  intrants:{c:'O', n:'Le prix des intrants (coûts de production)'},
  technologie:{c:'O', n:'La technologie'},
  nb_entreprises:{c:'O', n:'Le nombre d\'entreprises (vendeurs)'},
  subventions:{c:'O', n:'Les subventions'},
  climat:{c:'O', n:'Les conditions climatiques'}
};
const CORE = [];
