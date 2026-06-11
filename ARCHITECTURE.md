# Architecture — Ody

Vue d'ensemble de l'app : **où vit quoi**, **comment les morceaux se connectent**, **quels sont les flux principaux**.
Écrit au fil de l'eau (chaque phase ajoute quelques lignes). Lecture en altitude produit, pas navigation de code.
Ce fichier est le livrable *« architecture decisions »* de l'assignment.

> 🤖 **Sur la méthode de travail avec l'IA** : ce projet a été *piloté* via un système de fichiers explicite (cap, garde-fous, validation étape par étape, journaux au fil de l'eau), pas généré au coup par coup. Le détail est en [§6](#6-méthode-de-travail--journal-de-construction)

---

## 1. Carte des packages

| Package | Rôle en une ligne |
|---------|-------------------|
| `services/backend` | API Hono sur Cloudflare Workers + schéma Drizzle + logique métier. La **source de vérité** des données. |
| `packages/types` | Types/enums partagés front ↔ back (ex. `OrderStatus`, table des transitions valides). Jamais dupliqués ailleurs. |
| `packages/api-client` | Hooks React Query **générés par Orval** depuis le contrat OpenAPI. Le pont type-safe back → front. |
| `packages/shared` | **Règles métier** partagées front ↔ back : machine à états des commandes (`ORDER_STATUS_TRANSITIONS`, `canTransition`), formatage prix. Lues des deux côtés, jamais recopiées. |
| `apps/dashboard` | Front Expo / React Native Web : design system + 5 pages. Consomme uniquement les hooks générés. |

---

## 2. La chaîne d'architecture, rendue concrète

La règle centrale du projet — une donnée part toujours du schéma et descend jusqu'au front sans être retapée à la main :

```
schéma Drizzle ──▶ drizzle-zod ──▶ Hono + OpenAPI ──▶ contrat OpenAPI ──▶ Orval ──▶ hook React Query
services/backend    (validation     services/backend     (JSON généré)      packages/      packages/
/src/db/schema.ts    dérivée)        /src/routes/*.ts                        api-client     api-client
```

Exemple vivant : une commande est définie une seule fois dans `schema.ts` ; sa validation, son type API, et le hook `usePostOrders` du front en découlent tous automatiquement. Changer le schéma propage le type partout — une colonne ajoutée casse la compilation côté front tant qu'elle n'est pas gérée, au lieu de filer un bug silencieux.

---

## 3. Les flux principaux de l'app

- **Créer une commande** ✅ — page Orders → `CreateOrderModal` (3 étapes) → `usePostOrders` → `POST /orders` (`services/backend/src/routes/orders.ts` : rejet items indispo + total recalculé) → invalidation → commande `pending` visible.
- **Faire avancer un statut** ✅ — `OrderDetailModal` → `StatusActions` (boutons selon `ORDER_STATUS_TRANSITIONS[status]`) → `usePatchOrdersIdStatus` → `PATCH /orders/:id/status` → seule la transition suivante est offerte.
- **Gérer le menu** ✅ — page Menu → CRUD catégories/items via `CategoryModal` / `ItemModal` · toggle `available` via `MenuItemRow` · groupement client-side par `categoryId`.
- **CRM client** ✅ — page CRM → search debouncé → `useGetCustomers({ q })` → `GET /customers` (LEFT JOIN + `count` + `sum` + 3 commandes récentes) → `CustomerRow` enrichi.
- **KPIs Home** ✅ — `useGetHomeSummary` → `GET /home/summary` → `KpiCard` × 4 + `PopularItemsList`.

---

## 4. Décisions d'architecture clés

Les choix structurants du projet, avec leur *pourquoi* et l'alternative écartée.

**Route dédiée `PATCH /orders/:id/status` plutôt qu'un champ `status` librement patchable.**
Le statut n'est jamais modifiable via `PATCH /orders/:id` (le champ n'est pas dans son body — l'interdiction est une *absence d'API*, pas une convention). Une route dédiée valide la transition contre la machine à états côté serveur : impossible de sauter une étape (`pending → ready`) ou de revenir en arrière, même avec une requête forgée à la main. *Alternative écartée* : laisser le front écrire `status` directement — plus simple, mais la règle métier ne vivrait plus que dans l'UI, contournable par n'importe quel appel API. Contrepartie assumée : corriger une erreur de statut demande une intervention hors-app (pas de back-office admin). Voir `TRADEOFFS.md` §8.

Le mécanisme, en défense en profondeur depuis **une seule** source de vérité (`ORDER_STATUS_TRANSITIONS`, `@ody/shared`) :

```
ORDER_STATUSES (packages/types)
   ├─▶ enum Postgres ............... la DB rejette un statut inconnu
   └─▶ ORDER_STATUS_TRANSITIONS (packages/shared)
          ├─▶ backend  canTransition(actuel, cible) → 422 si invalide   ← LE rempart
          └─▶ frontend StatusActions n'affiche que les transitions légales
```

Le handler **relit le statut courant en base** avant de valider : le client ne fournit que la cible, il ne peut pas mentir sur l'état de départ. L'UI guide (on ne montre que le légal), mais c'est le serveur qui tranche — un `curl` qui tente `pending → completed` se prend un 422. Front et back **lisent la même table**, jamais une copie.

**Prix et totaux stockés en centimes (`integer`), jamais en flottants.**
`price`, `total` et `unitPrice` sont des entiers en centimes. On évite les erreurs d'arrondi des flottants (`0.1 + 0.2 ≠ 0.3`) sur de la donnée monétaire. Le formatage en euros se fait à l'affichage uniquement. *Alternative écartée* : `numeric`/`decimal` Postgres — exact aussi, mais plus lourd à manipuler côté JS (pas de type natif) et inutile pour des montants de restaurant.

**`unitPrice` figé en snapshot au moment de la commande.**
Chaque `order_item` copie le prix de l'item à l'instant de la commande, au lieu de référencer le prix courant du menu. Modifier le prix d'un plat ne réécrit pas l'historique des commandes passées. *Alternative écartée* : lire le prix via le menu à l'affichage — plus léger, mais le total d'une vieille commande changerait rétroactivement, ce qui est faux comptablement.

**`CustomerWithStats` en deux requêtes + fusion en mémoire, plutôt qu'un seul JOIN.**
`GET /customers` fait (1) un agrégat `count`/`sum` groupé par client, puis (2) les commandes récentes via `inArray`, fusionnés par une `Map` en JS. *Alternative écartée* : un unique JOIN avec les commandes récentes — il dupliquerait chaque ligne client par commande et compliquerait la limite « 3 récentes par client ». Deux requêtes ciblées restent lisibles et chacune fait une seule chose.

**Validation dérivée via drizzle-zod, jamais de schéma Zod tapé à la main.**
Les schémas de validation des routes sont générés depuis le schéma Drizzle (`createInsertSchema`, etc.). Une colonne ajoutée se propage automatiquement en validation, en type API, puis en hook Orval. *Alternative écartée* : des schémas Zod écrits à part — ils dériveraient silencieusement du schéma réel à la première évolution. C'est le maillon qui rend toute la chaîne d'archi (§2) non-dupliquée.

**Frontend : une page n'assemble que des sous-composants ; la logique vit dans les hooks.**
Chaque page de `app/(app)/` se contente de brancher les hooks Orval et de composer des sous-composants focalisés (`OrderFilters`, `StatusActions`, `CreateOrderModal`, `CustomerRow`…). Aucune logique métier ni `fetch` brut dans un composant de page. *Alternative écartée* : des pages monolithiques qui font fetch + état + rendu — plus rapide à écrire, mais vite illisible et intestable. Un fichier qui dépasse ~150 lignes est traité comme un signal de découpage. Effet : les sous-composants restent présentationnels et réutilisables, la donnée passe par les hooks générés.

**Design system : tokens centralisés → primitives → vitrine `/ui-library`.**
Une seule source de style (`apps/dashboard/constants/tokens.ts` : couleurs, typo, spacing, radius, ombres) ; aucune valeur magique hors de là. Les primitives (`components/ui/` : Button, Input, Modal, Table, Badge, Toast…) ne lisent que les tokens, et la route `/ui-library` les présente toutes avec leurs états. Les constantes domaine liées à l'UI (labels de statut, couleurs par statut) vivent dans `constants/`, pas dans les composants. *Alternative écartée* : des styles inline par écran — incohérence garantie et thème impossible à faire évoluer d'un point central.

---

## 5. Stratégie de test

Trois niveaux, chacun ciblé sur ce qu'il sait vraiment vérifier — pas de couverture exhaustive, de la discipline.

- **Backend — Vitest sur une vraie base, sans mock.** Les tests d'intégration tapent un vrai Postgres (chaque test `truncate` puis insère ses données). *Pourquoi pas de mock* : un mock qui passe ne dit rien sur le comportement réel SQL (contraintes, JOIN, enum). On teste le happy path *et* les cas d'erreur métier : rejet d'item indisponible, transition de statut invalide, total incorrect.
- **Frontend — Testing Library sur les primitives.** Les briques clés du design system (Button, Input, Modal, Badge) sont testées en isolation : rendu par variante, états, callbacks.
- **E2E — Playwright, un test par page/flux.** Les parcours critiques bout en bout : création de commande, transition de statut, filtres, CRM, CRUD menu, persistance des settings.

Les `describe`/`it` reprennent mot pour mot le libellé de l'étape dans `PROGRESSION.md` → un test rouge pointe directement vers l'étape concernée. Détail du lancement (prérequis DB, seed) dans le `README.md`.

---

## 6. Méthode de travail & journal de construction

Le projet n'a pas été généré au coup par coup : il a été **piloté** par un système de fichiers explicite qui sert de garde-fou à l'IA et garde une trace de chaque décision.

### Le système de pilotage

Quatre couches de fichiers, chacune avec un rôle distinct :

| Couche | Fichier(s) | Rôle |
|--------|-----------|------|
| **Le cap** | `PROGRAMME.md` | La feuille de route : les 6 phases, *pourquoi* chacune dans cet ordre, ses critères de sortie. Le « quoi » et le « pourquoi ». |
| **Le pilotage** | `PROGRESSION.md` | Le suivi opérationnel : chaque étape est une case à cocher, cochée **uniquement après validation explicite**. Le « où en est-on ». |
| **Les garde-fous** | `CLAUDE.md`, `.claude/*.md` | Les règles imposées à l'IA : chaîne d'archi obligatoire, discipline de tests, méthode de checkpoint, profil de l'utilisateur. Le « comment travailler ». |
| **La mémoire** | `phases/phase-N.md` | Un journal par phase, écrit *au fil de l'eau* : `## Plan` (choix de structure), `## Livraison` (ce qui a été produit), `## Décisions & questions ouvertes` (résidu des arbitrages). Le « ce qui a été décidé et pourquoi ». |

**Le mode plan, imposé par `CLAUDE.md`, ouvre chaque phase.** La règle (garde-fou n°1) est qu'aucune ligne de code n'est écrite avant un plan validé. Le déroulé est verrouillé :

1. lire `PROGRESSION.md` → identifier la phase suivante ;
2. **`EnterPlanMode`** → l'IA explore le repo et rédige un plan, *sans pouvoir modifier de fichier* (le mode plan est en lecture seule) ;
3. présenter le plan → l'utilisateur l'approuve ou le corrige ;
4. **`ExitPlanMode`** → l'implémentation ne commence qu'**après** approbation explicite.

Ce verrou sépare nettement *décider quoi faire* de *le faire* : on discute l'approche pendant qu'elle ne coûte rien à changer, plutôt que de réorienter du code déjà écrit. Les prérequis marqués `[U]` (Node, Docker…) doivent aussi être confirmés avant tout code.

Une fois le plan validé, la boucle de codage est : coder un groupe cohérent → checkpoint guidé (montrer le code, l'expliquer, exposer l'alternative, poser la question ouverte) → attendre la validation → cocher dans `PROGRESSION.md` → consigner le résidu dans le journal. L'IA ne coche jamais une case toute seule, et ne traite jamais une phase entière d'un bloc.

La **revue critique** est elle aussi tracée : des passes rétrospectives (« rattrapage de revue », « lecture fichier par fichier » dans `PROGRESSION.md`) rouvrent le code déjà écrit pour le relire en petits groupes — la garantie qu'aucune sortie de l'IA n'est acceptée sans relecture humaine.

### Le journal, phase par phase

**Phase 0 — Setup** ✅
Monorepo pnpm/Turborepo posé ; structure des 5 packages ; Postgres via Docker ; backend lancé en local via Wrangler. L'app sait : démarrer (`dev:backend`, `dev:dashboard`) et se connecter à la DB.

**Phase 1 — Schéma & contrat** ✅
6 tables Drizzle (`menu_categories`, `menu_items`, `customers`, `orders`, `order_items`, `settings`), prix en centimes, statut de commande typé. Validation dérivée via drizzle-zod. Routes Hono + contrat OpenAPI généré. Logique métier en place : rejet des items indisponibles, total recalculé server-side, transitions de statut contrôlées. Fichiers clés : `services/backend/src/db/schema.ts`, `services/backend/src/routes/orders.ts`, `packages/types/src/index.ts` (`canTransition`).

**Phase 2 — Génération & seed** ✅
Orval branché sur le contrat OpenAPI → hooks React Query dans `packages/api-client`. Base peuplée (catégories, items, clients, commandes à statuts variés). L'app sait : fournir au front des hooks type-safe et des données réalistes.

**Phase 3 — Design System** ✅
Tokens centralisés (`apps/dashboard/constants/tokens.ts`) + primitives UI (`components/ui/`) + route `/ui-library` qui les présente toutes. L'app sait : afficher une UI cohérente, sans valeur magique. Fichier de référence : `components/ui/Button.tsx` (pattern tokens → StyleSheet → variantes).

**Phase 4 — Pages + intégration** ✅
5 pages câblées sur les hooks Orval : Home (4 KPIs + popular items), Orders (liste filtrée + détail modal + transitions statut + création multi-step), CRM (search debounced + CustomerRow enrichi), Menu (CRUD complet catégories/items + toggle dispo), Settings (form contrôlé 5 champs). Backend enrichi : schéma Settings étendu (`isOpen`, `openingHours`) + `CustomerWithStats` via 2 requêtes SQL. Nouveau primitif `Toggle` animé. Specs Playwright créées. Fichier clé : `apps/dashboard/app/(app)/orders.tsx` (flux le plus complexe — filtres, detail modal, transitions, création multi-step).

**Phase 5 — Intégration finale & livrables** ✅
Suite de tests validée : 67/67 Vitest (backend integration + frontend Testing Library) · 11/11 Playwright E2E. Correctifs E2E : CORS manquant sur le backend (`hono/cors`) · URLs Expo Router (groupes `(app)/` strippés sur le web) · sélecteurs adaptés à RN Web (Pressable = `<div>`, Toggle = `role="switch"` sans `aria-checked`, Select = modal RN pas `<input>`, Table = divs pas `<tr>`). Livrables produits : `README.md` · `TRADEOFFS.md` · `ARCHITECTURE.md` finalisé.
