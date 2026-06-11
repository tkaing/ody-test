# Tradeoffs & zones incomplètes

Compromis assumés et points qui mériteraient plus de travail dans un contexte hors timebox.

---

## 1. Base de données locale vs production

Le backend tourne sur Cloudflare Workers (Wrangler en local). En production réelle, Workers n'accède pas directement à PostgreSQL : il faudrait migrer vers **D1** (SQLite Cloudflare) ou **Neon** (Postgres serverless via HTTP). Le schéma Drizzle supporte les deux, mais la migration nécessiterait de revoir le driver et les bindings Wrangler.

Choix retenu : PostgreSQL local via Docker. Rapide à bootstrapper pour un test technique, et Drizzle isole bien le changement de driver si besoin.

---

## 2. Form state et React Query

Dans `SettingsPage` et les modales de menu (`CategoryModal`, `ItemModal`), le formulaire est initialisé via un `useEffect` qui surveille les données retournées par le hook Orval. Ce pattern a une limite : si React Query refetch les données en background pendant que l'utilisateur remplit le formulaire, le `useEffect` réinitialise les champs non sauvegardés.

La solution idiomatique : **React Hook Form** + `reset(data, { keepDirtyValues: true })` qui ne réinitialise que les champs non modifiés. Non implémenté pour rester dans la stack minimale imposée.

---

## 3. Tests E2E sans `webServer` config

Playwright nécessite les deux serveurs (backend + dashboard) lancés manuellement avant `pnpm test:e2e`. Le fichier `playwright.config.ts` n'a pas de config `webServer` car Wrangler (backend) et Expo (dashboard) démarrent avec des processus complexes qui ne se prêtent pas facilement à un spawn automatique.

En CI, il faudrait soit ajouter la config `webServer` avec des health checks adaptés, soit utiliser un workflow GitHub Actions qui démarre les serveurs en background avec `&` et `wait-on`.

---

## 4. Pas d'authentification

Le dashboard n'a aucune couche d'auth. En production : middleware Hono pour valider un JWT ou une session, protéger toutes les routes backend, et ajouter une page de login côté Expo.

---

## 5. Pas d'optimistic updates

Les mutations (toggle disponibilité, transition de statut) attendent la réponse serveur avant de mettre à jour l'UI. Pour un tableau de bord restaurant où la latence est faible (réseau local), c'est acceptable. Sur un réseau mobile ou avec un backend distant, un optimistic update + rollback en cas d'erreur améliorerait la réactivité perçue.

---

## 6. Hex opacity hack dans les KPI cards

`colors.ui.interactive + "1a"` dans `KpiCard` et `PopularItemsList` : concaténer `"1a"` (10 % d'opacité en hex) à une couleur hex fonctionne uniquement si la couleur de base est sur exactement 6 chiffres (#RRGGBB). Un token dédié `colors.ui.interactiveSurface` ou l'utilisation de `rgba()` serait plus robuste.

---

## 7. Native readiness (Phase 6 non réalisée)

Le dashboard est **web-first** et n'a pas été testé sur iOS/Android dans le temps imparti. Des ajustements seraient nécessaires :
- `boxShadow` (CSS) → `shadow*` props RN pour les cards
- `fontWeight: 600` (number) → string `"600"` si une ancienne version de RN est ciblée
- Scroll comportement sur mobile (SafeAreaView, KeyboardAvoidingView)
- Navigation tabs au lieu de sidebar sur petits écrans

---

## 8. `PATCH /orders/:id/status` vs champ libre

Choix délibéré : exposer une route dédiée `PATCH /orders/:id/status` plutôt que de laisser le front patcher le champ `status` librement via `PATCH /orders/:id`. Avantage : la machine à états est entièrement enforced côté serveur — impossible de sauter une étape ou de revenir en arrière par erreur ou par requête malformée. Contrepartie : un client qui veut corriger une erreur de statut doit passer par le support (pas de back-office admin ici).

---

## 9. Base de test partagée avec le dev

Les tests d'intégration backend (Vitest) tournent sur une **vraie** base, et c'est délibérément la **même** que celle du dev et de l'E2E : `ody_db` sur `localhost:5432`. Le helper de test (`__tests__/helpers/db.ts`) fait `TRUNCATE ... RESTART IDENTITY CASCADE` dans un `beforeEach`, ce qui **efface toute donnée seedée** à chaque run de `pnpm test`.

Conséquence : lancer `pnpm test` vide la base. Comme le flux E2E re-seede juste avant de tourner (cf. README), l'ordre habituel reste sûr ; mais il ne faut pas lancer `pnpm test` sur une base dont on veut conserver le contenu.

La solution propre serait une **base de test dédiée** (`ody_test`) : comme le helper lit `process.env.DATABASE_URL`, il suffirait de lancer Vitest backend avec cette variable surchargée et d'appliquer les migrations sur cette base. Les tests deviendraient totalement isolés des données de dev/E2E, et l'ordre des commandes n'aurait plus d'importance. Non implémenté pour rester sur un setup Docker à une seule base, suffisant dans le timebox.
