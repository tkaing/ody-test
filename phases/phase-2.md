# Phase 2 — Génération & seed

## Plan

**Orval** — La config était déjà en place (`packages/api-client/orval.config.ts`, script `gen:contract`, mutator `axios-instance.ts`). Deux problèmes bloquants ont été corrigés avant de générer :

1. **Pas de tags OpenAPI** — en mode `tags-split`, Orval génère un seul fichier `default.ts` si aucun tag n'est défini. Ajout de `tags: [...]` sur chaque `createRoute` pour obtenir des fichiers séparés par domaine (`customers/`, `orders/`, etc.).

2. **Path params invalides** — les path params avaient `required: false` (invalide en OpenAPI 3.0 pour les params de chemin) et `nullable: true` (issu de `z.coerce.number()`). Annotation explicite `.openapi({ param: { required: true, in: "path" } })` pour corriger le contrat.

Ces corrections ont déclenché des erreurs TypeScript latentes dans les routes :
- **drizzle-zod 0.7.0** génère des types `unknown` pour les champs text/integer/boolean via `createInsertSchema`. Résolu par des overrides explicites (`name: z.string().min(1)`, `price: z.number().int().positive()`, etc.) sur toutes les routes affectées. Exception : `available: z.boolean().optional()` (la colonne a un default DB).
- **Statuts HTTP implicites dans Hono** — sans `tags`, Hono n'évaluait pas strictement les types de retour. Avec tags, `c.json(row!)` sans statut explicite est inféré comme `200 | 404`. Corrigé en passant `200` explicitement sur tous les chemins de succès des handlers multi-statuts.

Un `tsconfig.scripts.json` séparé a été créé pour les scripts (`seed.ts`, `export-openapi.ts`) qui tournent en Node.js et ont besoin de `@types/node`, incompatible avec `@cloudflare/workers-types`.

**Seed** — script `services/backend/scripts/seed.ts` utilisant Drizzle + postgres-js directement (même pattern que `export-openapi.ts`). Données réalistes pour un restaurant français : 4 catégories, 18 items (2 indisponibles), 10 clients, 18 commandes couvrant tous les statuts (pending×4, confirmed×3, preparing×3, ready×2, completed×4, cancelled×2).

## Livraison

- Hooks Orval générés dans `packages/api-client/src/generated/` (6 fichiers par tag) + types dans `src/model/`
- `packages/api-client/src/index.ts` mis à jour pour exporter explicitement depuis chaque sous-dossier généré
- `services/backend/scripts/seed.ts` créé, `pnpm db:seed` fonctionnel
- `pnpm typecheck` passe sur les 5 packages
- `pnpm test` passe sur les 34 tests backend Phase 1

## Décisions & questions ouvertes

**`TRUNCATE ... CASCADE` remplace les `db.delete()` séquentiels** *(décision prise pendant la lecture 2b)* — Le nettoyage initial du seed supprimait les tables une par une dans l'ordre FK (`orderItems → orders → customers → menuItems → menuCategories`). Remplacé par une seule instruction `TRUNCATE menu_categories, menu_items, customers, orders, order_items CASCADE` : PostgreSQL gère lui-même l'ordre de suppression. Raison : si une nouvelle table avec FK est ajoutée, le delete séquentiel manuel doit être mis à jour — `CASCADE` le fait automatiquement. Bémol connu : `TRUNCATE` ne déclenche pas les triggers `ON DELETE`, sans impact pour un seed de dev.

## Points de revue

| Fichier | Symbole / lignes | Pourquoi c'est critique |
|---------|-----------------|------------------------|
| `packages/api-client/orval.config.ts` | config complète (23 lignes) | Contrat entre le backend et le frontend : input (openapi.json), output (target, httpClient), mutator. Toute erreur ici casse la génération silencieusement. |
| `packages/api-client/src/axios-instance.ts` | `axiosInstance` | Chaque appel HTTP du dashboard passe par là. C'est ici que configurer la baseURL, les headers, les intercepteurs d'erreur. |
| `packages/api-client/src/index.ts` | exports explicites | Si un hook généré n'est pas ré-exporté ici, il est invisible depuis `@ody/api-client`. Vérifier qu'un hook de chaque tag est bien importable. |
| `services/backend/scripts/seed.ts` | items indisponibles + commandes variées | Les 2 items `available: false` sont les seuls qui permettent de tester le rejet en vrai. Vérifier qu'ils existent bien après `pnpm db:seed`. |
