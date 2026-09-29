# Équilibre 383 : fiches, quiz, calculs et examen blanc pour l'Intra 1 d'économie

Fait le 29 septembre 2026 pour l'Intra 1 du cours *Fondements de l'économie globale*
(383-FEG-P1, Alain Beaulieu), mercredi 30 septembre 2026 (semaine 6), 15 % de la note.

Sources : les PowerPoint des cours 1, 2 (parties 1 et 2) et 3 (parties 1 et 2), les documents Word du prof
(coût d'option, prix artificiels, élasticité, évaluation et exercice formatifs sur le PIB), les 3 PDF du dossier
`Grasset Session 1\Économie` (cigarette électronique, coût d'opportunité, axe gauche-droite) et le plan de cours.
Copies dans `sources/`, texte extrait dans `txt/`.

## Ouvrir
- **En ligne, sans compte** : https://vaelordesign.github.io/equilibre-383/ (dépôt public `vaelordesign/equilibre-383`,
  GitHub Pages servi depuis `docs/`, page en noindex). Mis en ligne à la demande de Julien le 29 sept. 2026.
  Les fichiers du prof (`sources/`, `txt/`) sont exclus du dépôt par `.gitignore`. Après une modification :
  `node build.js`, puis `git add -A`, `git commit`, `git push` (Pages se redéploie en ~40 s), et republier
  `equilibre-383.html` pour l'Artifact (https://claude.ai/artifact/E3QKjMZ5u1HfthHpfBkHu8).
- Double-cliquer sur `docs/index.html` (page complète). Copie : `Grasset Session 1\Économie\Equilibre-383.html`.
- Guides PDF (version claire, pour imprimer) : `Grasset Session 1\Économie\Equilibre-383-guide-express.pdf`
  (9 pages) et `Equilibre-383-fiches.pdf` (les 20 fiches).
- La progression reste dans le navigateur (localStorage, clés `equilibre-383` et `equilibre-383-draft`).

## Ce qu'il y a dedans
- **Express 30 min** (vue d'ouverture) : définitions, réflexes offre et demande (10 déterminants, 4 cas, prix
  plafond et plancher), PIB et formules, vrai ou faux pièges, mini-tests.
- **Fiches** : 21 fiches (0 = guide de l'intra, 1 à 18 = matière, 19 = formulaire, 20 = lexique), avec graphiques SVG.
- **Quiz** : 526 questions (190 qcm, 119 vrai ou faux, 80 courtes, 70 calculs, 40 prévisions en 5 étapes, 27 développements).
- **Calculs** : 9 générateurs à chiffres aléatoires avec solution détaillée (coût d'option, PIB par les dépenses,
  nominal/réel/IIP, tableau à compléter, croissance, approximation, PIB par habitant, pénurie/surplus, élasticité).
- **Examen blanc** sur 40 : A 16 questions (qcm, vf, courtes), B 4 calculs, C 2 prévisions, D 2 développements sur 3.
  Le vrai format de l'intra n'est pas connu : modelé sur les exercices formatifs du prof.
- **Cartes éclair** : les 80 réponses courtes.

## Modifier
`parts/` : `a-head.html` (CSS), `b0-topbar.html`, `f-express.html`, `b1` à `b4-fiches.html`, `c-views.html`,
`d1-core.js` (groupes, types, déterminants), `e0-graph.js` (graphiques `sdSVG`), `e1-gen.js` (générateurs),
`e2-app.js` (moteur), `bank/bank-A` à `E.json` (questions, format dans `bank/SPEC.md`).
`node build.js` vérifie la banque (types, déterminants compatibles avec la courbe, tirets longs interdits, liens)
puis écrit `equilibre-383.html` (fragment pour l'Artifact) et `docs/index.html`. Test local : `node serve.js`
(port 8768, lancement `equilibre` dans `Typing\.claude\launch.json`).

## Points d'attention
- Dans l'Artifact, `confirm()` et `window.print()` ne marchent pas : le moteur utilise une fenêtre maison (`ask`)
  et cache le bouton d'impression quand la page est dans un cadre.
- Le corrigé du prof sur le coût d'option a 3 réponses ambiguës (Pierre, Sophie, Noé) : signalé dans la fiche 2,
  exclu de la banque.
- Le prof classe les investissements publics (écoles, ponts) dans I : suivi, avec une note.
- Élasticité et axe gauche-droite : documents remis mais hors calendrier des semaines 1 à 6, marqués « au cas où ».
- Types d'allocation, deux déplacements simultanés, structures de marché, circuit économique : compléments
  (vus en classe ou en capsule, pas dans les diapos).
