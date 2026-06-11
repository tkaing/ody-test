# Ody — Odyssey Technical Assignment

## Contexte du projet

- Test technique Odyssey : application fullstack de gestion de restaurant
- Timebox : 1–2 jours
- Évaluation : qualité frontend, design backend, type safety, architecture, UX, vitesse d'exécution
- L'usage IA est pleinement autorisé — la qualité finale reflète la maîtrise de l'outil, pas son absence

**Livrables attendus** : repo GitHub · instructions pour lancer en local · seed data · note sur les décisions d'architecture · note sur les compromis ou zones incomplètes · (optionnel) walkthrough Loom

## Stack imposée

| Couche | Techno | Chemin |
|--------|--------|--------|
| Monorepo | pnpm workspace + Turborepo | racine |
| Frontend | Expo + React Native + Web | `apps/dashboard` |
| Backend | Hono on Cloudflare Workers | `services/backend` |
| BDD | PostgreSQL + Drizzle ORM | `services/backend` |
| Validation | drizzle-zod | `services/backend` |
| Contrat API | OpenAPI generation + Orval | `packages/api-client` |
| Data fetching | React Query (hooks générés Orval) | `apps/dashboard` |
| Packages partagés | shared · types · api-client | `packages/` |

**Alternatives interdites** : Next.js · NestJS · Prisma · tRPC · Supabase · Firebase · types frontend écrits à la main

## Comment utiliser ce repo

1. Ouvrir `PROGRESSION.md` en début de session
2. Identifier la prochaine étape non cochée
3. Valider explicitement l'étape une fois livrée — Claude coche ensuite dans `PROGRESSION.md`

## Écart connu à ne pas reproduire — revue live obligatoire et tracée

**Ce qui s'est passé (Phase 4)** : la Phase 4 a été codée en un bloc (5 pages + tests + backend), puis le journal rédigé après coup. La revue « fichier par fichier » que j'avais promise en live n'a **pas** eu lieu. Cause racine : pour les phases 0-3, la « Lecture fichier par fichier » était une **section cochable tracée** dans `PROGRESSION.md` (impossible à oublier) ; la Phase 4 n'avait **aucune section cochable équivalente** pour sa revue live — elle ne reposait que sur ma discipline du moment, et a glissé. Le mode plan ne verrouille que le *début* de phase ; rien ne forçait l'arrêt en cours.

**Règle pour toute phase de codage à venir** :
- Chaque phase de codage **doit** avoir, dans `PROGRESSION.md`, une section **« Revue live par groupe de fichiers »** avec une case `[ ]` par groupe cohérent de fichiers — exactement comme la « Lecture fichier par fichier » des phases 0-3, mais appliquée *au fil du codage*, pas rétrospectivement.
- Je code un groupe → je m'arrête → checkpoint guidé en 5 temps (cf. `workflow.md`) → j'attends validation explicite → je coche → groupe suivant.
- Interdiction de coder une phase entière d'un bloc puis de rédiger le journal après coup. Le journal se construit au fil de l'eau, en parallèle des cases cochées.
- Si je m'engage verbalement à une cadence de revue, cet engagement prime sur « autonomie complète » : en cas de tension, je m'arrête et je demande.

## Références

@.claude/architecture.md
@.claude/tests.md
@.claude/workflow.md
@.claude/code-quality.md
