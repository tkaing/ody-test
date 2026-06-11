# Progression

Suivi opérationnel étape par étape.

**Qui coche** : dans tous les cas, c'est **Claude** qui coche la case, et seulement **après ta validation explicite**. Le marqueur `[U]` n'y change rien — il indique *qui exécute la tâche*, pas qui coche.

**Légende** : `[U]` = tâche que **tu** exécutes (Node, Docker, git push…), Claude coche une fois que tu confirmes l'avoir faite · sans marqueur = Claude exécute **et** coche après ta validation.

---

## Phase 0 — Setup & infra

**Prérequis système** *(à vérifier/installer avant de démarrer)*
- [x] [U] Node.js installé (`node -v` → 18+ attendu)
- [x] [U] pnpm installé globalement (`npm install -g pnpm` si absent)
- [x] [U] Docker Desktop installé et démarré
- [x] [U] Git installé

---

- [x] Init pnpm workspace + Turborepo à la racine
- [x] Créer la structure : `apps/dashboard`, `services/backend`, `packages/shared`, `packages/types`, `packages/api-client`
- [x] `tsconfig.json` partagé (base étendue par chaque package)
- [x] ESLint config partagée
- [x] `docker-compose.yml` : PostgreSQL local
- [x] Wrangler config pour Cloudflare Workers local (`services/backend`)
- [x] Drizzle config (connexion DB, dossier migrations)
- [x] Scripts racine : `dev:dashboard`, `dev:backend`, `gen:contract`, `lint`, `typecheck`, `test`, `test:e2e`

---

## Phase 1 — Schéma & contrat API

**Schéma Drizzle**
- [x] Table `menu_categories`
- [x] Table `menu_items` (avec champ `available`)
- [x] Table `customers`
- [x] Table `orders` (avec champ `status` typé + enum des transitions valides)
- [x] Table `order_items`
- [x] Table `settings`
- [x] drizzle-zod : schémas de validation dérivés du schéma Drizzle
- [x] Migration initiale

**Routes Hono + OpenAPI**
- [x] `menu_categories` : GET (liste), POST, PATCH, DELETE
- [x] `menu_items` : GET (liste), POST, PATCH, DELETE
- [x] `customers` : GET (liste), POST
- [x] `orders` : GET (liste + filtres statut/date), POST (création)
- [x] `orders/:id` : GET (détail + items + client)
- [x] `orders/:id/status` : PATCH (transitions valides uniquement)
- [x] `settings` : GET, PATCH
- [x] `home/summary` : GET (KPIs : total orders, revenue, pending, popular items)

**Logique métier**
- [x] Rejeter les items indisponibles à la création de commande
- [x] Calculer et vérifier le total server-side
- [x] Enforcer les transitions de statut valides (`pending → confirmed → preparing → ready → completed` / `cancelled`)

**Contrat**
- [x] Génération du contrat OpenAPI (JSON ou YAML)

**Tests Vitest — écrits juste après chaque implémentation**
- [x] `menu_categories` : GET liste · POST création
- [x] `menu_items` : GET liste · POST création · PATCH disponibilité
- [x] `customers` : GET liste · POST création
- [x] `orders` : POST création valide (total correct) · rejet payload invalide · rejet item indisponible · vérification total server-side
- [x] `orders/:id` : GET détail (items + client inclus)
- [x] `orders/:id/status` : transition valide acceptée · transition invalide rejetée
- [x] `settings` : GET · PATCH
- [x] `home/summary` : GET KPIs

**Revue critique**
- [x] `pnpm typecheck` + `pnpm lint` : zéro erreur
- [x] Gate architecture : chaîne Drizzle → drizzle-zod → Hono/OpenAPI → contrat OpenAPI respectée

---

## Phase 2 — Génération & seed

- [x] Config Orval (`orval.config.ts`) pointant vers le contrat OpenAPI, output dans `packages/api-client`
- [x] Génération des hooks React Query via Orval (`pnpm gen:contract`)
- [x] Script seed : catégories + items de menu (contenu réaliste)
- [x] Script seed : clients
- [x] Script seed : commandes avec items (statuts variés)

**Revue critique**
- [x] `pnpm typecheck` + `pnpm lint` : zéro erreur
- [x] Gate architecture : artefacts Orval générés correspondent au contrat OpenAPI · aucun fichier généré édité manuellement

---

## Phase 3 — Design System

**Tokens**
- [x] Couleurs (palette complète + sémantique : success, warning, error, info, neutral)
- [x] Typographie (familles, tailles, poids, interlignage)
- [x] Spacing scale
- [x] Radius, border, shadow, elevation
- [x] Layout/grid rules
- [x] Semantic states (loading, empty, success, warning, error)

**Patterns partagés**
- [x] `LoadingState` (skeleton ou spinner selon contexte)
- [x] `EmptyState` (message + illustration ou icône)
- [x] `ErrorState` (message + action retry)

**Primitives**
- [x] `Button` (primary, secondary, ghost, destructive · états : default, hover, active, disabled, loading)
- [x] `Input` + `TextArea` + form controls (label, error, hint)
- [x] `Select` / `Dropdown`
- [x] `Modal` / `Dialog`
- [x] `Card` / `Surface`
- [x] `Table` / `List`
- [x] `Badge` / `StatusIndicator`
- [x] Navigation (sidebar ou tabs)
- [x] `Skeleton` (variantes : ligne, bloc, avatar)
- [x] `Toast` / feedback (success, error, info)

**UI Library**
- [x] Route `/ui-library` : présente tokens, typo, spacing, surfaces, composants, états

**Tests Testing Library — écrits juste après chaque primitive**
- [x] `Button` : rendu par variante · état disabled · callback onPress
- [x] `Input` : affichage label/error/hint · saisie contrôlée
- [x] `Modal` : ouverture/fermeture · rendu du contenu
- [x] `Badge` / `StatusIndicator` : rendu par statut

**Revue critique**
- [x] `pnpm typecheck` + `pnpm lint` : zéro erreur
- [x] Tokens centralisés : aucune valeur magique (couleur, spacing, radius) hors du design system

---

## Rattrapage de revue — phases 0 à 3  *(à faire AVANT la Phase 4)*

Phases codées sans revue au fil de l'eau → on les revoit en petits chunks guidés
(code → ce que ça fait → pourquoi + alternatives → question ouverte → ta validation).
Ordre chronologique = chemin d'apprentissage. Voir `CLAUDE.md` → « Rattrapage de revue ».

**Phase 0 — setup/infra** *(léger)*
- [x] [U] Monorepo pnpm/Turborepo + structure packages
- [x] [U] Docker Postgres + Wrangler + config Drizzle

**Phase 1 — schéma & contrat** *(lourd)*
- [x] [U] Schéma Drizzle (tables, centimes, enum transitions)
- [x] [U] drizzle-zod (validation dérivée du schéma)
- [x] [U] Routes Hono (≈ Express/Fastify, rapide)
- [x] [U] Logique métier (rejet indispo, total server-side, transitions)
- [x] [U] Génération du contrat OpenAPI

**Phase 2 — génération & seed** *(moyen)*
- [x] [U] Orval : du contrat OpenAPI aux hooks React Query
- [x] [U] Scripts de seed

**Phase 3 — design system** *(très léger — terrain RN connu)*
- [x] [U] Tour rapide tokens + 1-2 primitives

---

## Lecture fichier par fichier — phases 0 à 3  *(approfondissement, après le rattrapage)*

Le rattrapage couvrait les *décisions* (pourquoi le code est ainsi) et les *flux* (`ARCHITECTURE.md`).
Cette passe couvre la **construction** : on ouvre les fichiers par petits groupes cohérents et on
comprend comment chacun est bâti et se branche au suivant. Format par groupe : rôle → parcours du
code → ce qu'il faut remarquer → à quoi ça se branche → échange. Ordre = fondation puis remontée de
la chaîne d'archi. Résidu (décision tranchée / question ouverte) → `## Décisions & questions ouvertes`
du `phase-N.md` concerné. Claude coche après validation explicite.

**Phase 0 — fondation / infra**
- [x] **0a — Monorepo & workspace** : `package.json` (racine), `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`
- [x] **0b — Manifests & lint** : `eslint.config.mjs`, `package.json` + `tsconfig.json` de chaque package
- [x] **0c — Infra DB & Workers** : `docker-compose.yml`, `wrangler.toml`, `drizzle.config.ts`, `.dev.vars`, tsconfig backend

**Phase 1 — schéma & contrat** *(le cœur — on monte la chaîne)*
- [x] **1a — Source de vérité** : `db/schema.ts`, `db/index.ts`
- [x] **1b — Partagés** : `packages/types/src/index.ts`, `packages/shared/src/index.ts` (`canTransition`, `ORDER_STATUSES`)
- [x] **1c — App factory & entry** : `src/app.ts`, `src/index.ts`
- [x] **1d — Routes CRUD simples** : `menu-categories.ts`, `menu-items.ts`, `customers.ts`, `settings.ts`
- [x] **1e — Routes métier** : `orders.ts`, `orders-id.ts`, `orders-status.ts`, `home.ts`
- [x] **1f — Contrat** : `scripts/export-openapi.ts` + survol `openapi.json`

**Phase 2 — génération & seed**
- [x] **2a — Orval** : `orval.config.ts`, `axios-instance.ts`, `api-client/src/index.ts` + 1 artefact généré représentatif
- [x] **2b — Seed** : `scripts/seed.ts`

**Phase 3 — design system**
- [x] **3a — Tokens** : `constants/` (colors, typography, spacing, tokens, orderStatus)
- [x] **3b — Primitives noyau** : `Button`, `Input`/`TextArea`, `Badge`/`StatusIndicator`
- [x] **3c — Primitives layout/feedback** : `Card`, `Modal`, `Select`, `Table`, `Skeleton`, `Toast`
- [x] **3d — États, layout & routing** : `states/*`, `layout/Sidebar`, `app/_layout`, `app/(app)/_layout`, routing Expo

---

## Phase 4 — Pages + intégration

**Layout**
- [x] Layout global (navigation, routing, structure de base)

**Home**
- [x] KPIs via hook Orval (total orders, revenue, pending orders, popular items)
- [x] *Test Playwright* : les 4 KPIs s'affichent avec des valeurs numériques issues de la base seedée

**Orders**
- [x] Liste avec filtres statut/date via hook Orval
- [x] Vue détail (items, infos client, historique statut)
- [x] Actions statut (boutons conditionnels selon transitions valides)
- [x] Flow création de commande (modal ou drawer)
- [x] *Test Playwright* : création de commande bout en bout → commande visible dans la liste avec statut `pending`
- [x] *Test Playwright* : transition de statut → nouveau statut affiché, seule l'action suivante disponible
- [x] *Test Playwright* : filtre par statut → liste filtrée correctement
- [x] *Test Playwright* : vue détail → items, client et statut affichés

**CRM**
- [x] Liste clients (order count, spend, recent orders) via hook Orval
- [x] *Test Playwright* : un client affiche son order count, spend total et commandes récentes

**Menu**
- [x] Liste catégories + items (prix, disponibilité) via hook Orval
- [x] Flow création/édition catégorie (modal ou drawer)
- [x] Flow création/édition item (modal ou drawer)
- [x] Toggle disponibilité item
- [x] *Test Playwright* : créer une catégorie → apparaît dans la liste
- [x] *Test Playwright* : créer un item → apparaît dans la catégorie
- [x] *Test Playwright* : éditer un item → modifications persistées
- [x] *Test Playwright* : toggle disponibilité → état mis à jour visuellement

**Settings**
- [x] Form complet (prep time, auto-accept, disponibilité, horaires) via hook Orval
- [x] *Test Playwright* : modifier un champ · sauvegarder · recharger → valeur persistée

**Vérifications transverses**
- [x] États hover/focus/active/disabled visibles sur tous les composants interactifs
- [x] États empty/error/loading présents sur toutes les pages
- [x] Types partagés définis dans `packages/types` (ex : enum `OrderStatus`)

**Revue critique**
- [x] `pnpm typecheck` + `pnpm lint` : zéro erreur
- [x] Gate architecture : hooks Orval utilisés partout · aucun `fetch` brut · aucun DTO écrit à la main
- [x] Artefacts Orval : aucun fichier généré édité manuellement

---

## Lecture fichier par fichier — phase 4  *(rétrospective — solde la dette de revue live)*

La Phase 4 a été codée d'un bloc, sans la revue live promise. Cette passe **rétrospective** la met à
parité avec les phases 0-3 : on ouvre les fichiers par petits groupes cohérents, format par groupe
**rôle → parcours du code → ce qu'il faut remarquer → à quoi ça se branche → échange**. Ordre =
fondation (backend) puis remontée de la chaîne d'archi (primitif → sous-composants → pages).
À faire **avant** la `/code-review` de Phase 4 (revue humaine avant revue machine). Résidu →
`## Décisions & questions ouvertes` de `phases/phase-4.md`. Claude coche après validation explicite.

- [x] **4a — Backend (source de vérité)** : extension schéma `settings` (`isOpen`, `openingHours`) + migration `0002` · route `GET /customers` enrichie `CustomerWithStats` (JOIN agrégats + `inArray` récentes) · `settingsPatch` Zod explicite
- [x] **4b — Contrat & hooks régénérés** : survol des artefacts Orval touchés (`CustomerWithStats` dans types + hook) — vérifier qu'aucun n'a été édité à la main
- [x] **4c — Primitif Toggle** : `components/ui/Toggle` (animation `Animated.timing`, couleur track depuis tokens sémantiques)
- [x] **4d — Sous-composants Orders** : `OrderFilters`, `StatusActions`, `OrderDetailModal`, `CreateOrderModal`
- [x] **4e — Sous-composants Menu** : `CategorySection`, `MenuItemRow`, `CategoryModal`, `ItemModal`
- [x] **4f — Sous-composants Home & CRM** : `KpiCard`, `PopularItemsList`, `CustomerRow`
- [x] **4g — Pages (assemblage)** : `app/(app)/` — Home, Orders, CRM, Menu, Settings (vérifier qu'elles ne font qu'assembler des sous-composants + brancher les hooks Orval)

---

## Validation de test — phases 0 à 4

- [x] `pnpm test` passe sans erreur (backend + frontend)
- [x] `pnpm test:e2e` passe sans erreur (Playwright)
- [x] Régressions E2E corrigées (CORS, URLs Expo Router, sélecteurs RN Web — détail dans `phases/phase-5.md`)

---

## Phase 5 — Livrables

- [x] README : prérequis · lancement local · seed (idempotent) · explore the app · tableau scripts · tests (prérequis DB/seed clarifiés) · UI library
- [x] Note tradeoffs (`TRADEOFFS.md`) : 9 compromis documentés (DB locale, form state, auth, optimistic updates, base de test partagée…)
- [x] Note architecture (`ARCHITECTURE.md`) : packages · chaîne d'archi · flux · décisions clés (PATCH /status, centimes, snapshot, 2-queries, drizzle-zod, frontend structure, design system) · stratégie de test · méthode IA (mode plan) · déplacé à la racine
- [ ] [U] Repo GitHub public créé et code poussé
- [ ] [U] (optionnel) Walkthrough Loom

**Code review** *(nécessite le repo git — à faire après le push)*
- [ ] `/code-review ultra` sur la phase 1 : findings corrigés
- [ ] `/code-review ultra` sur la phase 2 : findings corrigés
- [ ] `/code-review ultra` sur la phase 3 : findings corrigés
- [ ] `/code-review ultra` sur la phase 4 : findings corrigés

---

## Phase 6 — Native readiness *(bonus, si le temps le permet)*

**Objectif** : s'assurer que le dashboard fonctionne correctement sur iOS et Android, en plus du web déjà validé en Phase 4.

**Pourquoi en dernier** : le web est l'exigence principale de l'assignment. Le native est un bonus évaluable — on ne l'adresse qu'une fois toutes les phases précédentes complètes.

**Revue live par groupe de fichiers** *(checkpoint en 5 temps avant de cocher — cf. `CLAUDE.md`)*

> Chaque lot de correctifs de compatibilité RN = un arrêt → checkpoint → validation → coche. Lignes ajoutées au fil de l'eau selon les incompatibilités rencontrées.

- [ ] *(à compléter au fil de l'eau)* — chaque lot de fix styles/native : fichier(s) touché(s) → checkpoint → validation

- [ ] Vérifier le rendu sur simulateur iOS (`pnpm expo run:ios`)
- [ ] Vérifier le rendu sur simulateur Android (`pnpm expo run:android`)
- [ ] Corriger les incompatibilités de styles RN (shadow, position, fonts…)
- [ ] Mentionner l'état native readiness dans la note tradeoffs
