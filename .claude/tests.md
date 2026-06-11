# Tests

Les tests sont écrits **juste après l'implémentation de chaque feature**, dans la même phase — pas regroupés à la fin.

- **Phase 1 — Vitest backend** : tests d'intégration HTTP sur vraie DB (pas de mock). Une suite par route, couvrant happy path + cas d'erreur métier (rejet item indisponible, transition invalide, total incorrect…).
- **Phase 3 — Testing Library** : tests unitaires sur les primitives UI clés (Button, Input, Modal, Badge). Écrits juste après chaque composant.
- **Phase 4 — Playwright** : test E2E écrit juste après chaque page. Couvre tous les flows CRUD et les flux métier critiques (commande, statut, CRM, menu, settings).
- **Phase 5** : `pnpm test` + `pnpm test:e2e` lancés en intégration finale — seules les régressions sont corrigées ici.

`pnpm test` = Vitest (backend + frontend) · `pnpm test:e2e` = Playwright (app lancée en local)

## Format et organisation

```
services/backend/__tests__/phase1/   → Vitest backend
apps/dashboard/__tests__/phase3/     → Testing Library
e2e/phase4/                          → Playwright
```

Les `describe` et `it` reprennent mot pour mot le libellé de l'étape dans `PROGRESSION.md` :

```ts
// services/backend/__tests__/phase1/orders.test.ts
describe("Phase 1 — orders", () => {
  it("POST création valide (total correct)", ...)
  it("rejet payload invalide", ...)
  it("rejet item indisponible", ...)
})

// e2e/phase4/orders.spec.ts
describe("Phase 4 — Orders", () => {
  it("création de commande bout en bout → commande visible avec statut pending", ...)
  it("transition de statut → nouveau statut affiché, seule l'action suivante disponible", ...)
})
```

Le rapport de test affiche ainsi `Phase 1 — orders > rejet item indisponible` — directement traçable vers l'étape correspondante dans `PROGRESSION.md`.

## Tests comme outil de debug

Quand un bug survient, lancer `pnpm test` ou `pnpm test:e2e` en premier.

- **Backend (Vitest)** : `Phase 1 — orders > rejet item indisponible FAILED` → aller directement à la route `POST /orders`, règle de rejet. Pas besoin de rejouer le scénario à la main.
- **Frontend/E2E (Playwright)** : screenshot automatique au moment de l'échec → contexte visuel immédiat sans reproduire le flow manuellement.

C'est pour ça que les tests backend tournent sur vraie DB sans mock : un mock qui passe ne dit rien sur ce qui se passe réellement.
