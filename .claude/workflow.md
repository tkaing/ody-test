# Règles de travail avec Claude

## Langue & autonomie

- Répondre en français
- Claude code en autonomie complète
- Expliquer le POURQUOI en quelques phrases claires :
  - **Avant** : justifier brièvement les choix d'architecture ou de structure avant de coder
  - **Après** : résumer ce qui a été livré et annoncer ce qui vient ensuite

## Progression

- Lire `PROGRAMME.md` et `PROGRESSION.md` au début de chaque session
- **Mode plan obligatoire** : chaque phase démarre exactement comme suit — sans exception :
  1. Lire `PROGRESSION.md` → identifier la phase suivante
  2. `EnterPlanMode` → explorer le repo + rédiger le plan
  3. Présenter le plan → attendre l'approbation ou les corrections
  4. `ExitPlanMode` → implémenter seulement après approbation explicite
- **Prérequis `[U]`** : avant toute action de code, demander impérativement à l'utilisateur de confirmer chaque item marqué `[U]` dans `PROGRESSION.md` (Node, pnpm, Docker, Git…). Ne pas continuer tant que tous les `[U]` de la phase courante ne sont pas confirmés.
- Une étape à la fois — attendre la validation explicite avant de passer à la suivante
- Claude coche la case dans `PROGRESSION.md` uniquement après validation explicite

## Journal de phase *(obligatoire pour chaque phase)*

Créer `phases/phase-N.md` avec trois sections :
- `## Plan` — justification des choix d'architecture et de structure (écrit **après** livraison)
- `## Livraison` — résumé de ce qui a été produit (écrit **après** livraison)
- `## Décisions & questions ouvertes` — résidu des checkpoints, écrit **au fil de l'eau** : chaque décision tranchée pendant un checkpoint + chaque question encore ouverte (case `[ ]`).

Ce fichier remplace les blocs "Avant / Après" dans la réponse chat. Le résumé dans le message chat reste court (2–3 lignes max) et renvoie au fichier.

**À chaque phase, ajouter ~3 lignes à `ARCHITECTURE.md`** : « maintenant l'app sait faire X · fichier clé : Y ».

## Carte du projet *(`ARCHITECTURE.md`)*

Fichier **unique et transversal**, construit au fil de l'eau. Son but : donner le recul sur la *structure* (où vit quoi, comment les morceaux se connectent, quels sont les flux principaux).

Règles de rédaction :
- **Langage clair, altitude produit** — on raconte « comment marche l'app », pas « fichier X ligne Y »
- **Organisé par flux**, pas par fichier : chaque flux principal raconté de bout en bout, avec *le* fichier clé de chaque étape
- Contient à terme : (1) les flux principaux racontés · (2) la chaîne d'archi rendue concrète · (3) la carte des packages (un rôle par ligne)

**Ce fichier double comme livrable** : il EST la *« short explanation of architecture decisions »* exigée dans les Deliverables de l'assignment.

## Profil utilisateur *(calibre la profondeur des explications)*

L'utilisateur **maîtrise TypeScript et React Native**, et **connaît Express/Fastify**. Donc :
- Ne pas expliquer les concepts TS, ni le RN de base, ni le pattern routes/middleware/`context` de Hono (≈ Express/Fastify → analogie en 1-2 lignes suffit)
- Ralentir et détailler sur ce qui est **neuf pour lui** : Drizzle, drizzle-zod, génération OpenAPI depuis Hono, Orval, runtime Cloudflare Workers, hooks React Query générés, pnpm workspace/Turborepo

## Checkpoint guidé *(méthode de revue — s'applique au fil de l'eau)*

Avant d'écrire du code important, s'arrêter et présenter en 5 temps :
1. **Le code prévu** (esquisse ou extrait)
2. **Ce que ça fait** — une phrase simple
3. **Pourquoi ce choix _et quelles étaient les alternatives_**
4. **La question ouverte** posée explicitement à l'utilisateur
5. **Attendre** sa validation avant de continuer

Le seuil "important" : si une mauvaise décision ici serait coûteuse à corriger plus tard. Pour les cases triviales (config, barrel exports, renommage), un résumé textuel suffit. Granularité fine sur les sujets neufs pour l'utilisateur ; plus rapide sur TS/RN/Express qu'il connaît.

Le résidu (décision tranchée + questions restées ouvertes) va dans `## Décisions & questions ouvertes` de `phases/phase-N.md`.

## Rattrapage de revue — phases 0 à 3 *(one-shot, à faire AVANT la Phase 4)*

Les phases 0 à 3 ont été codées sans checkpoint. Le rattrapage est rétrospectif : on relit le code en appliquant le format checkpoint en 5 temps adapté au passé, en petits chunks guidés.

Piloté par les cases `## Rattrapage de revue` de `PROGRESSION.md`, dosé par importance × familiarité (Phase 1 = lourd, Phase 0 = léger, Phase 3 = très léger).

**Gérer un changement décidé pendant le rattrapage** — l'impact se propage vers le bas : `Phase 1 (schéma) → Phase 2 (hooks Orval + seed) → Phase 4 (pages)` :

- **Petit fix** → appliquer inline · relancer `pnpm gen:contract` si le contrat a bougé · relancer `pnpm test` · noter dans le journal
- **Changement structurel** → checkpoint explicite avant de toucher (montrer l'impact en aval), attendre validation, *puis* appliquer et propager d'un coup

## Revue critique automatique *(definition-of-done en fin de phase)*

Ces checks sont cochés dans `PROGRESSION.md` ; Claude les lance et **rapporte le résultat vert/rouge**.

1. **`pnpm typecheck` + `pnpm lint` : zéro erreur** — lancer après chaque phase
2. **Gate architecture** — vérifier que la chaîne `Drizzle schema → drizzle-zod → Hono/OpenAPI → Orval → hooks frontend` est respectée
3. **Artefacts Orval** *(phases 2+)* — après chaque `pnpm gen:contract`, vérifier que les hooks/types générés correspondent au contrat et qu'aucun fichier généré n'a été édité manuellement
4. **`/code-review` sur le diff de la phase** — lister les findings (bugs, type safety, architecture, duplication), corriger avant de passer à la phase suivante

Pour la phase 3 (Design System), le gate architecture est remplacé par : aucune valeur magique (couleur, spacing, radius) hors des fichiers de tokens centralisés.
