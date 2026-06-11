# Phase 4 — Pages + intégration

## Plan

### Deux décisions d'architecture tranchées avant de coder

**1. CRM enrichi côté backend (CustomerWithStats)**

Le besoin CRM nécessitait d'afficher par client : nombre de commandes, dépense totale, dernières commandes. Deux options :
- Option A (choisie) : enrichir la route GET `/customers` côté backend avec un SQL JOIN + `count` + `sum`, générer un nouveau schema `CustomerWithStatsSchema` via drizzle-zod, régénérer le contrat OpenAPI, laisser Orval mettre à jour le hook.
- Option B (rejetée) : récupérer les données brutes au front et calculer client-side.

Option A respecte la chaîne d'archi (`Drizzle → drizzle-zod → Hono → Orval → hook`), évite les DTOs manuels, et garde la logique d'agrégation proche de la DB.

Implémentation : 2 requêtes Drizzle (1 LEFT JOIN pour agrégats, 1 `inArray` pour les commandes récentes), merge in-memory → O(n) plutôt que N+1.

**2. Extension du schéma Settings**

Settings existant : `restaurantName`, `prepTime`, `autoAccept`. La page Settings devait inclure "disponibilité du restaurant" et "horaires d'ouverture" → extension du schéma Drizzle avec `isOpen: boolean` et `openingHours: text`, migration générée, tout le reste (validation, contrat, hook) propagé automatiquement.

Fix notable : après l'extension, `createInsertSchema(settings, {...}).partial()` produisait `restaurantName?: unknown` (comportement drizzle-zod avec les overrides). Remplacé par un `z.object({...})` explicite pour le schema PATCH — plus lisible et sans dépendance fragile à l'inférence.

**3. Nouveau primitif : Toggle**

Nécessaire pour `autoAccept`, `isOpen` (Settings) et `available` (Menu). Animé via `Animated.timing` + `useNativeDriver: true`. Track color depuis les tokens sémantiques (success.icon quand actif).

### Structure des composants

Chaque page est découpée en sous-composants focalisés, selon la règle <150 lignes par fichier :
- `components/home/` — KpiCard, PopularItemsList
- `components/crm/` — CustomerRow
- `components/menu/` — CategorySection, MenuItemRow, CategoryModal, ItemModal
- `components/orders/` — OrderFilters, StatusActions, OrderDetailModal, CreateOrderModal

Les constantes domaine (labels de statut, options de filtre) vivent dans `apps/dashboard/constants/`, pas dans les composants.

---

## Livraison

- **Backend** : schéma Settings étendu + migration `0002_mighty_revanche.sql` · `CustomerWithStats` via SQL JOIN 2-queries · `settingsPatch` schema Zod explicite
- **Regen** : contrat OpenAPI régénéré · Orval mis à jour (`CustomerWithStats` dans les hooks et types)
- **Primitif** : `Toggle` animé ajouté au design system
- **5 pages** : Home (4 KPIs + popular items) · Orders (liste filtrée, détail modal, transitions statut, création multi-step) · CRM (search debounced, CustomerRow enrichi) · Menu (CRUD catégories + items, toggle dispo) · Settings (form contrôlé, 5 champs)
- **16 tests Playwright** : 1 Home · 4 Orders · 1 CRM · 4 Menu · 1 Settings (spec files créés dans `e2e/phase4/`)
- **Qualité** : `pnpm typecheck` 5/5 vert · `pnpm lint` 2/2 vert

---

## Décisions & questions ouvertes

### Décisions tranchées

- **CustomerWithStats côté backend** : agrégats SQL via JOIN + `inArray`, pas de calcul front. Raison : chaîne d'archi + pas de DTO manuel.
- **settingsPatch explicite** : schéma Zod `z.object({...})` au lieu de drizzle-zod inféré, car le `.partial()` sur overrides produisait `unknown`. Plus robuste.
- **2-query CRM** : 1 requête d'agrégation + 1 `inArray` pour les récentes → O(n) sans N+1.
- **Select générique `T extends string | number`** : étendu depuis `string` pour permettre `Select<number>` (IDs catégories, IDs clients).
- **Expo port 8081** : Metro web bundler utilise 8081, pas 8080. Playwright config ajustée.
- **`GetMenuItemsAvailable.true`** : l'enum Orval génère `"true"` comme string, pas le booléen `true`. Utilisé tel quel dans CreateOrderModal.
- **`children?: React.ReactNode`** : rendu optionnel sur Button pour les boutons icon-only (patch, trash).
- **void invalidateQueries** : ESLint `no-floating-promises` → toutes les invalidations wrappées avec `void`.
- **Toggle thumb `"#ffffff"` → `colors.ui.surface`** : seule valeur magique trouvée dans le primitif Toggle, corrigée en checkpoint 4c.

### Questions ouvertes

- [ ] Les tests Playwright (`pnpm test:e2e`) n'ont pas encore été lancés en intégration réelle (nécessite backend + frontend démarrés simultanément).
- [ ] `/code-review` sur le diff Phase 4 : pas encore fait (le projet n'a pas de repo git initialisé — à faire après `git init` en Phase 5).

### Tradeoffs retenus pour la note finale

- **Slice JS des commandes récentes** (CRM) : la requête `inArray` charge toutes les commandes de tous les clients, le slice à 3 se fait en JS. Sur forte volumétrie, une window function SQL serait préférable — assumé comme compromis acceptable pour un restaurant (volumétrie bornée). Validé checkpoint 4a.
