# Exploration: GanaTrack Monorepo Bootstrap

## Current State

### Repository Overview
- **Root `ganatrack/`**: Contains PRD documents (approved) + `free-nextjs-admin-dashboard/` template + `.atl/skill-registry.md`
- **NOT a monorepo yet**: No `pnpm-workspace.yaml`, no `turbo.json`, no `apps/` or `packages/` directories
- **Template State**: `free-nextjs-admin-dashboard/` is a standalone Next.js 16.1.6 app with React 19.2.0 and Tailwind v4.1.17

### Template Structure (to be migrated)
```
free-nextjs-admin-dashboard/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Route group - admin pages
│   │   ├── (full-width-pages)/  # Auth + error pages
│   │   └── layout.tsx
│   ├── components/           # Flat component structure (NOT screaming architecture)
│   ├── layout/              # Sidebar, Header widgets
│   ├── hooks/
│   ├── context/
│   └── icons/
├── package.json             # name: "free-nextjs-admin-dashboard"
├── tsconfig.json
├── next.config.ts
└── tailwind/pnpm related configs
```

## Target Monorepo Structure (from PRDs)

```
ganatrack/
├── apps/
│   ├── api/                  # Fastify backend (NOT STARTED)
│   │   ├── src/
│   │   │   ├── modules/      # hexagonal modules
│   │   │   ├── shared/
│   │   │   ├── plugins/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   └── container.ts
│   │   └── package.json
│   └── web/                  # Next.js 15 (MIGRATE from template)
│       ├── src/
│       │   ├── app/          # SOLO routing
│       │   ├── modules/      # screaming architecture
│       │   ├── shared/
│       │   └── store/
│       └── package.json
├── packages/
│   ├── database/              # Drizzle ORM schema + client (NEW)
│   │   ├── src/schema/
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   ├── shared-types/         # Zod schemas + DTOs + enums (NEW)
│   │   ├── src/schemas/
│   │   ├── src/dtos/
│   │   ├── src/enums/
│   │   └── package.json
│   └── tsconfig/             # Shared TS configs (NEW)
│       ├── base.json
│       ├── nextjs.json
│       ├── node.json
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Analysis: Key Questions

### Q1: Current vs Target Structure
| Aspect | Current | Target |
|--------|---------|--------|
| Repo type | Single app template | pnpm monorepo + Turborepo |
| Frontend | `free-nextjs-admin-dashboard/` flat | `apps/web/` screaming architecture |
| Backend | None | `apps/api/` hexagonal |
| Packages | None | `database`, `shared-types`, `tsconfig` |
| Workspace | None | pnpm workspaces + turbo pipeline |

### Q2: Packages to Create

**NEW packages (from scratch):**
- `apps/api` - Fastify backend (later phase)
- `packages/database` - Drizzle schema + client factory
- `packages/shared-types` - Zod schemas, DTOs, enums (CRITICAL - needed first)
- `packages/tsconfig` - base.json, nextjs.json, node.json

**Migration required:**
- `apps/web` - Move from `free-nextjs-admin-dashboard/`

### Q3: Key Dependencies

**apps/web (migrated + new):**
```json
{
  "next": "^15.1.0",
  "react": "^18.3.0",  // per PRD, not 19
  "@tanstack/react-query": "^5.x",
  "zustand": "^5.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "latest",
  "zod": "^3.x",
  "ky": "latest",
  "next-intl": "^3.x",
  "serwist": "latest",
  "@radix-ui/*": "latest",
  "tailwindcss": "^4.x"
}
```

**packages/shared-types:**
```json
{
  "zod": "^3.x"
}
```

**packages/database:**
```json
{
  "drizzle-orm": "^0.30.x",
  "better-sqlite3": "^9.x",
  "postgres": "^3.x"
}
```

**apps/api (later):**
```json
{
  "fastify": "^4.x",
  "drizzle-orm": "^0.30.x",
  "@fastify/jwt": "latest",
  "@fastify/rate-limit": "latest",
  "tsyringe": "^5.x",
  "zod": "^3.x",
  "vitest": "^1.x"
}
```

### Q4: Migration of Next.js Template → apps/web/

**Steps:**
1. Create `apps/web/` directory structure per PRD §4
2. Move `src/app/` → `apps/web/src/app/` (route groups: (auth), (dashboard))
3. Create `src/modules/` structure (screaming architecture)
4. Create `src/shared/` with components/ui, hooks, lib, providers, store
5. Create `src/store/` with auth.store.ts, predio.store.ts, ui.store.ts
6. Delete old flat `src/components/` - rewrite per module structure
7. Install new dependencies
8. Update `tsconfig.json` paths for monorepo aliases
9. Update `next.config.ts`
10. Create PWA config (serwist)

**CRITICAL CHANGE:** The template uses a flat `components/` structure. The PRD demands screaming architecture where `app/` is ONLY routing and all logic lives in `modules/`. This is a significant rewrite.

### Q5: Minimal Viable Monorepo (MVM)

**Phase 1 (now):**
1. Root `package.json` with pnpm workspaces
2. `pnpm-workspace.yaml` = `['apps/*', 'packages/*']`
3. `turbo.json` with build, dev, test, lint, typecheck tasks
4. `packages/tsconfig/` (base, nextjs, node)
5. `packages/shared-types/` (critical - Zod schemas needed by both)
6. `apps/web/` migrated with Screaming Architecture

**Phase 1.5 (can be parallel):**
7. `packages/database/` (Drizzle schema, client factory)
8. `apps/api/` skeleton (container, app.ts, server.ts, basic modules)

### Q6: Risks and Gotchas

| Risk | Severity | Description |
|------|----------|-------------|
| Next.js version mismatch | HIGH | Template has 16.1.6, PRD specifies 15.x. Should use 15.x per PRD |
| Tailwind v4 CSS-first config | MEDIUM | Template uses v4.1.17 with CSS-based config. New projects may expect different setup |
| Screaming Architecture migration | HIGH | Template has flat `components/`. PRD demands `modules/` with all logic. Major rewrite |
| Turborepo cache + Next.js | MEDIUM | Need correct `outputs` in turbo.json for `.next/**` |
| pnpm strict peer errors | MEDIUM | React 19 with some libraries may have peer issues. Template has overrides for react-jvectormap |
| Path aliases in monorepo | MEDIUM | `@/*` in apps/web must work with `../../packages/shared-types` |
| tsyringe + reflect-metadata | LOW | Must import `reflect-metadata` as first line in apps/api entry points |
| Zod schema sync | MEDIUM | shared-types schemas must stay in sync between frontend/backend |
| Drizzle dual SQLite/PG | LOW | client.ts factory pattern, DATABASE_PROVIDER env var |
| tsconfig paths vs module resolution | MEDIUM | Using "paths" with baseUrl works but requires careful setup |

## Next Recommended Phase

**sdd-propose** for `monorepo-bootstrap` change:
- Define exact scope of Phase 1
- Propose: which packages first, which defer
- Define rollback plan
- Get user sign-off before sdd-spec

## Readiness

- ✅ PRDs read and understood
- ✅ Current repo state explored
- ✅ Target structure understood
- ✅ Dependencies identified
- ✅ Risks catalogued
- ⚠️ Needs decision: Next.js 15 vs 16, scope of Phase 1
