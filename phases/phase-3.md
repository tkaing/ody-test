# Phase 3 — Design System

## Plan

### Design system custom
Construit from scratch sans bibliothèque tierce. Ça garantit un contrôle total sur les tokens, évite les frictions de surcharge de style, et démontre la maîtrise de l'outil. `@expo/vector-icons` est le seul ajout externe (déjà installé en Phase 0).

### Structure des tokens en 4 fichiers
`colors.ts` → palette + mapping sémantique / `typography.ts` → tailles, poids, interlignage / `spacing.ts` → échelle 4px / `tokens.ts` → radius, shadow, elevation + ré-exports. Les composants importent depuis `@/constants/tokens` — un seul point d'entrée.

### Sidebar layout (Slot d'Expo Router)
Dashboard restaurant = app multi-sections dense. Sidebar fixe gauche (240px) + `<Slot />` pour le contenu. Le `<Stack>` précédent gérait des transitions de navigation non souhaitées ; `<Slot>` rend juste le contenu de la route courante, ce qui est le bon pattern pour un layout persistant.

### Tests : @testing-library/react (et non react-native)
`@testing-library/react-native` était incompatible avec Vitest/esbuild : `react-native/index.js` utilise la syntaxe Flow (`import typeof`) qui n'est pas transformée. Choix pragmatique : `@testing-library/react` + `react-native-web` (déjà alias en test) — on teste le rendu HTML réel, ce qui est cohérent avec une app web-first. Les assertions sont plus fortes (vérification du DOM, `toBeInTheDocument`).

---

## Livraison

### Tokens
- `constants/colors.ts` — palette primary + neutral + semantic (success/warning/error/info)
- `constants/typography.ts` — fontSize (xs→3xl), fontWeight (regular→bold), lineHeight
- `constants/spacing.ts` — échelle 4px base (0→64)
- `constants/tokens.ts` — radius, border, shadow (sm/md/lg), layout constants + ré-exports

### Layout & Navigation
- `components/layout/Sidebar.tsx` — sidebar dark avec liens icônés, état actif via `usePathname`
- `app/(app)/_layout.tsx` — layout horizontal sidebar + Slot (remplace Stack)

### Patterns d'état
- `components/states/LoadingState.tsx` — spinner + message
- `components/states/EmptyState.tsx` — icône + titre + description + action optionnelle
- `components/states/ErrorState.tsx` — alerte + message + bouton retry

### Primitives UI (`components/ui/`)
- `Button` — 4 variantes × 3 tailles, états hover/pressed/disabled/loading, icônes gauche/droite
- `Input` — label, error, hint, icônes, focus ring
- `TextArea` — même logique que Input, multiline
- `Select` / Dropdown — modal-based, options avec checkmark
- `Modal` — overlay, titre, footer, 3 tailles, fermeture overlay/bouton
- `Card` — variantes default/flat/elevated, padding configurable
- `Table` — colonnes déclaratives, lignes alternées, onRowPress
- `Badge` — 6 variantes + tailles sm/md
- `StatusIndicator` — map OrderStatus → Badge configuré
- `Skeleton` — variantes line/block/avatar + helpers SkeletonRow, SkeletonCard
- `Toast` / `ToastProvider` — success/error/warning/info, auto-dismiss 4s, animation

### UI Library
- `app/(app)/ui-library.tsx` — showcase complet : couleurs, boutons, badges, statuts, formulaires, table, modal, toast, skeleton, états

### Tests (4 suites — 30 assertions)
- `Button.test.tsx` — 7 tests : 4 variantes, disabled, loading (progressbar), onPress
- `Input.test.tsx` — 6 tests : label, error, hint, hint masqué par erreur, onChange, valeur contrôlée
- `Modal.test.tsx` — 5 tests : visible, titre, hidden, fermeture, footer
- `Badge.test.tsx` — 12 tests : 6 variantes Badge + 6 statuts StatusIndicator

**Résultat final** : `pnpm test` → 64/64 verts (30 Phase 3 + 34 Phase 1) · `pnpm typecheck` → 0 erreur

## Décisions & questions ouvertes

**`TouchableOpacity` → `Pressable` dans `ErrorState`** *(correction pendant la lecture 3d)* — `ErrorState` utilisait `TouchableOpacity` (ancienne API RN) pour le bouton "Réessayer" alors que tout le design system utilise `Pressable`. Uniformisé.

**`useState` → `useEffect` pour l'animation d'entrée du Toast** *(correction pendant la lecture 3c)* — `ToastItem` utilisait `useState(() => { animation.start() })` comme hack "run-once on mount". L'initializer de `useState` doit être pur (pas d'effets de bord) ; en Strict Mode React 18 il s'exécute deux fois. Corrigé en `useEffect(() => { ... }, [translateY, opacity])`. Même comportement, pattern correct.

**`STATUS_CONFIG` et `STATUS_OPTIONS` déplacés vers `constants/orderStatus.ts`** *(décision prise pendant le rattrapage)* — Ces constantes n'appartiennent pas à un fichier de composant UI. `StatusIndicator.tsx` est un composant visuel ; les mappings domaine (labels, options de filtre) vivent dans `constants/`. Règle généralisée dans `CLAUDE.md` : tout mapping status→label/couleur/option va dans `apps/dashboard/constants/`, pas dans `components/ui/`.

## Points de revue

| Fichier | Symbole / lignes | Pourquoi c'est critique |
|---------|-----------------|------------------------|
| `apps/dashboard/constants/tokens.ts` | ré-exports + radius/shadow | Point d'entrée unique pour tous les composants (`import { colors, spacing, radius } from "@/constants/tokens"`). Si un composant importe depuis un autre chemin, c'est une régression. |
| `apps/dashboard/constants/colors.ts` | palette + sémantique (success/warning/error) | Toutes les couleurs de l'app viennent d'ici. Vérifier qu'aucun composant n'a de valeur hexadécimale en dur dans son StyleSheet. |
| `apps/dashboard/components/ui/Button.tsx` | `StyleSheet.create` l.99 · import tokens l.11 | Composant de référence : montre le bon pattern (tokens → StyleSheet → variantes). Les autres composants doivent suivre la même structure. |
| `apps/dashboard/components/ui/StatusIndicator.tsx` | `STATUS_CONFIG` l.8 · import `OrderStatus` l.2 | Le type `OrderStatus` vient de `@ody/types` — jamais redéfini localement. C'est la preuve concrète que les enums ne sont pas dupliqués. |
| `apps/dashboard/components/ui/Toast.tsx` | `ToastProvider` | Pattern de feedback global à comprendre avant d'utiliser les toasts dans les pages. Le provider doit être monté en haut du layout. |
| `apps/dashboard/components/ui/Select.tsx` | modal-based | Design inhabituel : le dropdown est une modal native. À avoir en tête avant d'intégrer un select dans un formulaire — l'UX est différente d'un select HTML classique. |
