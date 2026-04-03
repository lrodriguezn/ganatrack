# Tasks: Monorepo Bootstrap

## Phase 1: packages/tsconfig (leaf — no deps)

- [x] TASK-MONO-01 Create `packages/tsconfig/package.json` with `@ganatrack/tsconfig`, `exports` for `base.json`, `nextjs.json`, `node.json` — **S**
- [x] TASK-MONO-02 Create `packages/tsconfig/base.json` — strict, skipLibCheck, moduleResolution: bundler — **S**
- [x] TASK-MONO-03 Create `packages/tsconfig/nextjs.json` — extends base, jsx: preserve, Next plugin — **S**
- [x] TASK-MONO-04 Create `packages/tsconfig/node.json` — extends base, module: NodeNext, moduleResolution: NodeNext — **S**

## Phase 2: packages/shared-types + packages/database (depend on tsconfig)

- [x] TASK-MONO-05 Create `packages/shared-types/package.json` with `@ganatrack/shared-types`, zod dep, workspace tsconfig devDep — **S**
- [x] TASK-MONO-06 Create `packages/shared-types/tsconfig.json` — extends `@ganatrack/tsconfig/base.json` — **S**
- [x] TASK-MONO-07 Create `packages/shared-types/src/schemas/animal.schema.ts` — Zod `AnimalSchema` (id uuid, name, species) — **S**
- [x] TASK-MONO-08 Create `packages/shared-types/src/index.ts` — barrel re-export of AnimalSchema + Animal type — **S**
- [x] TASK-MONO-09 Create `packages/database/package.json` — `@ganatrack/database`, workspace tsconfig devDep, no DB driver — **S**
- [x] TASK-MONO-10 Create `packages/database/tsconfig.json` — extends `@ganatrack/tsconfig/base.json` — **S**
- [x] TASK-MONO-11 Create `packages/database/src/index.ts` — placeholder stub export (`DATABASE_PLACEHOLDER`) with Drizzle TODO comment — **S**

## Phase 3: Root workspace config

- [x] TASK-MONO-12 Create root `package.json` — private: true, turbo + typescript devDeps, scripts: build/dev/lint/typecheck/test, packageManager pnpm@9.15.9 — **S**
- [x] TASK-MONO-13 Create `pnpm-workspace.yaml` — `packages: ["apps/*", "packages/*"]` — **S**
- [x] TASK-MONO-14 Create `turbo.json` — tasks: build (dependsOn ^build, outputs .next/**+dist/**), dev (cache: false, persistent), lint/typecheck/test (dependsOn ^build) — **S**
- [x] TASK-MONO-15 Update `.gitignore` — add `.next/`, `coverage/`, `*.tsbuildinfo` — **S**

## Phase 4: Create apps/web from scratch (cherry-pick from template per D8)

- [ ] TASK-MONO-16 Create `apps/web/package.json` — name: `@ganatrack/web`, essential deps only (next, react, react-dom, tailwindcss, tailwind-merge, @tailwindcss/forms, @tailwindcss/postcss, autoprefixer, @svgr/webpack), workspace deps (`@ganatrack/shared-types: workspace:*`, `@ganatrack/tsconfig: workspace:*`). **DROP** template demo deps: @fullcalendar/*, @react-jvectormap/*, apexcharts, react-apexcharts, flatpickr, react-dnd*, react-dropzone, swiper, @types/react-transition-group — **M**
- [ ] TASK-MONO-17 Create `apps/web/tsconfig.json` — extends `@ganatrack/tsconfig/nextjs.json`, keep local `paths: {"@/*": ["./src/*"]}`, include/exclude arrays — **S**
- [ ] TASK-MONO-18 Create `apps/web/next.config.ts` — cherry-pick SVG/turbopack config from template, add `transpilePackages: ["@ganatrack/shared-types"]` — **S**
- [ ] TASK-MONO-19-W Create `apps/web/src/app/globals.css` — cherry-pick `@theme` tokens (lines 1-168: colors, breakpoints, shadows, fonts) + base layer (lines 178-193) + menu-item/scrollbar utilities (lines 195-277). **STRIP** all third-party CSS overrides (apexcharts, flatpickr, fullcalendar, jvectormap, swiper = lines 295-752) — **M**
- [ ] TASK-MONO-20-W Create `apps/web/src/svg.d.ts` — SVG type declarations from template — **S**
- [ ] TASK-MONO-21-W Create `apps/web/src/shared/providers/sidebar-context.tsx` — cherry-pick template `SidebarContext.tsx`, update path conventions — **S**
- [ ] TASK-MONO-22-W Create `apps/web/src/shared/providers/theme-context.tsx` — cherry-pick template `ThemeContext.tsx`, update path conventions — **S**
- [ ] TASK-MONO-23-W Create `apps/web/src/shared/icons/index.tsx` + minimal SVG icons — cherry-pick ONLY icons used by sidebar/header shell (GridIcon, ChevronDownIcon, HorizontalDots + toggle icons). Leave all other 50+ icons behind — **S**
- [ ] TASK-MONO-24-W Create `apps/web/src/shared/components/layout/backdrop.tsx` — cherry-pick template Backdrop, update import path for sidebar-context — **S**
- [ ] TASK-MONO-25-W Create `apps/web/src/shared/components/layout/admin-sidebar.tsx` — cherry-pick template AppSidebar shell (collapse/hover/mobile mechanics), **STRIP** demo navItems + othersItems arrays (replace with empty `[]` + `// TODO: GanaTrack navigation`), strip SidebarWidget import, update all import paths — **M**
- [ ] TASK-MONO-26-W Create `apps/web/src/shared/components/layout/admin-header.tsx` — cherry-pick template AppHeader shell (toggle, search, layout), **STRIP** NotificationDropdown + UserDropdown imports (replace with placeholder `<div>`), update import paths — **M**
- [ ] TASK-MONO-27-W Create `apps/web/src/shared/components/ui/theme-toggle-button.tsx` — cherry-pick template ThemeToggleButton, update import path for theme-context — **S**
- [ ] TASK-MONO-28-W Create `apps/web/src/app/layout.tsx` — cherry-pick root layout (Outfit font, ThemeProvider + SidebarProvider wrapping), remove flatpickr CSS import, update import paths — **S**
- [ ] TASK-MONO-29-W Create `apps/web/src/app/(dashboard)/layout.tsx` — cherry-pick admin layout pattern (sidebar + header + content area), update import paths — **S**
- [ ] TASK-MONO-30-W Create `apps/web/src/app/(dashboard)/page.tsx` — minimal placeholder: `<h1>GanaTrack Dashboard</h1>` with a `<p>` note — **S**
- [ ] TASK-MONO-31-W Create `apps/web/src/app/(auth)/layout.tsx` — cherry-pick full-width layout pattern — **S**

## Phase 5: apps/api skeleton

- [ ] TASK-MONO-32 Create `apps/api/package.json` — `@ganatrack/api`, fastify dep, tsx devDep, workspace deps (shared-types, database, tsconfig), scripts dev/build/start/typecheck — **S**
- [ ] TASK-MONO-33 Create `apps/api/tsconfig.json` — extends `@ganatrack/tsconfig/node.json`, src include — **S**
- [ ] TASK-MONO-34 Create `apps/api/src/server.ts` — Fastify server with `GET /health → { status: "ok" }`, listen on PORT || 3001 — **S**

## Phase 6: Validation

- [ ] TASK-MONO-35 Run `pnpm install` at root — exit 0, all workspace packages linked, no resolution errors — **M**
- [ ] TASK-MONO-36 Run `turbo build` — all packages build in dependency order, all exit 0 — **M**
- [ ] TASK-MONO-37 Run `turbo typecheck` — zero TS errors across all packages — **M**
- [ ] TASK-MONO-38 Smoke-test web: start `apps/web`, verify dashboard page renders at localhost:3000 with sidebar + header — **S**
- [ ] TASK-MONO-39 Smoke-test API: start `apps/api`, `curl localhost:3001/health` → `{"status":"ok"}` — **S**

## Phase 7: Template cleanup

- [ ] TASK-MONO-40 Delete `free-nextjs-admin-dashboard/` directory — `rm -rf free-nextjs-admin-dashboard/` — **S**
- [ ] TASK-MONO-41 Update `.gitignore` — remove `free-nextjs-admin-dashboard/` line (no longer needed) — **S**
- [ ] TASK-MONO-42 Final validation — `turbo build` still passes, no dangling references to template dir — **S**
