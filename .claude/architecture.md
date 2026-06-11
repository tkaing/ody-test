# Architecture — règle centrale

```text
Drizzle schema → drizzle-zod → Hono/OpenAPI → Orval → types/hooks frontend
```

- La vérité des données commence dans le schéma Drizzle — toujours
- Les contrats API sont générés, jamais dupliqués manuellement
- Les types frontend viennent uniquement des sources générées ou partagées
- Le data fetching utilise les hooks générés par Orval
- Les composants présentationnels restent focalisés sur l'UI
- La logique métier vit dans les hooks/services/backend, pas dans les composants de page
- Les tokens de design sont centralisés, jamais éparpillés

## À ne jamais faire

- DTOs frontend écrits à la main pour les données backend
- Enums ou types de statut dupliqués entre frontend et backend
- `fetch` brut comme pattern principal de l'app
- Éditer manuellement les artefacts générés par Orval
- Exporter des constantes domaine (labels, options de filtre, mappings) depuis un fichier de composant UI — elles vont dans `apps/dashboard/constants/`

## Séparation composant UI / constantes domaine

- Les composants UI (`components/ui/`) ne contiennent que la logique de rendu visuel
- Les constantes domaine liées à l'UI (labels de statut, options de filtre, mappings status→couleur) vivent dans `apps/dashboard/constants/` (ex : `orderStatus.ts`)
- Un composant importe ses constantes depuis `constants/`, pas l'inverse
