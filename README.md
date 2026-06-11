# Ody — Restaurant Dashboard

Technical assignment — fullstack restaurant management app.

**Stack** : pnpm workspace + Turborepo · Expo + React Native Web · Hono on Cloudflare Workers · PostgreSQL + Drizzle ORM · drizzle-zod · OpenAPI → Orval → React Query

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18+ | `node -v` |
| pnpm | 11.5+ | `pnpm -v` |
| Docker Desktop | any | must be running |

> The repo pins `pnpm@11.5.2` via the `packageManager` field. Run `corepack enable` once and the right version is used automatically — no manual install needed.

---

## Project structure

```text
ody/
├── apps/
│   └── dashboard/          # Expo + React Native Web — design system + 5 pages
│       ├── app/            #   Expo Router routes ((app)/ group = the 5 pages + /ui-library)
│       ├── components/     #   UI primitives + feature sub-components
│       └── constants/      #   centralized design tokens
├── services/
│   └── backend/            # Hono on Cloudflare Workers — the source of truth
│       ├── src/db/         #   Drizzle schema + migrations
│       ├── src/routes/     #   Hono routes + OpenAPI definitions
│       └── scripts/        #   seed + OpenAPI export
└── packages/
    ├── types/              # shared types/enums (OrderStatus…)
    ├── shared/             # shared business rules (order state machine, price format)
    └── api-client/         # Orval-generated React Query hooks (do not edit by hand)
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how these connect (the `Drizzle → drizzle-zod → OpenAPI → Orval → hooks` chain).

---

## Run locally

```bash
# 1. Clone and install
git clone <repo-url>
cd ody
pnpm install

# 2. Start PostgreSQL (--wait blocks until the DB is healthy)
docker compose up -d --wait

# 3. Run migrations
pnpm --filter backend db:migrate

# 4. Seed the database
pnpm --filter backend db:seed

# 5. Start both servers (backend + dashboard)
pnpm dev
```

The app is then available at:
- **Dashboard** → http://localhost:8081
- **UI Library** (design system showcase) → http://localhost:8081/ui-library
- **Backend API** → http://localhost:8787
- **API docs (Swagger UI)** → http://localhost:8787/doc

### Starting servers

`pnpm dev` runs both servers in parallel inside the Turborepo TUI (one terminal, two panes). To run them separately — handy when debugging a single service:

```bash
pnpm dev:backend     # Hono on Wrangler  → :8787
pnpm dev:dashboard   # Expo web          → :8081
```

> **No env setup needed.** The database connection string defaults to the local Docker instance (`postgresql://ody:ody_secret@localhost:5432/ody_db`) in `wrangler.toml` and in the migrate/seed scripts. There is no `.env` to create for local development.

---

## Seed the database

```bash
pnpm --filter backend db:seed
```

A single, **idempotent** script (`services/backend/scripts/seed.ts`): it truncates every table first, so re-running it always returns the database to the same clean, predictable state — useful before exploring manually or re-running E2E tests.

It populates realistic data:
- **4 categories** (Entrées, Plats, Desserts, Boissons) and **18 menu items** — 2 of them marked unavailable, to exercise the availability logic
- **11 customers**
- **18 orders** spread across all 6 statuses (`pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`)

---

## Explore the app

A suggested walkthrough to get the product feel quickly (run the seed first):

1. **Home** — KPIs (total orders, revenue, pending orders) and popular items, all computed server-side.
2. **Orders** — filter by status/date, open an order to see its items and customer, then advance its status. Only the *valid next* transitions are offered (the state machine is enforced on the backend). Hit **New order** to create one through the 3-step flow (customer → items → recap); unavailable items are rejected and the total is recomputed server-side.
3. **CRM** — search customers; each row shows order count, total spend and recent orders.
4. **Menu** — create/edit categories and items, toggle availability inline.
5. **Settings** — prep time, auto-accept, service availability and opening hours; save and reload to confirm persistence.
6. **UI Library** (`/ui-library`) — the design-system showcase: tokens, typography, spacing, surfaces, every reusable primitive and its states.

---

## Scripts

All scripts run from the repo root via Turborepo:

| Script | What it does |
|--------|--------------|
| `pnpm dev` | Start backend + dashboard together (Turbo TUI) |
| `pnpm dev:backend` | Start the Hono backend only (Wrangler, :8787) |
| `pnpm dev:dashboard` | Start the Expo web dashboard only (:8081) |
| `pnpm gen:contract` | Regenerate the Orval client/hooks from the OpenAPI contract |
| `pnpm lint` | ESLint across all packages |
| `pnpm typecheck` | TypeScript checks across all packages |
| `pnpm test` | Vitest — backend integration (real DB) + frontend Testing Library |
| `pnpm test:e2e` | Playwright E2E (requires both servers running — see below) |

---

## Run tests

### `pnpm test` — Vitest (backend integration + frontend)

```bash
# Postgres must be up and migrated (no seed needed — see below)
docker compose up -d
pnpm --filter backend db:migrate
pnpm test
```

- **Backend** tests hit a **real database**. Each test runs `beforeEach(truncateAll)`, so it wipes the tables and inserts exactly the rows it needs — no seed required (a seed would just be truncated away). The tables must exist, though, so the DB has to be running and migrated.
- **Frontend** tests (Testing Library) render components in isolation — no database involved.

> ⚠️ `pnpm test` runs against the **same** `ody_db` as the dev server and E2E. It truncates every table, so it **wipes any seeded data**. Don't run it against a database whose contents you want to keep — re-seed afterwards (the E2E flow below already seeds right before running, so the usual order is safe). See `TRADEOFFS.md` §9.

### `pnpm test:e2e` — Playwright (E2E)

E2E runs against the live app and asserts on **seeded** data (`Marie Dupont`, specific menu items…), so both servers must be running and the DB freshly seeded:

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm --filter backend db:seed     # required: E2E expects this exact dataset
pnpm test:e2e
```

> Playwright has no `webServer` config on purpose — Wrangler and Expo don't spawn cleanly that way. See `TRADEOFFS.md` §3.

| | DB running + migrated | Seed | Servers running |
|--|:--:|:--:|:--:|
| `pnpm test` | ✅ | — | — |
| `pnpm test:e2e` | ✅ | ✅ | ✅ |

---

## Architecture & decisions

See [`ARCHITECTURE.md`](ARCHITECTURE.md) — built incrementally across all phases. It covers the full data flow from Drizzle schema to React Query hooks, the five main product flows, and the key technical decisions.

See [`TRADEOFFS.md`](TRADEOFFS.md) — known compromises and incomplete areas.

---

## Regenerate the API client

If the backend routes change, regenerate the Orval-generated hooks:

```bash
# Backend must be running first (pnpm dev:backend)
pnpm gen:contract
```
