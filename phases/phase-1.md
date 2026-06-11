# Phase 1 — Schéma & contrat API

## Plan

### Choix d'architecture

**Pattern app factory (`createApp(db: Db)`)**
Le cœur de la décision : l'app Hono est instanciée avec une connexion DB injectée, pas lue depuis l'environnement. Ça permet d'appeler `createApp(testDb)` dans les tests Vitest sans passer par Wrangler. L'entry point Workers (`src/index.ts`) crée le DB depuis `c.env.DATABASE_URL` et passe le tout à `createApp`. Séparation propre entre l'infrastructure Workers et la logique applicative.

**`inArray` pour la vérification des items de commande**
Au lieu de N requêtes individuelles, une seule requête `WHERE id IN (...)` charge tous les items d'une commande. Simple, lisible, et extensible si le panier grossit.

**Statut settings = singleton id=1 avec upsert**
La table settings n'a pas de serial auto-increment — `id: integer().default(1)`. GET initialise la ligne si elle n'existe pas (`onConflictDoNothing`), PATCH fait un vrai upsert (`onConflictDoUpdate`). Pas besoin de logique de migration séparée pour les defaults.

**pgEnum réutilisé depuis `@ody/types`**
`ORDER_STATUSES` et `canTransition` viennent du package partagé. Le pgEnum est déclaré une seule fois à partir de cette constante. Zéro duplication entre backend et types partagés.

**Tests séquentiels (`singleFork: true`)**
Les tests d'intégration partagent la même DB. Exécution séquentielle pour éviter les conflits de TRUNCATE concurrent entre suites.

## Livraison

**Fichiers créés** : 23 (schéma, DB factory, app factory, entry point Workers, 8 routes, export-openapi script, 8 suites de tests, helper de test, vitest config)

**Résultats** :
- `pnpm test` → **34/34 tests verts**
- `pnpm gen:openapi` → `openapi.json` généré (40 kb, toutes les routes documentées)
- Migration initiale appliquée (6 tables)

**Couverture métier** :
- Rejet items indisponibles à la création de commande ✓
- Vérification total server-side ✓
- Transitions de statut enforced via `canTransition()` ✓
- KPIs home/summary (totalOrders, revenue, pendingCount, popularItems) ✓

## Décisions & questions ouvertes

**`unitPrice` snapshot vs. log de delta** — On fige le prix au moment de la commande dans `order_items.unit_price`. Alternative non retenue : stocker uniquement la variation de prix (delta) dans un log d'audit. Rejeté car sur-engineered pour ce contexte : le delta est utile si on veut reconstituer l'historique des changements de prix (analytics pricing), mais pour l'affichage des commandes historiques, le snapshot suffit et est plus simple à requêter. À reconsidérer si un besoin d'audit de prix émerge.

**Doublons de `menuItemId` dans POST `/orders` → rejet 422** *(décision prise pendant le rattrapage)* — comportement toléré silencieusement avant : deux lignes avec le même item insérées séparément. Décision : rejeter avec un message explicite ("Items en double : fusionner les quantités avant envoi"). Raison : incohérence silencieuse pire qu'un rejet clair ; c'est au client de normaliser son payload.

**`canTransition` déplacé de `@ody/types` vers `@ody/shared`** *(décision prise pendant le rattrapage)* — `packages/types` ne doit contenir que des types et constantes servant à les dériver. `ORDER_STATUS_TRANSITIONS` (donnée) et `canTransition` (logique) ont été déplacés dans `packages/shared`. `ORDER_STATUSES` reste dans `types` car il sert à dériver le type `OrderStatus` — le séparer créerait une dépendance circulaire. Le backend a reçu `@ody/shared` comme dépendance workspace.

**Résidu `if (order.customerId)` supprimé dans `orders-id.ts`** *(nettoyage pendant la lecture 1e)* — après le passage de `customerId` en NOT NULL, le guard conditionnel avant la requête client était devenu mort. Simplifié en destructuring direct : `const [customer = null] = await db.select()...`.

**DELETE catégorie bloqué si items actifs** *(décision prise pendant la lecture 1d)* — `DELETE /menu-categories/:id` retourne 422 si la catégorie contient des items avec `available = true`. Si tous les items sont désactivés, la suppression passe (le cascade DB supprime les items désactivés, la FK sur `order_items` protège les items référencés dans des commandes). Deux tests ajoutés : bloc avec items actifs · réussite après désactivation.

**Annulation limitée à `pending` et `confirmed`** *(décision validée pendant la lecture 1b)* — `cancelled` est accessible depuis `pending` et `confirmed` uniquement. `preparing`, `ready` ne peuvent pas être annulées. Règle délibérée : une commande en cuisine ne s'annule plus côté logiciel (il faut gérer ça en salle). Codé dans `ORDER_STATUS_TRANSITIONS` dans `@ody/shared`.

**`customerId` NOT NULL sur `orders`** *(décision prise pendant la lecture 1a)* — Le champ était nullable (commandes anonymes possibles). Rendu obligatoire : pour un dashboard restaurant, une commande sans client perd toute la traçabilité CRM. Impact propagé : migration `0001`, route `POST /orders` (body requis), seed (4 commandes anonymes réassignées), 3 fichiers de tests (helpers `createOrder`/`seedOrderWithStatus` mis à jour). 35/35 tests verts après propagation.

**Schemas nommés via `$ref` dans le contrat OpenAPI** *(décision prise pendant la lecture 1f)* — Les schémas de réponse étaient tous inlinés dans `openapi.json` : le type `OrderStatus` était dupliqué 6 fois, et les types de réponse (`Order`, `MenuItem`…) étaient anonymes. Correction : création de `src/routes/schemas.ts` qui centralise tous les schémas avec `.openapi('NomDuSchema')`. Chaque route importe depuis ce fichier au lieu de redéfinir `createSelectSchema()` localement. Résultat : `components.schemas` contient 9 schémas nommés, Orval génère un seul `OrderStatus` importé partout, et les types `Order`, `MenuItem`, `Customer`, etc. sont des interfaces TypeScript nommées et réutilisables.

**`price` en centimes (integer)** — Pratique standard (Stripe, Adyen, etc.). 21,99 € = `2199` centimes : aucune perte de précision sur les prix courants. Ce qu'on ne peut pas représenter : fractions de centime (21,999 €) — inexistant en restauration. L'avantage : `1250 + 950 = 2200` garanti exact, vs `12.50 + 9.50 = 22.000000000000004` en float JS.

## Points de revue

Les 7 endroits les plus importants à lire dans cette phase, par ordre de criticité métier.

| Fichier | Symbole / lignes | Pourquoi c'est critique |
|---------|-----------------|------------------------|
| `packages/types/src/index.ts` | `canTransition()` l.13 | Seul endroit où les transitions valides sont définies — toute la logique de statut repose dessus. Si une transition est mal codée ici, les tests passent quand même si le test ne la couvre pas. |
| `services/backend/src/routes/orders.ts` | l.83–122 | Les 3 règles métier en chaîne : rejet items indisponibles → calcul total server-side → insertion commande + items. C'est le flux le plus critique du backend. |
| `services/backend/src/routes/orders-status.ts` | `canTransition()` l.48 | Vérifie que la transition est bien rejetée avant l'UPDATE. Un `return` manquant ici laisserait passer n'importe quelle transition. |
| `services/backend/src/db/schema.ts` | `orderStatusEnum` l.4 | Le pgEnum est construit depuis `ORDER_STATUSES` partagé — zéro duplication. Si jamais tu vois un enum défini localement ici, c'est une régression. |
| `services/backend/src/app.ts` | `createApp(db)` l.12 | Pattern d'injection DB qui rend les tests possibles sans Wrangler. Comprendre ce pattern avant d'ajouter de nouvelles routes. |
| `services/backend/src/index.ts` | l.10–11 | Séparation infra Workers / logique app. `createDb` ici, `createApp` ailleurs — ne pas mélanger. |
| `services/backend/src/routes/settings.ts` | `onConflictDoNothing` l.50 · `onConflictDoUpdate` l.60 | Singleton upsert : GET initialise la ligne si absente, PATCH met à jour. Pattern inhabituel à comprendre pour ne pas casser le comportement attendu. |
