# Proposal: GanaTrack Monorepo Bootstrap

## Intent

The repo has approved PRDs but no working codebase — only a standalone Next.js 16 admin template at `free-nextjs-admin-dashboard/`. Before any feature work can begin, the repo must be a proper Turborepo pnpm monorepo with shared packages and workspace plumbing. This change establishes ONLY the infrastructure skeleton; no feature code, no screaming architecture migration, no backend implementation.

## Scope

### In Scope
- Root monorepo: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore` (updated)
- Move `free-nextjs-admin-dashboard/` → `apps/web/` (preserve exactly as-is, only relocate)
- `apps/api/` skeleton: `package.json`, `tsconfig.json`, `src/server.ts` (hello-world Fastify, no real logic)
- `packages/tsconfig/`: `base.json`, `nextjs.json`, `node.json`, `package.json`
- `packages/shared-types/`: `package.json`, `tsconfig.json`, `src/index.ts` (barrel), one example Zod schema (e.g. `AnimalSchema`)
- `packages/database/`: `package.json`, `tsconfig.json`, `src/index.ts` (placeholder export, no real schema)
- Verify `pnpm install` and `turbo build` succeed end-to-end

### Out of Scope
- Screaming Architecture migration of `apps/web/` (separate change)
- Backend implementation — modules, routes, DI, Drizzle schema (separate change)
- Database schema implementation (separate change)
- Any UI changes or new components
- Authentication, i18n, PWA setup

## Approach

1. Create root `package.json` (workspace root, no hoisted deps except tooling), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json` (build/dev/lint/typecheck/test pipeline with correct `outputs` for `.next/**`).
2. Move template directory → `apps/web/`, update its `package.json` `name` to `@ganatrack/web`, extend `packages/tsconfig/nextjs.json`.
3. Scaffold `apps/api/` with Fastify hello-world, extend `packages/tsconfig/node.json`.
4. Create `packages/tsconfig/`, `packages/shared-types/`, `packages/database/` with minimal valid TypeScript that compiles.
5. Wire internal package references (`@ganatrack/shared-types`, `@ganatrack/database`, `@ganatrack/tsconfig`) via `workspace:*` protocol.
6. Run `pnpm install && turbo build` to validate the full graph resolves and compiles.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `/` (root) | New | `package.json`, `pnpm-workspace.yaml`, `turbo.json` |
| `free-nextjs-admin-dashboard/` | Removed | Moved to `apps/web/` |
| `apps/web/` | New | Template relocated, name updated to `@ganatrack/web` |
| `apps/api/` | New | Skeleton Fastify server |
| `packages/tsconfig/` | New | Shared TS base configs |
| `packages/shared-types/` | New | Zod barrel + example schema |
| `packages/database/` | New | Placeholder Drizzle client module |
| `.gitignore` | Modified | Add node_modules, .turbo, .next patterns |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Template Next.js 16 peer issues with React 19 in pnpm strict mode | Med | Keep template `overrides` block; validate after move |
| Turborepo outputs misconfigured (cache miss / stale) | Low | Set `outputs: [".next/**", "!.next/cache/**"]` per Turbo docs |
| pnpm workspace resolution of `workspace:*` packages | Low | Use `pnpm install` at root before any `turbo` command |
| Tailwind v4 CSS-first config breaks after relocation | Low | No config changes to template — pure directory move |

## Rollback Plan

The `free-nextjs-admin-dashboard/` directory is only moved, not destroyed. If anything breaks:
1. `git revert` the entire change (single commit or branch revert).
2. All new directories (`apps/`, `packages/`, root configs) are created fresh — no existing file is overwritten except `.gitignore`.

## Dependencies

- pnpm ≥ 9 must be installed in the environment
- Node ≥ 20 LTS (per PRD requirement)
- Turborepo CLI available (`pnpm dlx turbo` or devDependency)

## Success Criteria

- [ ] `pnpm install` completes with no resolution errors at repo root
- [ ] `turbo build` runs all workspace packages and exits 0
- [ ] `apps/web/` boots with `pnpm --filter @ganatrack/web dev` (Next.js dev server starts)
- [ ] `packages/shared-types` exports compile and can be imported by a stub test
- [ ] No file from the original template is lost (verified via `git status`)
