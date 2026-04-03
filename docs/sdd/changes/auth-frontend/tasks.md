# Tasks: Auth Frontend — GanaTrack

## Phase 1: Foundation — Packages, Schemas, Stores, API Error

- [ ] **TASK-AUTH-01**: Install npm dependencies — **S**
  - Files: `apps/web/package.json`
  - Specs covered: SPEC-API-CLIENT-01 (ky), SPEC-AUTH-STORE-01 (zustand), SPEC-LOGIN-01 (zod, react-hook-form, @hookform/resolvers)
  - Depends on: none
  - Acceptance: `pnpm install` succeeds; `import ky from 'ky'` and `import { create } from 'zustand'` resolve without errors in tsconfig

- [ ] **TASK-AUTH-02**: Create `packages/shared-types/src/schemas/auth.schema.ts` + `dtos/auth.dto.ts` — **M**
  - Files: `packages/shared-types/src/schemas/auth.schema.ts`, `packages/shared-types/src/dtos/auth.dto.ts`, `packages/shared-types/src/index.ts`
  - Specs covered: SPEC-SCHEMAS-01, SPEC-SCHEMAS-02, SPEC-SCHEMAS-03, SPEC-SCHEMAS-04, SPEC-SCHEMAS-05
  - Depends on: TASK-AUTH-01
  - Acceptance: `UserSchema.parse({ id: 'x', email: 'a@b.com', nombre: 'A', rol: 'admin' })` succeeds; invalid rol throws Zod error; `index.ts` exports all new schemas

- [ ] **TASK-AUTH-03**: Create `apps/web/src/shared/lib/errors.ts` (ApiError class + normalizer) — **S**
  - Files: `apps/web/src/shared/lib/errors.ts`
  - Specs covered: SPEC-API-CLIENT-05
  - Depends on: TASK-AUTH-01
  - Acceptance: `new ApiError(401, 'INVALID_CREDENTIALS', 'msg')` is instanceof Error; normalizeApiError(response) maps 400/401/500 to correct code strings

- [ ] **TASK-AUTH-04**: Create `apps/web/src/store/auth.store.ts` (Zustand, memory-only) — **S**
  - Files: `apps/web/src/store/auth.store.ts`
  - Specs covered: SPEC-AUTH-STORE-01, SPEC-AUTH-STORE-02, SPEC-AUTH-STORE-03
  - Depends on: TASK-AUTH-02
  - Acceptance: Initial state has `accessToken===null`, `isAuthenticated===false`; `setAuth()` populates all fields; `clearAuth()` resets; NO persist middleware in store definition; `localStorage.getItem('auth')===null` after setAuth (CA-AUTH-01)

- [ ] **TASK-AUTH-05**: Create `apps/web/src/store/predio.store.ts` (Zustand) — **S**
  - Files: `apps/web/src/store/predio.store.ts`
  - Specs covered: SPEC-PREDIO-STORE-01, SPEC-PREDIO-STORE-02
  - Depends on: TASK-AUTH-02
  - Acceptance: `switchPredio(id)` updates `predioActivo` and `lastSwitchTimestamp`; `switchPredio` on empty predios array is a no-op; `clearPredios()` resets all fields (CA-AUTH-07)

- [ ] **TASK-AUTH-06**: Create `apps/web/src/shared/lib/api-client.ts` (ky instance + interceptors) — **L**
  - Files: `apps/web/src/shared/lib/api-client.ts`
  - Specs covered: SPEC-API-CLIENT-01, SPEC-API-CLIENT-02, SPEC-API-CLIENT-03, SPEC-API-CLIENT-04
  - Depends on: TASK-AUTH-03, TASK-AUTH-04, TASK-AUTH-05
  - Acceptance: Authorization header sent when authStore has token; X-Predio-Id sent when predioActivo set; 3 concurrent 401s trigger single POST /auth/refresh (CA-AUTH-02); refresh failure calls clearAuth

- [ ] **TASK-AUTH-07**: Create `apps/web/src/modules/auth/schemas/login.schema.ts` (form-level Zod) — **S**
  - Files: `apps/web/src/modules/auth/schemas/login.schema.ts`
  - Specs covered: SPEC-LOGIN-01, SPEC-2FA-01
  - Depends on: TASK-AUTH-02
  - Acceptance: Empty email → Zod error "Email inválido"; password < 8 chars → Zod error "La contraseña debe tener al menos 8 caracteres"; OTP code < 6 digits → Zod error (CA-AUTH-09)

## Phase 2: Auth Service (Interface + Mock + Real)

- [ ] **TASK-AUTH-08**: Create `apps/web/src/modules/auth/services/auth.service.ts` (interface + factory) — **S**
  - Files: `apps/web/src/modules/auth/services/auth.service.ts`
  - Specs covered: SPEC-AUTH-SERVICE-IF-01, SPEC-AUTH-MOCK-03
  - Depends on: TASK-AUTH-02
  - Acceptance: Factory exports `authService`; `NEXT_PUBLIC_USE_MOCKS=true` → MockAuthService instance; unset/false → RealAuthService instance (CA-AUTH-08)

- [ ] **TASK-AUTH-09**: Create `apps/web/src/modules/auth/services/auth.mock.ts` (MockAuthService) — **M**
  - Files: `apps/web/src/modules/auth/services/auth.mock.ts`
  - Specs covered: SPEC-AUTH-MOCK-01, SPEC-AUTH-MOCK-02, SPEC-AUTH-MOCK-03
  - Depends on: TASK-AUTH-08
  - Acceptance: `mock.login({ email: 'admin@ganatrack.com', password: 'Admin123!' })` returns AuthResponse after ~800ms; `vet2fa@ganatrack.com` returns TwoFactorResponse; wrong password throws ApiError(401); delays match spec table

- [ ] **TASK-AUTH-10**: Create `apps/web/src/modules/auth/services/auth.api.ts` (RealAuthService) — **M**
  - Files: `apps/web/src/modules/auth/services/auth.api.ts`
  - Specs covered: SPEC-AUTH-SERVICE-IF-01
  - Depends on: TASK-AUTH-06, TASK-AUTH-08
  - Acceptance: All interface methods implemented using apiClient; responses parsed through Zod schemas from shared-types; ApiError propagated on failure

## Phase 3: Login UI

- [ ] **TASK-AUTH-11**: Create `apps/web/src/modules/auth/hooks/use-login.ts` — **M**
  - Files: `apps/web/src/modules/auth/hooks/use-login.ts`
  - Specs covered: SPEC-LOGIN-02, SPEC-LOGIN-03
  - Depends on: TASK-AUTH-07, TASK-AUTH-08, TASK-AUTH-04, TASK-AUTH-05
  - Acceptance: Valid credentials → authStore populated → router.push('/dashboard'); TwoFactor → router.push('/verificar-2fa?temp=...'); 401 → error message "Credenciales inválidas", password cleared; 429 → rate limit message

- [ ] **TASK-AUTH-12**: Create `apps/web/src/modules/auth/components/login-form.tsx` (presentational) — **M**
  - Files: `apps/web/src/modules/auth/components/login-form.tsx`
  - Specs covered: SPEC-LOGIN-01, SPEC-LOGIN-02, SPEC-LOGIN-03
  - Depends on: TASK-AUTH-07
  - Acceptance: Email + password fields render; field-level Zod errors show below inputs; error prop displays below form in red; isLoading=true disables submit button; component has no direct authService calls

- [ ] **TASK-AUTH-13**: Create `apps/web/src/app/(auth)/layout.tsx` + `login/page.tsx` — **S**
  - Files: `apps/web/src/app/(auth)/layout.tsx`, `apps/web/src/app/(auth)/login/page.tsx`
  - Specs covered: SPEC-LOGIN-02
  - Depends on: TASK-AUTH-11, TASK-AUTH-12
  - Acceptance: Login page renders LoginForm wired to useLogin; (auth) layout centers content fullscreen; page is 'use client'

## Phase 4: 2FA UI

- [ ] **TASK-AUTH-14**: Create `apps/web/src/modules/auth/hooks/use-verify-2fa.ts` — **M**
  - Files: `apps/web/src/modules/auth/hooks/use-verify-2fa.ts`
  - Specs covered: SPEC-2FA-02, SPEC-2FA-03, SPEC-2FA-04
  - Depends on: TASK-AUTH-07, TASK-AUTH-08, TASK-AUTH-04, TASK-AUTH-05
  - Acceptance: Timer counts from 300s to 0; at 0 submit disabled; valid OTP → authStore populated → /dashboard; wrong OTP → error "Código inválido"; resend cooldown prevents call within 30s (CA-AUTH-10)

- [ ] **TASK-AUTH-15**: Create `apps/web/src/modules/auth/components/two-factor-form.tsx` (presentational) — **M**
  - Files: `apps/web/src/modules/auth/components/two-factor-form.tsx`
  - Specs covered: SPEC-2FA-01, SPEC-2FA-02, SPEC-2FA-03
  - Depends on: TASK-AUTH-07
  - Acceptance: 6 separate digit inputs; typing digit advances focus; paste "123456" fills all 6; backspace on empty moves to previous; timer shows mm:ss; at 60s remaining text turns red; submit disabled when timeRemaining===0

- [ ] **TASK-AUTH-16**: Create `apps/web/src/app/(auth)/verificar-2fa/page.tsx` — **S**
  - Files: `apps/web/src/app/(auth)/verificar-2fa/page.tsx`
  - Specs covered: SPEC-2FA-04
  - Depends on: TASK-AUTH-14, TASK-AUTH-15
  - Acceptance: Page reads `?temp=` from searchParams; wires to useVerify2FA; renders TwoFactorForm; 'use client'

## Phase 5: Route Protection

- [ ] **TASK-AUTH-17**: Create `apps/web/src/middleware.ts` (cookie-based route guard) — **M**
  - Files: `apps/web/src/middleware.ts`
  - Specs covered: SPEC-MIDDLEWARE-01, SPEC-MIDDLEWARE-02, SPEC-MIDDLEWARE-03
  - Depends on: none (edge runtime, no store dependency)
  - Acceptance: No cookie + /dashboard → redirect /login?redirect=/dashboard (CA-AUTH-03); cookie present + /login → redirect /dashboard (CA-AUTH-04); external redirect sanitized to /dashboard; _next/* excluded from matcher

- [ ] **TASK-AUTH-18**: Create `apps/web/src/shared/providers/app-providers.tsx` + dashboard layout — **S**
  - Files: `apps/web/src/shared/providers/app-providers.tsx`, `apps/web/src/app/(dashboard)/layout.tsx`, `apps/web/src/app/(dashboard)/page.tsx`
  - Specs covered: SPEC-MIDDLEWARE-02 (dashboard shell)
  - Depends on: TASK-AUTH-17
  - Acceptance: AppProviders is 'use client'; dashboard layout imports AppProviders; dashboard page renders a placeholder; middleware correctly guards the route group

## Phase 6: RBAC

- [ ] **TASK-AUTH-19**: Create `apps/web/src/modules/auth/hooks/use-permission.ts` — **S**
  - Files: `apps/web/src/modules/auth/hooks/use-permission.ts`
  - Specs covered: SPEC-RBAC-01, SPEC-RBAC-03
  - Depends on: TASK-AUTH-04
  - Acceptance: `usePermission("*:*")` in admin user returns true; wildcard `["*"]` grants any permission; empty permissions → false (CA-AUTH-05)

- [ ] **TASK-AUTH-20**: Create `apps/web/src/modules/auth/components/can.tsx` — **S**
  - Files: `apps/web/src/modules/auth/components/can.tsx`
  - Specs covered: SPEC-RBAC-02
  - Depends on: TASK-AUTH-19
  - Acceptance: With permission → children rendered; without permission → null; fallback prop renders when provided; admin wildcard renders children (CA-AUTH-06)

## Phase 7: Predio Switch Flow

- [ ] **TASK-AUTH-21**: Add predio selection to login flow post-auth — **S**
  - Files: `apps/web/src/modules/auth/hooks/use-login.ts` (modify), `apps/web/src/modules/auth/hooks/use-verify-2fa.ts` (modify)
  - Specs covered: SPEC-PREDIO-STORE-01, SPEC-PREDIO-STORE-02
  - Depends on: TASK-AUTH-11, TASK-AUTH-14, TASK-AUTH-05
  - Acceptance: After successful login, authService.getPredios() is called and predioStore.setPredios() populated; first predio auto-set as predioActivo if only one; multiple predios → predioActivo remains null (selection deferred)

## Phase 8: Logout

- [ ] **TASK-AUTH-22**: Create `apps/web/src/modules/auth/hooks/use-logout.ts` — **S**
  - Files: `apps/web/src/modules/auth/hooks/use-logout.ts`
  - Specs covered: SPEC-AUTH-STORE-01 (clearAuth), SPEC-PREDIO-STORE-01 (clearPredios)
  - Depends on: TASK-AUTH-04, TASK-AUTH-05, TASK-AUTH-08
  - Acceptance: `useLogout()` calls authService.logout(), then authStore.clearAuth(), then predioStore.clearPredios(), then router.push('/login'); both stores empty after logout

## Phase 9: Integration — Wiring, Env, Layout

- [ ] **TASK-AUTH-23**: Modify `apps/web/src/app/layout.tsx` to add AppProviders — **S**
  - Files: `apps/web/src/app/layout.tsx`
  - Specs covered: Design § Provider Architecture
  - Depends on: TASK-AUTH-18
  - Acceptance: `<AppProviders>` wraps children in root layout; layout remains a Server Component; AppProviders is 'use client'

- [ ] **TASK-AUTH-24**: Create `apps/web/.env.local` with env vars — **S**
  - Files: `apps/web/.env.local`
  - Specs covered: SPEC-API-CLIENT-01, SPEC-AUTH-MOCK-03
  - Depends on: TASK-AUTH-06, TASK-AUTH-08
  - Acceptance: `NEXT_PUBLIC_USE_MOCKS=true` enables mock service; `NEXT_PUBLIC_API_URL` set to local API URL; app starts without env errors

- [ ] **⚠️ TASK-AUTH-25**: Address "page refresh auth gap" — **M**
  - Files: `apps/web/src/shared/providers/app-providers.tsx` (modify — add AuthProvider)
  - Specs covered: Design § Hydration Strategy (accepted limitation)
  - Depends on: TASK-AUTH-08, TASK-AUTH-04
  - Acceptance: On authenticated page refresh, AuthProvider calls authService.getMe() to rehydrate authStore; while rehydrating, isLoading=true prevents premature renders; on 401 from getMe(), clearAuth() and redirect to /login. NOTE: This is the "page refresh auth gap" flagged in design — store is empty on refresh but middleware allows render because cookie exists; this task closes that gap.

---

## Summary

| Phase | Tasks | Files |
|-------|-------|-------|
| 1: Foundation | 7 | auth.schema, dtos, errors, auth.store, predio.store, api-client, login.schema |
| 2: Services | 3 | service interface+factory, mock, real API |
| 3: Login UI | 3 | use-login, login-form, login page+layout |
| 4: 2FA UI | 3 | use-verify-2fa, two-factor-form, 2FA page |
| 5: Route Protection | 2 | middleware.ts, app-providers, dashboard shell |
| 6: RBAC | 2 | use-permission, Can |
| 7: Predio | 1 | post-login predio population |
| 8: Logout | 1 | use-logout |
| 9: Integration | 3 | root layout wiring, .env.local, auth hydration gap |
| **Total** | **25** | 25 new files, 3 modified |

**Blocked path**: TASK-AUTH-01 → TASK-AUTH-02 → TASK-AUTH-04/05/07/08 → (parallel execution from here).
