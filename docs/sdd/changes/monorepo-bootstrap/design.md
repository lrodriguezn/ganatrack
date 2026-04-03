# Design: Monorepo Bootstrap

## Technical Approach

Bootstrap a Turborepo + pnpm monorepo by creating root workspace configs, creating `apps/web/` FROM SCRATCH with Screaming Architecture structure (cherry-picking only essential infrastructure from the template `free-nextjs-admin-dashboard/`), scaffolding `apps/api/` with a Fastify hello-world, and creating three shared packages (`tsconfig`, `shared-types`, `database`). All packages wired via `workspace:*` protocol. Template stays as READ-ONLY reference and gets deleted at the end. NO feature code.

## Architecture Decisions

| # | Decision | Choice | Alternatives | Rationale |
|---|----------|--------|-------------|-----------|
| D1 | ~~Template relocation~~ | ~~`git mv`~~ | — | **SUPERSEDED by D8** |
| D2 | tsconfig sharing | `@ganatrack/tsconfig` package with `exports` field | Each app manages own tsconfig | Spec MONO-04 requires it. Eliminates config drift across apps. |
| D3 | `apps/web` tsconfig | `extends` shared config + local `paths` override | Inline everything | Shared base provides consistency; local `paths` (`@/*`) needed for Next.js app-specific aliases. |
| D4 | Package build scripts | `tsc --noEmit` for typecheck; no emit for packages consumed as TS source | Emit to `dist/` | Turbo consumers (Next.js, Fastify with tsx) can consume TS source directly. |
| D5 | API runtime | `tsx watch` for dev, `tsx` for start | `ts-node`, compiled JS | `tsx` is fast, zero-config, supports ESM. |
| D6 | shared-types exports | `exports` field pointing to `./src/index.ts` | Build step with `dist/` | Consumers resolve TS source at build time. No intermediate build. |
| D7 | `.gitignore` update | Keep `free-nextjs-admin-dashboard/` line until cleanup task deletes it, add `.next` | Remove immediately | Template stays as reference during implementation; `.next` build output must be ignored. |
| D8 | **Template strategy** | **Create `apps/web/` fresh, cherry-pick infrastructure only** | `git mv` (old D1) | User explicitly decided: fresh start with Screaming Architecture from day one. Avoids inheriting 12 demo component dirs, 13 demo pages, 8 demo-only dependencies. Cherry-pick list below ensures we keep the VALUABLE parts (theme tokens, layout shell, sidebar/header mechanics, dark mode) without the NOISE. |

## D8 Cherry-pick Manifest

### CHERRY-PICK (adapt into Screaming Architecture paths)

| Template Source | Target in `apps/web/` | Adaptation |
|---|---|---|
| `next.config.ts` | `next.config.ts` | Add `transpilePackages: ["@ganatrack/shared-types"]` |
| `globals.css` (lines 1-168 theme tokens + 178-277 base/utility) | `src/app/globals.css` | STRIP third-party overrides (apexcharts, flatpickr, fullcalendar, jvectormap, swiper CSS ~lines 295-752) |
| `src/app/layout.tsx` | `src/app/layout.tsx` | Remove flatpickr import, keep Outfit font + providers |
| `src/app/(admin)/layout.tsx` | `src/app/(dashboard)/layout.tsx` | Rename route group to match PRD §4 |
| `src/app/(full-width-pages)/layout.tsx` | `src/app/(auth)/layout.tsx` | Rename route group to match PRD §4 |
| `src/context/SidebarContext.tsx` | `src/shared/providers/sidebar-context.tsx` | Rename, same logic |
| `src/context/ThemeContext.tsx` | `src/shared/providers/theme-context.tsx` | Rename, same logic |
| `src/layout/AppSidebar.tsx` | `src/shared/components/layout/admin-sidebar.tsx` | Strip demo navItems/othersItems, replace with empty array + TODO. Keep sidebar shell mechanics (collapse/hover/mobile). |
| `src/layout/AppHeader.tsx` | `src/shared/components/layout/admin-header.tsx` | Strip NotificationDropdown/UserDropdown imports, keep sidebar toggle + search + layout structure. |
| `src/layout/Backdrop.tsx` | `src/shared/components/layout/backdrop.tsx` | As-is |
| `src/components/common/ThemeToggleButton.tsx` | `src/shared/components/ui/theme-toggle-button.tsx` | As-is, fix import path |
| `src/svg.d.ts` | `src/svg.d.ts` | As-is |
| `src/icons/index.tsx` + minimal icons (grid, chevron-down, horizontal-dots) | `src/shared/icons/` | Only icons used by sidebar shell |

### LEAVE BEHIND (do NOT copy)

- **Demo pages**: `(admin)/(others-pages)/*` (chart, forms, tables, blank, calendar, profile), `(admin)/(ui-elements)/*` (alerts, avatars, badge, buttons, images, modals, videos), `(admin)/page.tsx` (ecommerce dashboard)
- **Demo components**: `components/auth/`, `components/calendar/`, `components/charts/`, `components/ecommerce/`, `components/example/`, `components/form/`, `components/header/` (NotificationDropdown, UserDropdown), `components/tables/`, `components/ui/*` (all 9 dirs), `components/user-profile/`, `components/videos/`
- **Demo hooks**: `hooks/useGoBack.ts`, `hooks/useModal.ts`
- **Promo widget**: `layout/SidebarWidget.tsx`
- **Template demo auth/error pages**: `(full-width-pages)/(auth)/`, `(full-width-pages)/(error-pages)/`
- **Demo-only deps**: `@fullcalendar/*`, `@react-jvectormap/*`, `apexcharts`, `react-apexcharts`, `flatpickr`, `react-dnd`, `react-dnd-html5-backend`, `react-dropzone`, `swiper`
- **All `public/images/`** demo assets

## Data Flow (Dependency Graph)

```
turbo build executes bottom → top:

  @ganatrack/tsconfig          (leaf)
  @ganatrack/shared-types      (depends: tsconfig)
  @ganatrack/database          (depends: tsconfig)
  @ganatrack/api               (depends: tsconfig, shared-types, database)
  @ganatrack/web               (depends: tsconfig, shared-types)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` (root) | Create | Workspace root: private, devDeps turbo+typescript, scripts |
| `pnpm-workspace.yaml` | Create | Declares `apps/*` and `packages/*` |
| `turbo.json` | Create | Pipeline: build, dev, lint, typecheck, test |
| `.gitignore` | Modify | Add `.next/`, keep template line until cleanup |
| `apps/web/package.json` | **Create** | `@ganatrack/web`, only essential deps (next, react, react-dom, tailwindcss, tailwind-merge, @tailwindcss/forms, @tailwindcss/postcss, autoprefixer, @svgr/webpack) + workspace deps |
| `apps/web/tsconfig.json` | **Create** | extends `@ganatrack/tsconfig/nextjs.json`, local paths |
| `apps/web/next.config.ts` | **Create** | Cherry-pick SVG config, add transpilePackages |
| `apps/web/src/app/globals.css` | **Create** | Cherry-pick theme tokens + base utilities, strip demo CSS |
| `apps/web/src/app/layout.tsx` | **Create** | Cherry-pick root layout (Outfit font, providers) |
| `apps/web/src/app/(dashboard)/layout.tsx` | **Create** | Cherry-pick admin layout pattern |
| `apps/web/src/app/(dashboard)/page.tsx` | **Create** | Minimal "Dashboard placeholder" page |
| `apps/web/src/app/(auth)/layout.tsx` | **Create** | Cherry-pick full-width layout |
| `apps/web/src/shared/providers/sidebar-context.tsx` | **Create** | Cherry-pick SidebarContext |
| `apps/web/src/shared/providers/theme-context.tsx` | **Create** | Cherry-pick ThemeContext |
| `apps/web/src/shared/components/layout/admin-sidebar.tsx` | **Create** | Cherry-pick sidebar shell, strip demo nav |
| `apps/web/src/shared/components/layout/admin-header.tsx` | **Create** | Cherry-pick header shell, strip demo widgets |
| `apps/web/src/shared/components/layout/backdrop.tsx` | **Create** | Cherry-pick Backdrop |
| `apps/web/src/shared/components/ui/theme-toggle-button.tsx` | **Create** | Cherry-pick ThemeToggleButton |
| `apps/web/src/shared/icons/index.tsx` | **Create** | Minimal icon set for sidebar/header |
| `apps/web/src/svg.d.ts` | **Create** | SVG type declarations |
| `apps/api/package.json` | Create | `@ganatrack/api`, fastify, tsx, workspace deps |
| `apps/api/tsconfig.json` | Create | Extends `@ganatrack/tsconfig/node.json` |
| `apps/api/src/server.ts` | Create | Fastify `/health` endpoint |
| `packages/tsconfig/package.json` | Create | `@ganatrack/tsconfig` with exports |
| `packages/tsconfig/base.json` | Create | Strict TS base |
| `packages/tsconfig/nextjs.json` | Create | Extends base, JSX + Next plugin |
| `packages/tsconfig/node.json` | Create | Extends base, NodeNext |
| `packages/shared-types/package.json` | Create | `@ganatrack/shared-types`, zod dep |
| `packages/shared-types/tsconfig.json` | Create | Extends base |
| `packages/shared-types/src/index.ts` | Create | Barrel re-export |
| `packages/shared-types/src/schemas/animal.schema.ts` | Create | Zod AnimalSchema |
| `packages/database/package.json` | Create | `@ganatrack/database` placeholder |
| `packages/database/tsconfig.json` | Create | Extends base |
| `packages/database/src/index.ts` | Create | Placeholder stub |
| `free-nextjs-admin-dashboard/` | **Delete** | Cleanup after all cherry-picking is done |

## `apps/web/package.json` (essential deps only)

```json
{
  "name": "@ganatrack/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ganatrack/shared-types": "workspace:*",
    "next": "^16.1.6",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwind-merge": "^2.6.0",
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/postcss": "^4.1.17",
    "autoprefixer": "^10.4.22"
  },
  "devDependencies": {
    "@ganatrack/tsconfig": "workspace:*",
    "@svgr/webpack": "^8.1.0",
    "@types/node": "^20.19.25",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "@eslint/eslintrc": "^3.3.1",
    "eslint": "^9.39.1",
    "eslint-config-next": "16.0.7",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.17",
    "typescript": "^5.9.3"
  }
}
```

**Dropped deps vs template**: `@fullcalendar/*` (6 pkgs), `@react-jvectormap/*` (2 pkgs), `apexcharts`, `react-apexcharts`, `flatpickr`, `react-dnd`, `react-dnd-html5-backend`, `react-dropzone`, `swiper`, `@types/react-transition-group`. These get added back individually when the corresponding PRD module needs them.

## Interfaces / Contracts

All contract definitions from previous design version remain UNCHANGED:
- Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- `packages/tsconfig/*` (base, nextjs, node)
- `apps/web/tsconfig.json`
- `apps/api/*`
- `packages/shared-types/*`
- `packages/database/*`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Smoke | `pnpm install` resolves | Run at root, verify exit 0 |
| Smoke | `turbo build` succeeds | All packages exit 0 |
| Smoke | `turbo typecheck` succeeds | Zero TS errors |
| Unit | `apps/web` boots | `pnpm --filter @ganatrack/web dev` starts on port 3000, dashboard page renders |
| Unit | `apps/api` health | `curl localhost:3001/health` → `{"status":"ok"}` |
| Cleanup | Template deleted | `free-nextjs-admin-dashboard/` no longer exists |

## Migration / Rollout

No migration required. Greenfield infrastructure. Rollback: `git revert` the entire change.

## Open Questions

- None — all decisions resolved.
