# Format des banques de questions (site « Équilibre 383 », Intra 1 d'économie 383-FEG-P1)

Chaque fichier est un tableau JSON d'objets. Français du Québec, tutoiement interdit dans les énoncés (style examen : « Quel est… », « Identifiez… »), mais les explications `w` peuvent tutoyer l'étudiant.

INTERDIT PARTOUT : le tiret long « — » et le tiret moyen « – » (le build échoue). Utiliser virgule, deux-points, parenthèses ou point. Le trait d'union normal « - » est permis dans les mots composés.

## Champs communs
- `id` : préfixe du lot + numéro, ex. "A-001". Unique.
- `s` : fiche, parmi s1 à s18 (voir la liste des fiches dans ta consigne).
- `t` : type (voir ci-dessous).
- `q` : énoncé (texte brut, pas de HTML).

## Types
1. `qcm` : `o` = 4 options (chaînes distinctes, longueurs comparables, pas de « toutes ces réponses » sauf si c'est une vraie question du prof), `a` = index 0-3 de la bonne réponse (varier la position !), `w` = explication 1 à 3 phrases qui dit POURQUOI et nomme le piège.
2. `vf` : `a` = true/false, `w` = explication (si faux, donner la version correcte). Environ 45 % de vrais.
3. `courte` : `acc` = tableau de 2 à 6 réponses courtes acceptées (1 à 5 mots, variantes et synonymes, sans article), `m` = réponse modèle en une ou deux phrases qui COMMENCE par la réponse elle-même (ex. « Le coût d'option. C'est la valeur de… »).
4. `calc` : calcul numérique. `a` = nombre (point décimal JS), `tol` = tolérance absolue (ex. 0.01 pour un IIP, 0.1 pour un % à une décimale, 0 ou 0.5 pour un montant entier), `u` = unité affichée après la case (« $ », « %», « millions $ », « logements »…), `m` = solution en HTML simple (<p>, <b>, <br>) avec la formule, le remplacement et le résultat.
5. `dev` : court développement. `m` = réponse modèle en HTML (<p>, <ul><li>, <b>) de 4 à 8 lignes, `crit` = exactement 4 critères de correction de 1 point chacun, rédigés « … (1 pt) », `k` = 3 à 6 mots-clés attendus.
6. `prev` (seulement si ta consigne le demande) : prévision en 5 étapes. Champs : `q` = l'événement (1 à 3 phrases), `mk` = le marché étudié (ex. « Le marché du poisson »), `c` = "D" (demande) ou "O" (offre), `d` = 1 (hausse) ou -1 (baisse), `det` = clé du déterminant parmi :
   demande : "revenu", "biens_associes", "gouts", "nb_consommateurs", "anticipations"
   offre   : "intrants", "technologie", "nb_entreprises", "subventions", "climat"
   `w` = explication 2 à 4 phrases (déterminant, sens du déplacement, pourquoi, effet sur le prix et la quantité d'équilibre). Le prix et la quantité d'équilibre se déduisent automatiquement (D+ : P↑ Q↑ ; D- : P↓ Q↓ ; O+ : P↓ Q↑ ; O- : P↑ Q↓), ne pas les mettre.

## Règles de contenu (très important)
- Tout doit venir des notes du prof (fichiers .txt indiqués) ou des compléments explicitement autorisés dans ta consigne. Reprendre les définitions du prof presque mot pour mot.
- Varier : définitions, application à une situation concrète (exemples québécois : Montréal, Laval, cégep, poutine, dépanneur, STM, hockey…), pièges classiques (demande vs quantité demandée, mouvement vs déplacement, bien final vs intermédiaire, nominal vs réel…).
- Chaque question doit avoir UNE seule bonne réponse défendable. Vérifier chaque calcul deux fois.
- Pas de question sur les sources, liens Internet, numéros de page ou noms de manuels.
- Quand tu as fini, valide ton fichier : `node -e "const a=require('CHEMIN');console.log(a.length)"` doit marcher, et `node -e "const s=require('fs').readFileSync('CHEMIN','utf8');if(/[—–]/.test(s))throw 'tiret'"` ne doit rien afficher.
