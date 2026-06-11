# Phase 0 — Setup & infra

## Plan

**Objectif** : poser les fondations du monorepo avant d'écrire la moindre ligne de logique métier. Tout le reste en dépend — un monorepo mal structuré coûte cher à corriger en cours de route.

**Choix structurels :**

- **Turborepo** avec pipelines `dev`, `build`, `lint`, `typecheck`, `test`, `gen:contract` — la pipeline `dev` est `persistent: true` et `cache: false` pour ne pas bloquer les serveurs de dev.
- **`tsconfig.base.json` strict** (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) étendu par chaque package — garantit que toute erreur de type est attrapée au plus tôt, quel que soit le package.
- **ESLint 9 flat config** (`typescript-eslint` strict) à la racine, partagée — une seule source de vérité pour les règles de lint.
- **PostgreSQL 16 Alpine** dans Docker Compose avec healthcheck — Alpine pour la légèreté, healthcheck pour éviter les race conditions au démarrage.
- **Wrangler local** (port 8787) avec `.dev.vars` pour les secrets — `.dev.vars` est gitignorée, `wrangler.toml` contient uniquement les valeurs non-sensibles.
- **Drizzle config** avec `dialect: "postgresql"` et migrations dans `services/backend/drizzle` — la migration initiale sera générée en Phase 1 après la définition du schéma.
- **`packages/types`** créé dès cette phase avec `OrderStatus` et les transitions valides — c'est la seule source de vérité pour les statuts, partagée entre backend et frontend sans duplication.
- **Orval config** et instance axios préparés dans `packages/api-client` — prêts à être activés en Phase 2 dès que le contrat OpenAPI est généré.

---

## Livraison

**Fichiers créés :**

| Fichier | Rôle |
|---------|------|
| `package.json` (racine) | Scripts monorepo + dépendances dev |
| `pnpm-workspace.yaml` | Déclaration des workspaces + `allowBuilds` |
| `turbo.json` | Pipelines Turborepo |
| `tsconfig.base.json` | Config TypeScript stricte partagée |
| `eslint.config.mjs` | ESLint 9 flat config partagée |
| `docker-compose.yml` | PostgreSQL 16 local |
| `.gitignore` | Exclusions (node_modules, dist, artefacts générés) |
| `services/backend/package.json` | Dépendances backend (Hono, Drizzle, Wrangler, Vitest) |
| `services/backend/tsconfig.json` | Config TS backend (CF Workers types) |
| `services/backend/wrangler.toml` | Config Wrangler local |
| `services/backend/.dev.vars` | Variables d'env locales (gitignorées) |
| `services/backend/drizzle.config.ts` | Config Drizzle Kit |
| `apps/dashboard/package.json` | Dépendances frontend (Expo, RN, React Query) |
| `apps/dashboard/tsconfig.json` | Config TS dashboard |
| `apps/dashboard/app.json` | Config Expo (web + iOS + Android) |
| `apps/dashboard/babel.config.js` | Config Babel pour Expo |
| `apps/dashboard/app/_layout.tsx` | Root layout avec QueryClientProvider |
| `apps/dashboard/app/index.tsx` | Redirection vers `/(app)/home` |
| `apps/dashboard/app/(app)/_layout.tsx` | Layout groupe app |
| `apps/dashboard/app/(app)/home.tsx` | Page home placeholder |
| `apps/dashboard/app/(app)/ui-library.tsx` | Route UI Library placeholder |
| `packages/types/src/index.ts` | `OrderStatus`, transitions valides, `canTransition()` |
| `packages/shared/src/index.ts` | Re-export types + utilitaires monnaie |
| `packages/api-client/orval.config.ts` | Config Orval (React Query + axios) |
| `packages/api-client/src/axios-instance.ts` | Instance axios configurée |

**Vérifications :**
- `pnpm install` → 1162 packages, aucune erreur
- `wrangler --version` → 3.114.17
- `expo --version` → 0.22.28
- Builds natifs (esbuild, workerd, sharp) approuvés via `allowBuilds`

---

## Décisions & questions ouvertes

**Packages internes exportés en source `.ts` (pas de build)** *(décision constatée pendant la lecture fichier par fichier — groupe 0a)* — `@ody/shared` et `@ody/types` pointent leur `main`/`types`/`exports` directement sur `./src/index.ts` et ne définissent aucun script `build` (uniquement `tsc --noEmit`). C'est le pattern *internal / just-in-time packages*. Ça tient parce que **chaque** consommateur transpile lui-même le TS : backend (wrangler/esbuild), dashboard (Metro/Expo), scripts (tsx), tests (vitest) — aucun n'a besoin de JS pré-compilé. Avantage : pas d'étape de build des packages partagés, changements instantanés. Compromis assumé : ces packages ne sont pas publiables sur npm tels quels et un consommateur non-TS ne pourrait pas les utiliser — sans importance pour un monorepo interne.

**Conséquence : `^build` et `declaration`/`declarationMap` sont dormants** *(constat lié à la décision ci-dessus)* — `"dependsOn": ["^build"]` dans `turbo.json` cherche une tâche `build` chez les packages amont ; comme shared/types n'en ont pas, Turbo l'ignore en silence → la directive est inerte. De même, `declaration`/`declarationMap` dans `tsconfig.base.json` n'émettent rien puisque les packages tournent en `--noEmit`. Ce sont des vestiges du scénario « package compilé en `dist/` » non utilisé ici. Inoffensifs ; à retirer seulement si on veut un `turbo.json` qui reflète exactement ce qui tourne.

**Backend scindé en deux `tsconfig` par runtime** *(décision constatée — groupe 0b)* — `tsconfig.json` (`src/`) charge `types: ["@cloudflare/workers-types"]`, `tsconfig.scripts.json` (`scripts/`) charge `types: ["node"]`. Raison : `src/` tourne dans le runtime Cloudflare Workers (pas de `process`, `fetch` façon Workers), `scripts/` (seed, export-openapi) tourne dans Node via tsx. Le champ `types` de TS est exclusif → impossible de charger proprement les deux jeux de globals dans une seule passe. D'où `"typecheck": "tsc --noEmit && tsc -p tsconfig.scripts.json --noEmit"`. C'est la réponse idiomatique au cas « un package, deux runtimes ».

**[ ] Question ouverte : asymétrie de rigueur TS front ↔ back** *(groupe 0b)* — le dashboard étend `expo/tsconfig.base` + `strict: true`, mais **pas** `tsconfig.base.json` du repo. Conséquence : `exactOptionalPropertyTypes` et `noUncheckedIndexedAccess` (durcissements définis dans la base) ne s'appliquent **pas** au front. Le back et les packages sont donc typés plus strictement que le dashboard. À trancher **avant la Phase 4** : soit réaligner le dashboard sur les flags stricts (et absorber les erreurs maintenant, terrain vide), soit assumer le compromis et laisser le preset Expo piloter. Non tranché à ce stade.

**`nodejs_compat` = maillon structurant du backend** *(constat — groupe 0c)* — `compatibility_flags = ["nodejs_compat"]` dans `wrangler.toml` réactive les APIs Node (sockets TCP, `Buffer`) qu'un Worker n'a pas par défaut. C'est lui qui permet au driver `postgres` (postgres-js) d'ouvrir une connexion TCP vers Postgres. Sans ce flag, « Hono sur Workers » + « Postgres classique » ne tiendraient pas ensemble. Ligne facile à copier sans voir qu'elle est porteuse.

**→ Tradeoff à porter dans la note Phase 5 : setup DB local-dev, pas production-ready** *(groupe 0c)* — postgres-js + `nodejs_compat` se connecte à un Postgres `localhost` sous `wrangler dev` parce que workerd local a accès au réseau de la machine. Un Worker **déployé** sur Cloudflare ne peut pas ouvrir un TCP vers un Postgres arbitraire : il faudrait **Hyperdrive** (pooler/proxy CF) ou un driver HTTP (Neon serverless, etc.). Tradeoff assumé et défendable pour un test technique (on démontre l'archi, pas le déploiement). **À agréger dans le livrable « note tradeoffs » de la Phase 5.** Détail annexe : la connection string est dupliquée dans 3 fichiers (`wrangler.toml [vars]`, `.dev.vars`, fallback `drizzle.config.ts`) — acceptable en local.
