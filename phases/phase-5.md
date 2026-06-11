# Phase 5 — Intégration finale & livrables

## Plan

Phase de clôture : valider la suite de tests complète, corriger les régressions, puis produire les livrables attendus par l'assignment (README, note architecture, note tradeoffs).

Contrainte structurelle connue : les tests E2E Playwright ne peuvent pas être lancés sans les deux serveurs actifs (pas de `webServer` config dans `playwright.config.ts`).

## Livraison

**Tests Vitest** : 67/67 ✅ — pas de régression. Backend integration tests (routes sur vraie DB) + frontend Testing Library (primitives UI).

**Tests E2E Playwright** : 11/11 ✅ après les correctifs suivants :

| Problème | Fix |
|----------|-----|
| CORS absent — le dashboard ne pouvait pas appeler le backend | `app.use("/*", cors())` dans `services/backend/src/app.ts` (`hono/cors`) |
| URLs Expo Router avec groupes `(app)/` dans les specs | Expo Router strippe les route groups sur le web : `/(app)/orders` → `/orders`. Correction sur 4 fichiers spec. |
| `getByPlaceholder("Tous les statuts")` | Le `Select` est un `Pressable` (div), pas un `<input>`. Remplacé par `getByText("Tous les statuts").click()`. |
| `locator("table tbody tr, [role=row]")` | Le `Table` utilise des `View`/`Pressable` (divs), pas d'éléments HTML natifs. Remplacé par `getByText(/#\d+/).first()`. |
| `getByRole("switch")` (timeout) | Le wait précédent matchait la sidebar avant que le contenu soit chargé. Corrigé en attendant un élément de contenu (`text=Ajouter un article`). |
| `[aria-checked]` absent du DOM | RN Web rend `role="switch"` mais pas `aria-checked`. Assertion remplacée par vérification du toast de mutation. |
| `getByText("Alice")` | Aucun client "Alice" dans la seed. Remplacé par `getByText("Marie Dupont")` (premier client seedé). |
| `testID="edit-item"` manquant sur Button | Ajouté sur le Button crayon dans `MenuItemRow.tsx`. Button spreads `{...rest}` → `testID` passe en `data-testid`. |
| `testID="qty-add"` manquant sur Pressable + | Ajouté sur le Pressable d'incrémentation dans `CreateOrderModal.tsx`. |
| Strict mode violations (`getByText`) | Plusieurs textes (`"En attente"`, `"Confirmée"`, `"Terminée"`, `"Statut"`) matchés sur plusieurs éléments → `.first()`, `.last()` (portal modal), ou `{ exact: true }` selon le cas. |
| `page.getByDisplayValue(newName)` | API Testing Library (React), pas Playwright. Remplacé par `expect(page.getByPlaceholder("Mon Restaurant")).toHaveValue(newName)`. |

**Livrables produits** :
- `README.md` — prérequis, lancement local en 5 étapes, instructions de seed, lancement des tests, liens vers les notes.
- `ARCHITECTURE.md` (ex-`phases/carte-projet.md`, déplacé à la racine) — finalisé (flag 🚧 retiré, Phase 5 documentée).
- `TRADEOFFS.md` (ex-`phases/tradeoffs.md`, déplacé à la racine) — 9 compromis documentés (DB locale, form state, E2E sans CI, auth, optimistic updates, hex opacity, native readiness, design de `PATCH /status`, base de test partagée).

## Décisions & questions ouvertes

**Décision — `PATCH /orders/:id/status` vs champ libre** : décision de Phase 1 défendue ici comme livrable explicite. La route dédiée entraîne que la machine à états est entièrement contrôlée côté serveur — impossible de sauter une transition par erreur ou requête malformée. Documenté dans `tradeoffs.md` (§8).

**Décision — pas de `webServer` Playwright** : Wrangler et Expo n'ont pas de mode de démarrage simple compatible avec `webServer` config de Playwright. Le README documente le prérequis explicitement. Documenté dans `tradeoffs.md` (§3).

**Question ouverte** — `aria-checked` absent sur Toggle : RN Web rend `role="switch"` mais pas `aria-checked` via `accessibilityState={{ checked }}`. L'assertion E2E passe par le toast de mutation comme proxy. Pour un test plus direct, il faudrait ajouter un `testID` au Toggle et vérifier un attribut custom (`data-checked`).
