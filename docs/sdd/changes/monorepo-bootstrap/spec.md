# Monorepo Bootstrap Specification

## MONO-01: Root Monorepo Configuration

The root workspace MUST configure pnpm workspaces and Turborepo pipeline so that all apps and packages are discoverable and buildable from the repo root.

| Criterion | Requirement |
|-----------|-------------|
| `pnpm-workspace.yaml` | MUST declare `packages: ["apps/*", "packages/*"]` |
| Root `package.json` | MUST have `"private": true` and devDependencies: `turbo`, `typescript` |
| `turbo.json` | MUST define tasks: `build`, `dev`, `lint`, `typecheck`, `test` with correct `dependsOn` and `outputs` |
| `.turbo` cache | MUST be excluded from git via `.gitignore` |
| `node_modules` | MUST be excluded at root level via `.gitignore` |

#### Scenario: Workspace resolves all packages

- GIVEN the repo root has `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- WHEN `pnpm install` is executed at root
- THEN all workspace packages are linked with no resolution errors
- AND `node_modules/.pnpm` is populated correctly

#### Scenario: Turbo pipeline executes end-to-end

- GIVEN all workspace packages have valid `package.json` with a `build` script
- WHEN `turbo build` is run at root
- THEN all packages build in correct dependency order and exit 0

#### Scenario: Turbo pipeline respects outputs for Next.js

- GIVEN `turbo.json` sets `outputs: [".next/**", "!.next/cache/**"]` for the `build` task of `@ganatrack/web`
- WHEN `turbo build` is run twice
- THEN the second run uses cache and exits faster than the first

**Files:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`

---

## MONO-02: apps/web — Template Relocation

The existing `free-nextjs-admin-dashboard/` template MUST be moved to `apps/web/` without losing any file and with its package name updated to `@ganatrack/web`.

| Criterion | Requirement |
|-----------|-------------|
| Directory | MUST exist at `apps/web/` after migration |
| `package.json` name | MUST be `"@ganatrack/web"` |
| Template files | MUST be 100% identical to pre-migration (verified via `git status`) |
| tsconfig extends | MUST reference `@ganatrack/tsconfig/nextjs.json` |
| Original directory | MUST NOT exist at `free-nextjs-admin-dashboard/` |

#### Scenario: Template boots after relocation

- GIVEN `apps/web/` has all original template files
- WHEN `pnpm --filter @ganatrack/web dev` is executed
- THEN Next.js dev server starts on port 3000 without errors

#### Scenario: No files lost during move

- GIVEN the original template had N files
- WHEN `git status` is examined after migration
- THEN all N files appear as renamed (not deleted+created separately)
- AND zero files appear as deleted without a corresponding rename

**Files:** `apps/web/package.json`, `apps/web/tsconfig.json` (updated), all template files relocated

---

## MONO-03: apps/api — Fastify Skeleton

`apps/api/` MUST provide a minimal, compiling Fastify server with a `/health` route. No real business logic.

| Criterion | Requirement |
|-----------|-------------|
| `package.json` name | MUST be `"@ganatrack/api"` |
| Entry point | MUST be `src/server.ts` |
| Health route | MUST respond `{ status: "ok" }` on `GET /health` |
| tsconfig extends | MUST reference `@ganatrack/tsconfig/node.json` |
| TypeScript compilation | MUST pass `tsc --noEmit` with zero errors |

#### Scenario: Health endpoint responds

- GIVEN `apps/api/src/server.ts` starts the Fastify server
- WHEN `GET /health` is requested
- THEN the response status is 200
- AND the body is `{ "status": "ok" }`

#### Scenario: API package compiles cleanly

- GIVEN `apps/api/tsconfig.json` extends `@ganatrack/tsconfig/node.json`
- WHEN `pnpm --filter @ganatrack/api typecheck` is run
- THEN TypeScript exits 0 with no type errors

**Files:** `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/src/server.ts`

---

## MONO-04: packages/tsconfig — Shared TypeScript Configs

`packages/tsconfig/` MUST provide three composable TS base configs: `base.json`, `nextjs.json`, `node.json`.

| Config | Extends | Key settings |
|--------|---------|-------------|
| `base.json` | — | `strict: true`, `skipLibCheck: true`, `moduleResolution: bundler` |
| `nextjs.json` | `./base.json` | `jsx: preserve`, `plugins: [{"name": "next"}]` |
| `node.json` | `./base.json` | `module: NodeNext`, `moduleResolution: NodeNext` |

| Criterion | Requirement |
|-----------|-------------|
| `package.json` name | MUST be `"@ganatrack/tsconfig"` |
| No `compilerOptions.paths` | MUST NOT define paths (each app owns its own aliases) |
| Exportable | MUST be importable via `workspace:*` in consumer packages |

#### Scenario: Consumer extends nextjs config

- GIVEN `apps/web/tsconfig.json` has `"extends": "@ganatrack/tsconfig/nextjs.json"`
- WHEN `tsc --noEmit` is run in `apps/web/`
- THEN TypeScript resolves the base config without errors

#### Scenario: Consumer extends node config

- GIVEN `apps/api/tsconfig.json` has `"extends": "@ganatrack/tsconfig/node.json"`
- WHEN `tsc --noEmit` is run in `apps/api/`
- THEN TypeScript resolves the base config without errors

**Files:** `packages/tsconfig/package.json`, `packages/tsconfig/base.json`, `packages/tsconfig/nextjs.json`, `packages/tsconfig/node.json`

---

## MONO-05: packages/shared-types — Zod Barrel Export

`packages/shared-types/` MUST export a compilable Zod schema (`AnimalSchema`) as a public barrel so consumers can import it via `@ganatrack/shared-types`.

| Criterion | Requirement |
|-----------|-------------|
| `package.json` name | MUST be `"@ganatrack/shared-types"` |
| Barrel export | `src/index.ts` MUST re-export all schemas |
| `AnimalSchema` | MUST be a valid Zod object schema with at minimum: `id` (string uuid), `name` (string), `species` (string) |
| TypeScript | MUST compile with zero errors via `tsc --noEmit` |
| Peer dependency | Zod MUST be declared as a `dependency` (not devDependency) |

#### Scenario: Consumer imports AnimalSchema

- GIVEN `@ganatrack/shared-types` is a workspace dependency of `apps/web`
- WHEN `import { AnimalSchema } from "@ganatrack/shared-types"` is used
- THEN TypeScript resolves the import with correct inferred types
- AND `AnimalSchema.parse({ id: "...", name: "...", species: "..." })` returns without throwing

#### Scenario: Invalid animal data fails validation

- GIVEN `AnimalSchema` is imported
- WHEN `AnimalSchema.parse({})` is called (empty object)
- THEN Zod throws a `ZodError` listing the missing required fields

**Files:** `packages/shared-types/package.json`, `packages/shared-types/tsconfig.json`, `packages/shared-types/src/index.ts`, `packages/shared-types/src/schemas/animal.schema.ts`

---

## MONO-06: packages/database — Placeholder Module

`packages/database/` MUST export a placeholder that compiles and can be imported, signalling future Drizzle integration without any real database logic.

| Criterion | Requirement |
|-----------|-------------|
| `package.json` name | MUST be `"@ganatrack/database"` |
| Barrel export | `src/index.ts` MUST export at minimum a `TODO` comment export or a `createClient` stub |
| TypeScript | MUST compile with zero errors |
| No real DB logic | MUST NOT import `drizzle-orm` or any database driver (deferred to future change) |

#### Scenario: Package builds cleanly in Turbo pipeline

- GIVEN `packages/database/src/index.ts` has a valid TypeScript export
- WHEN `turbo build` is run
- THEN `@ganatrack/database` build task exits 0 with no TS errors

#### Scenario: Consumer can import without runtime crash

- GIVEN `apps/api` declares `@ganatrack/database` as a dependency
- WHEN the import is resolved at build time
- THEN TypeScript compiles successfully with no unresolved module errors

**Files:** `packages/database/package.json`, `packages/database/tsconfig.json`, `packages/database/src/index.ts`
