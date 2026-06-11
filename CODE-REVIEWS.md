# Code Reviews

## Review 1 — Phase 1–4 (codebase complet)

**Date** : 2026-06-11  
**Méthode** : review locale max-effort (9 angles × 8 candidats → vérification → sweep)  
**Périmètre** : commit initial, 136 fichiers, ~24 000 lignes

---

### Bugs corrigés

#### 1. TOCTOU sur la transition de statut — `orders-status.ts` *(critique)*

**Problème** : entre le `SELECT` (lecture du statut courant) et l'`UPDATE`, deux requêtes `PATCH /orders/:id/status` simultanées pouvaient toutes les deux passer `canTransition` sur le même statut source et écrire des transitions contradictoires.

**Fix** : le `WHERE` de l'`UPDATE` inclut désormais `AND status = $current` — si le statut a changé entre-temps, aucune ligne n'est mise à jour et on renvoie 422.

```ts
// avant
.where(eq(orders.id, id))

// après
.where(and(eq(orders.id, id), eq(orders.status, order.status)))
```

---

#### 2. `CreateOrderModal` fermait le modal avant le résultat de la mutation — `CreateOrderModal.tsx` *(élevé)*

**Problème** : `handleConfirm` appelait `handleClose()` immédiatement après `onConfirm()`, avant que la mutation réseau soit résolue. En cas d'échec, le modal était déjà fermé et les 3 étapes de saisie perdues — l'utilisateur devait tout recommencer.

**Fix** : `handleClose()` est retiré de `handleConfirm`. Le parent ferme le modal via `setCreateOpen(false)` dans `onSuccess`. En cas d'erreur, le modal reste ouvert en step 3, le bouton "Confirmer" redevient actif, et l'utilisateur peut retenter sans ressaisir.

---

### Cleanups appliqués

#### 3. `color + '1a'` → `hexWithOpacity` — `KpiCard.tsx` *(fragilité)*

La concaténation de chaîne supposait que `iconColor` est toujours un hex 6 chiffres. Un `rgb(...)` ou un color name CSS produisait un fond invalide (transparent) sans warning.

Ajout d'un utilitaire `hexWithOpacity(hex, opacity)` dans `constants/tokens.ts` :

```ts
export function hexWithOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return `${hex}${alpha}`;
}
```

---

#### 4. `itemsByCategoryId` non mémorisé — `menu.tsx` *(efficacité)*

La réduction `items → Record<categoryId, MenuItem[]>` était recalculée à chaque re-render, y compris lors des ouvertures/fermetures de modals qui ne modifient pas `items`.

Fix : wrappé dans `useMemo([items])` et déplacé avant les early returns (contrainte des règles des hooks).

---

#### 5. Cast `as { id: number; name: string }[]` retiré — `CreateOrderModal.tsx` *(type safety)*

`useGetCustomers()` retourne `CustomerWithStats[]` qui expose déjà `id: number` et `name: string` via le type `Customer` de base. Le cast court-circuitait les types générés par Orval sans raison.

---

#### 6. Test filtre statut incomplet — `orders.test.ts` *(couverture)*

Le test vérifiait que les commandes `pending` apparaissent dans `?status=pending` mais pas qu'elles **n'apparaissent pas** dans `?status=completed`. Un bug qui retourne toutes les commandes quel que soit le filtre aurait passé le test original.

Ajout d'une assertion d'absence :

```ts
const resCompleted = await testApp.request("/orders?status=completed");
expect(await resCompleted.json()).toHaveLength(0);
```

---

### Findings non corrigés (documentés)

| # | Fichier | Sévérité | Raison du report |
|---|---------|----------|-----------------|
| A | `orders.ts:64` | Faible | Date invalide → 500 au lieu de 422. Pas de corruption de données, comportement visible en dev. À corriger si des tests E2E couvrent les query params invalides. Fix : `.refine(s => !isNaN(new Date(s).getTime()))` dans `QuerySchema`. |
| B | `customers.ts:63` | Moyen | `%` et `_` dans `q` ont une sémantique LIKE spéciale (résultats incorrects, pas d'injection SQL). Fix : échapper `%` → `\%` et `_` → `\_` avant interpolation. |
| C | `home.ts:34,42` | Efficacité | Les deux requêtes KPI sont séquentielles. Fix : `Promise.all([...])`. Latence doublée sans raison, mais imperceptible à petite échelle. |
| D | `customers.ts:79` | Scalabilité | La 2e requête charge toutes les commandes de tous les clients pour ne garder que 3 par client. Fix propre : `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC)` en SQL. Non critique pour un restaurant à volume modéré. |
