# Ody — Programme de développement

Application fullstack de gestion de restaurant · Test technique Odyssey · Timebox 1–2 jours

---

## Phase 0 — Setup & infra

**Objectif** : poser les fondations du monorepo et rendre l'environnement local opérationnel avant d'écrire la moindre ligne de logique métier.

**Pourquoi d'abord** : tout le reste dépend d'une structure de packages propre et de scripts cohérents. Un monorepo mal initialisé coûte cher à corriger en cours de route.

**Technos** : pnpm workspaces · Turborepo · Docker Compose (PostgreSQL) · Wrangler (CF Workers local) · TypeScript · ESLint

**Critères de sortie** :
- `pnpm dev:backend` et `pnpm dev:dashboard` démarrent sans erreur
- La base de données PostgreSQL est accessible localement via Docker
- La structure de packages correspond exactement à celle de l'assignment

---

## Phase 1 — Schéma & contrat API

**Objectif** : modéliser les données dans Drizzle, en dériver les validations via drizzle-zod, et exposer un contrat OpenAPI complet via Hono. Chaque route et règle métier est couverte par un test Vitest écrit en même temps.

**Pourquoi d'abord** : c'est la règle centrale de l'architecture — la vérité part du schéma. Si on commence par le frontend, on finit avec des types dupliqués et incohérents. Toutes les phases suivantes dépendent de ce contrat.

**Technos** : Drizzle ORM · drizzle-zod · Hono · @hono/zod-openapi · PostgreSQL · Vitest

**Entités** : `menu_categories` · `menu_items` · `customers` · `orders` · `order_items` · `settings`

**Logique métier embarquée** :
- Transitions de statut de commande : `pending → confirmed → preparing → ready → completed` (+ `cancelled` depuis `pending` ou `confirmed`)
- Rejet des items indisponibles à la création de commande
- Calcul et vérification du total côté serveur

**Tests Vitest écrits en Phase 1** (un test par route/règle, écrit juste après l'implémentation) :
- `menu_categories` : GET liste, POST création
- `menu_items` : GET liste, POST création, PATCH disponibilité
- `customers` : GET liste, POST création
- `orders` : GET liste, POST création valide, rejet payload invalide, rejet item indisponible, vérification total server-side
- `orders/:id` : GET détail
- `orders/:id/status` : transition valide acceptée, transition invalide rejetée
- `settings` : GET, PATCH
- `home/summary` : GET KPIs

**Critères de sortie** :
- Toutes les routes répondent correctement en local via Wrangler
- Le contrat OpenAPI est généré (JSON ou YAML) et décrit toutes les routes
- `pnpm test` passe sur tous les tests backend de la phase

---

## Phase 2 — Génération & seed

**Objectif** : brancher Orval sur le contrat OpenAPI pour générer les hooks React Query dans `packages/api-client`, et peupler la base avec des données réalistes.

**Pourquoi ici** : les pages du dashboard consommeront directement ces hooks générés — il faut qu'ils existent avant de toucher au frontend. Le seed permet de travailler avec des données réelles dès le premier rendu.

**Technos** : Orval · React Query · scripts seed (TypeScript)

**Critères de sortie** :
- `pnpm gen:contract` régénère les hooks sans erreur
- Les hooks sont importables depuis `packages/api-client`
- La base contient des catégories, items, clients et commandes (statuts variés)

---

## Phase 3 — Design System

**Objectif** : établir un système de design centralisé (tokens) et construire toutes les primitives UI réutilisables, présentées dans une route UI Library dédiée. Les primitives clés sont couvertes par des tests Testing Library écrits en même temps.

**Pourquoi avant les pages** : sans tokens centralisés, chaque page invente ses propres valeurs — incohérence garantie. Les primitives construites ici sont les briques des pages de la phase suivante.

**Technos** : React Native Web (Expo) · StyleSheet · tokens TS · Vitest · Testing Library

**Tokens** : couleurs · typographie · spacing · radius/border/shadow/elevation · layout/grid · états sémantiques (success, warning, error, info)

**Primitives** : Button · Input/TextArea · Select · Modal · Card · Table · Badge/StatusIndicator · Navigation · Skeleton · Toast

**Tests Testing Library écrits en Phase 3** (écrit juste après chaque primitive) :
- `Button` : rendu par variante, état disabled, callback onPress
- `Input` : affichage label/error/hint, saisie contrôlée
- `Modal` : ouverture/fermeture, rendu du contenu
- `Badge` / `StatusIndicator` : rendu par statut

**Critères de sortie** :
- La route UI Library rend tous les composants avec leurs variantes et états
- Aucune valeur magique de couleur ou d'espacement hors des tokens
- Les états hover/focus/active/disabled sont visibles sur tous les composants interactifs
- `pnpm test` passe sur tous les tests frontend de la phase

---

## Rattrapage de revue — phases 0 à 3 *(à faire AVANT la Phase 4)*

**Objectif** : combler l'absence de revue au fil de l'eau sur les phases 0 à 3, codées avant la mise en place du checkpoint guidé.

**Pourquoi maintenant** : la Phase 4 (frontend) consomme directement le schéma, les types et les hooks issus des phases 1-2. L'utilisateur doit avoir relu et validé cette colonne avant de l'utiliser — sinon l'intégration paraît magique au lieu d'être comprise.

**Méthode** : revue rétrospective en petits chunks guidés (code → ce que ça fait → pourquoi + alternatives → question ouverte → validation), pilotée par les cases `## Rattrapage de revue` de `PROGRESSION.md`. Dosée par importance × familiarité : Phase 1 = lourd (Drizzle, drizzle-zod, OpenAPI), Phase 0 = léger, Phase 3 = très léger (RN connu). Routes Hono survolées par analogie Express/Fastify. Détail de la méthode dans `CLAUDE.md`.

**Critère de sortie** : toutes les cases `[U]` du bloc rattrapage validées.

---

## Phase 4 — Pages + intégration

**Objectif** : construire les 5 pages du dashboard et les câbler avec les hooks Orval générés en phase 2. Chaque page est accompagnée de son test Playwright écrit juste après l'implémentation.

**Pourquoi combiné** : les hooks existent déjà — construire les pages avec des données statiques puis reconnecter serait du double travail. Chaque page est livrée avec ses données réelles, ses flows CRUD, et ses états empty/error/loading.

**Technos** : Expo Router · React Query hooks (Orval) · primitives phase 3 · Playwright

**Pages et tests Playwright associés** :
- **Home** : KPIs (total orders, revenue, pending, popular items) → test : vérifier que les 4 KPIs s'affichent avec des valeurs numériques issues de la base seedée
- **Orders** : liste + filtres · vue détail · actions statut · flow création → tests : création de commande bout en bout · transition de statut · filtre par statut · vue détail
- **CRM** : liste clients avec order count, spend, recent orders → test : vérifier qu'un client affiche son order count, spend total et commandes récentes
- **Menu** : catégories + items · flow création/édition · toggle disponibilité → tests : créer une catégorie · créer un item · éditer un item · toggle disponibilité
- **Settings** : prep time, auto-accept, disponibilité, horaires → test : modifier un champ, sauvegarder, vérifier la persistance après rechargement

**Critères de sortie** :
- Toutes les pages fonctionnent sur web avec données réelles
- Tous les flows CRUD (create/edit) passent de bout en bout
- Aucun type frontend écrit à la main — tout vient d'Orval ou de `packages/types`
- `pnpm test:e2e` passe sur tous les tests Playwright de la phase

---

## Phase 5 — Intégration finale & livrables

**Objectif** : s'assurer que l'ensemble de la suite de tests passe proprement, corriger les régressions éventuelles, et préparer tous les livrables de l'assignment.

**Technos** : Vitest · Playwright

**Livrables** :
- README : lancer en local + seeder
- Note architecture : décisions prises et pourquoi
- Note tradeoffs : zones incomplètes ou compromis assumés
- (optionnel) Walkthrough Loom

**Critères de sortie** :
- `pnpm test` passe sans erreur (backend + frontend)
- `pnpm test:e2e` passe sans erreur (Playwright, app lancée en local)
- Le projet se lance depuis zéro en suivant le README
- Les notes architecture et tradeoffs sont honnêtes et précises

---

## Phase 6 — Native readiness *(bonus)*

**Objectif** : étendre le dashboard web-first vers iOS et Android.

**Pourquoi en dernier** : le web est l'exigence principale de l'assignment. Le native est un signal positif si le temps le permet — il ne doit jamais ralentir les phases critiques.

**Technos** : Expo Go · simulateurs iOS/Android · ajustements StyleSheet RN

**Critères de sortie** :
- L'app se lance sur simulateur iOS et Android sans crash
- Les écrans principaux sont lisibles et utilisables sur mobile
- Les incompatibilités de styles sont corrigées (shadow, fonts, layout)
