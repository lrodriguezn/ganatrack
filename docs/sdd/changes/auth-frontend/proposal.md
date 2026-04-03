# Proposal: Auth Frontend — GanaTrack

## Intent

Implement the complete frontend authentication system for GanaTrack — login, 2FA, token refresh, route protection, RBAC, multi-predio switching, and logout. No backend exists yet, so a mock service layer enables full UI development and testing without a running API.

## Scope

### In Scope
- Zustand auth store (accessToken in MEMORY ONLY, user, permissions)
- Zustand predio store (predioActivo, prediosList, switchPredio)
- ky API client with interceptors (auth headers, 401 refresh queue, error normalization)
- Login page + form (react-hook-form + zod)
- 2FA verification page + form (6-digit OTP)
- middleware.ts route protection (cookie-based)
- usePermission hook + Can component (RBAC)
- Logout flow (POST /auth/logout → clear stores → redirect)
- Mock auth service layer (swappable for real API)
- Auth-related Zod schemas in packages/shared-types

### Out of Scope
- Backend API (this is frontend-only)
- PWA / Service Worker / Background Sync
- next-intl i18n integration (strings will be plain Spanish, i18n-ready but not wired)
- TanStack Query setup (only ky client for auth; TanStack Query comes with data modules)
- Other modules (animales, servicios, reportes, etc.)
- Push notifications / FCM
- UI Store / toast system (minimal inline errors for now)
- E2E tests (Playwright) — unit/integration only

## Capabilities

### New Capabilities
- `auth-login`: Login flow (email/password → token → redirect)
- `auth-2fa`: Two-factor verification flow (tempToken → OTP → tokens)
- `auth-refresh`: Transparent token refresh with 401 interceptor + request queue
- `auth-route-protection`: middleware.ts cookie-based guard with redirect preservation
- `auth-rbac`: Permission-based UI rendering (usePermission, Can)
- `auth-predio-switch`: Multi-predio selection with cache-ready invalidation hook
- `auth-logout`: Session termination (server + client cleanup)
- `auth-mock-service`: Mock layer mimicking backend auth endpoints

### Modified Capabilities
- None (greenfield — no existing capabilities)

## Approach

**Architecture**: Screaming Architecture — all auth code in `src/modules/auth/` with sub-folders: `components/`, `hooks/`, `services/`, `schemas/`, `types/`. Pages in `app/(auth)/` and `app/(dashboard)/` are thin wrappers.

**Mock Strategy**: `modules/auth/services/auth.service.ts` exports an interface. `modules/auth/services/auth.mock.ts` implements it with hardcoded users, delays, and localStorage-simulated cookies. Swap via `NEXT_PUBLIC_USE_MOCKS=true` env var. The mock service:
- Simulates 3 users: admin (full perms), veterinario (limited), visor (read-only)
- One user has 2FA enabled
- Returns realistic response shapes matching backend PRD
- Simulates httpOnly cookie via a flag in mock state

**Container-Presentational**: Forms are presentational (receive onSubmit, errors). Hooks are containers (manage state, call services, handle redirects).

**Token Security**: accessToken lives ONLY in Zustand memory. refreshToken is httpOnly cookie (auto-sent by browser). Mock simulates this with a flag.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/modules/auth/` | New | Full auth module (components, hooks, services, schemas, types) |
| `apps/web/src/store/auth.store.ts` | New | Zustand store for tokens, user, permissions |
| `apps/web/src/store/predio.store.ts` | New | Zustand store for active predio + switching |
| `apps/web/src/shared/lib/api-client.ts` | New | ky instance with interceptors |
| `apps/web/src/shared/lib/errors.ts` | New | ApiError class + normalizer |
| `apps/web/src/middleware.ts` | New | Route protection + redirect preservation |
| `apps/web/src/app/(auth)/` | New | login/page.tsx, verificar-2fa/page.tsx, layout.tsx |
| `apps/web/src/app/(dashboard)/layout.tsx` | New | Authenticated layout shell (minimal) |
| `apps/web/src/app/layout.tsx` | Modified | Add providers wrapper |
| `packages/shared-types/src/schemas/auth.schema.ts` | New | Login, 2FA, auth response Zod schemas |
| `packages/shared-types/src/dtos/auth.dto.ts` | New | z.infer type exports |
| `apps/web/package.json` | Modified | Add zustand, ky, react-hook-form, @hookform/resolvers, zod, @radix-ui/* |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| accessToken leaks to localStorage | Med | Code review + Vitest assertion: localStorage empty post-login |
| Refresh race condition (parallel 401s) | Med | Shared promise pattern — single refresh, queue pending |
| 2FA tempToken expires (5 min) | Low | Timer in UI, re-redirect to login on expiry |
| middleware.ts ↔ Zustand desync on first load | Med | auth-provider component checks cookie on mount, hydrates store |
| Mock service diverges from real API contract | Med | Zod schemas are the contract — both mock and real service parse through them |
| Radix UI primitives need significant styling | Low | Use TailAdmin patterns for consistent look |

## Rollback Plan

All auth code is isolated in `modules/auth/`, `store/auth.store.ts`, `store/predio.store.ts`, `shared/lib/api-client.ts`, `shared/lib/errors.ts`, and `middleware.ts`. Rollback = `git revert` the auth branch. No existing code is modified except `app/layout.tsx` (adding providers) and `package.json` (adding deps). Both are trivially reversible.

## Dependencies

### npm packages to install
- `zustand` — state management (auth + predio stores)
- `ky` — HTTP client with interceptors
- `react-hook-form` — form state management
- `@hookform/resolvers` — zod resolver for RHF
- `zod` — schema validation (also in shared-types)
- `@radix-ui/react-form` — accessible form primitives
- `@radix-ui/react-label` — accessible label
- `@radix-ui/react-slot` — composable component primitives

### workspace packages
- `@ganatrack/shared-types` — already linked, needs auth schemas added

## Success Criteria

- [ ] Login with email/password works against mock service
- [ ] 2FA flow redirects correctly and verifies OTP
- [ ] accessToken is NEVER in localStorage/sessionStorage (Vitest assertion)
- [ ] 401 triggers refresh, retries original request transparently
- [ ] Parallel 401s share single refresh (no duplicate refresh calls)
- [ ] Unauthenticated access to /dashboard redirects to /login?redirect=...
- [ ] Authenticated access to /login redirects to /dashboard
- [ ] usePermission correctly hides/shows UI based on user permissions
- [ ] Can component renders/hides children based on permissions
- [ ] switchPredio updates predioActivo and signals cache invalidation
- [ ] Logout clears auth+predio stores and redirects to /login
- [ ] Mock service can be swapped for real API by changing env var
