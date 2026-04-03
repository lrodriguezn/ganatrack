# Design: Auth Frontend — GanaTrack

## Technical Approach

All auth code follows Screaming Architecture: `modules/auth/` owns components, hooks, services, schemas. Pages in `app/(auth)/` and `app/(dashboard)/` are thin wrappers that import from modules. Zustand stores in `store/` hold auth and predio state (memory-only). A ky-based API client in `shared/lib/` handles interceptors, token refresh queue, and error normalization. Service layer uses interface + factory pattern for mock/real swap via env var. Route protection via Next.js middleware.ts with cookie detection.

---

## 1. File Structure

```
apps/web/src/
├── middleware.ts                              # Route guard: cookie check, redirect preservation
├── app/
│   ├── layout.tsx                            # MODIFY: wrap children in AppProviders
│   ├── (auth)/
│   │   ├── layout.tsx                        # Centered fullscreen layout (no sidebar)
│   │   ├── login/page.tsx                    # Thin wrapper → LoginForm container
│   │   └── verificar-2fa/page.tsx            # Thin wrapper → TwoFactorForm container
│   └── (dashboard)/
│       ├── layout.tsx                        # Auth shell (placeholder for sidebar)
│       └── page.tsx                          # Dashboard home (placeholder)
├── modules/
│   └── auth/
│       ├── components/
│       │   ├── login-form.tsx                # Presentational: email/password fields + error display
│       │   ├── two-factor-form.tsx           # Presentational: 6-digit OTP inputs + timer
│       │   └── can.tsx                       # RBAC conditional renderer
│       ├── hooks/
│       │   ├── use-login.ts                  # Container: login orchestration (validate→call→redirect)
│       │   ├── use-verify-2fa.ts             # Container: 2FA orchestration (timer, submit, redirect)
│       │   ├── use-logout.ts                 # Logout: POST→clearAuth→clearPredio→redirect
│       │   └── use-permission.ts             # Reads authStore.permissions, checks with wildcard
│       ├── services/
│       │   ├── auth.service.ts               # AuthService interface + factory export
│       │   ├── auth.mock.ts                  # MockAuthService with 4 hardcoded users
│       │   └── auth.api.ts                   # RealAuthService wrapping apiClient
│       └── schemas/
│           └── login.schema.ts               # LoginSchema, Verify2FASchema (form-level Zod)
├── store/
│   ├── auth.store.ts                         # Zustand: accessToken, user, permissions, actions
│   └── predio.store.ts                       # Zustand: predioActivo, predios, switchPredio
├── shared/
│   ├── lib/
│   │   ├── api-client.ts                     # ky instance + beforeRequest + afterResponse interceptors
│   │   └── errors.ts                         # ApiError class + normalizeApiError helper
│   └── providers/
│       └── app-providers.tsx                 # Client component wrapping children (future QueryClient, etc.)

packages/shared-types/src/
├── schemas/
│   └── auth.schema.ts                        # Zod: User, Predio, LoginResponse, TwoFactor, Refresh
├── dtos/
│   └── auth.dto.ts                           # z.infer type re-exports
└── index.ts                                  # MODIFY: add auth schema/dto exports
```

---

## 2. Architecture Decisions

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Token storage | Zustand memory-only | localStorage, cookie | XSS-proof; refreshToken is httpOnly cookie managed by backend |
| HTTP client | ky v1 | axios, fetch wrapper | Fetch-based, <3KB, native hooks API, tree-shakeable |
| State management | Zustand v5 (no persist) | React Context, Jotai | Lightweight, works outside React tree (interceptors read store directly) |
| Mock strategy | Interface + factory + env toggle | MSW, conditional imports | Simpler for initial dev; MSW added later for testing layer |
| Form library | react-hook-form + zod resolver | Formik, native | Uncontrolled by default (perf), Zod schema doubles as validation |
| Route protection | middleware.ts cookie check | Client-side redirect | Runs at edge, prevents flash of protected content |
| OTP input | 6 separate controlled inputs | react-otp-input library | Zero dependencies, spec-defined behavior (auto-advance, paste, backspace) |
| Predio ID persist | sessionStorage (only predioId string) | Nothing | UX: maintains selection on refresh; not sensitive data |
| Auth ↔ Predio clear | auth.clearAuth() triggers predio.clearPredios() via useLogout | Zustand subscribe | Explicit in hook = testable, no hidden side effects |

---

## 3. Data Flow

### Login (no 2FA)
```
LoginForm ──onSubmit──→ useLogin hook
                          │
                    authService.login()
                          │
                    ┌─────┴──────┐
                    │AuthResponse │
                    └─────┬──────┘
                          │
              authStore.setAuth(token, user, perms)
              authService.getPredios() → predioStore.setPredios()
                          │
                    router.push(/dashboard)
```

### Login (2FA)
```
LoginForm ──→ useLogin ──→ authService.login()
                                │
                       TwoFactorResponse
                                │
                 router.push(/verificar-2fa?temp=...)
                                │
TwoFactorForm ──→ useVerify2FA ──→ authService.verify2FA()
                                        │
                                  AuthResponse → setAuth → getPredios → /dashboard
```

### 401 Refresh Queue
```
Request A ──→ 401 ──→ getOrCreateRefreshPromise()
Request B ──→ 401 ──→ getOrCreateRefreshPromise() ← same promise
Request C ──→ 401 ──→ getOrCreateRefreshPromise() ← same promise
                          │
                   POST /auth/refresh (single call)
                          │
                   ┌──────┴──────┐
                   │ new token   │
                   └──────┬──────┘
                          │
              authStore.setAccessToken(new)
                          │
              A retries ──→ success
              B retries ──→ success
              C retries ──→ success
```

### middleware.ts Flow
```
Request ──→ Is public route? ──YES──→ Has cookie? ──YES──→ redirect /dashboard
                │                         │
                NO                        NO ──→ render page
                │
          Has refreshToken cookie?
                │
         YES ──→ render page
         NO  ──→ redirect /login?redirect={originalPath}
```

---

## 4. Interfaces / Contracts

### AuthService Interface
```typescript
interface AuthService {
  login(creds: LoginRequest): Promise<LoginResponse | TwoFactorResponse>;
  verify2FA(tempToken: string, code: string): Promise<LoginResponse>;
  refreshToken(): Promise<RefreshResponse>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
  getPredios(): Promise<Predio[]>;
}
```

### ApiError Class
```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) { super(message); this.name = 'ApiError'; }
}
```

### Auth Store Shape
```typescript
interface AuthState {
  accessToken: string | null;
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  // Actions
  setAuth(data: { accessToken: string; user: User; permissions: string[] }): void;
  clearAuth(): void;
  setLoading(v: boolean): void;
}
```

### Predio Store Shape
```typescript
interface PredioState {
  predioActivo: Predio | null;
  predios: Predio[];
  lastSwitchTimestamp: number | null;
  // Actions
  setPredios(predios: Predio[]): void;
  switchPredio(id: string): void;
  clearPredios(): void;
}
```

### ky Interceptor Chain
```typescript
// beforeRequest: [attachAuthHeaders]
//   → sets Authorization, X-Predio-Id, Accept-Language
// afterResponse: [handle401Refresh, normalizeErrors]
//   → 401 on non-auth routes: shared-promise refresh + retry
//   → non-2xx: throw ApiError
```

### Service Factory
```typescript
// auth.service.ts
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
export const authService: AuthService = USE_MOCKS
  ? new MockAuthService()
  : new RealAuthService(apiClient);
```

---

## 5. File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/middleware.ts` | Create | Cookie-based route guard with redirect preservation |
| `apps/web/src/app/layout.tsx` | Modify | Wrap children in `<AppProviders>` |
| `apps/web/src/app/(auth)/layout.tsx` | Create | Centered fullscreen layout for login/2FA |
| `apps/web/src/app/(auth)/login/page.tsx` | Create | Thin page importing LoginForm + useLogin |
| `apps/web/src/app/(auth)/verificar-2fa/page.tsx` | Create | Thin page importing TwoFactorForm + useVerify2FA |
| `apps/web/src/app/(dashboard)/layout.tsx` | Create | Minimal auth shell (sidebar placeholder) |
| `apps/web/src/app/(dashboard)/page.tsx` | Create | Dashboard placeholder |
| `apps/web/src/modules/auth/components/login-form.tsx` | Create | Presentational login form |
| `apps/web/src/modules/auth/components/two-factor-form.tsx` | Create | Presentational 6-digit OTP form + timer |
| `apps/web/src/modules/auth/components/can.tsx` | Create | RBAC conditional render component |
| `apps/web/src/modules/auth/hooks/use-login.ts` | Create | Login orchestration hook |
| `apps/web/src/modules/auth/hooks/use-verify-2fa.ts` | Create | 2FA orchestration hook |
| `apps/web/src/modules/auth/hooks/use-logout.ts` | Create | Logout orchestration hook |
| `apps/web/src/modules/auth/hooks/use-permission.ts` | Create | Permission check with wildcard |
| `apps/web/src/modules/auth/services/auth.service.ts` | Create | Interface + factory |
| `apps/web/src/modules/auth/services/auth.mock.ts` | Create | Mock with 4 users, delays |
| `apps/web/src/modules/auth/services/auth.api.ts` | Create | Real impl wrapping apiClient |
| `apps/web/src/modules/auth/schemas/login.schema.ts` | Create | Form-level Zod schemas |
| `apps/web/src/store/auth.store.ts` | Create | Zustand auth store (memory-only) |
| `apps/web/src/store/predio.store.ts` | Create | Zustand predio store |
| `apps/web/src/shared/lib/api-client.ts` | Create | ky instance + interceptors |
| `apps/web/src/shared/lib/errors.ts` | Create | ApiError + normalizer |
| `apps/web/src/shared/providers/app-providers.tsx` | Create | Client providers wrapper |
| `packages/shared-types/src/schemas/auth.schema.ts` | Create | User, Predio, auth response Zod schemas |
| `packages/shared-types/src/dtos/auth.dto.ts` | Create | z.infer type exports |
| `packages/shared-types/src/index.ts` | Modify | Add auth schema/dto exports |
| `apps/web/package.json` | Modify | Add zustand, ky, react-hook-form, @hookform/resolvers |
| `apps/web/.env.local` | Create | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_USE_MOCKS=true |

**Totals**: 25 new files, 3 modified files, 0 deleted files

---

## 6. Component Architecture (Container-Presentational)

### Login
```
app/(auth)/login/page.tsx          ← 'use client', composes hook + component
  └── useLogin() hook              ← Container: state, service calls, redirect logic
       └── LoginForm               ← Presentational: receives onSubmit, error, isLoading
            ├── <input email>
            ├── <input password>
            └── <button submit>
```

**LoginForm Props**:
```typescript
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  error: string | null;
  isLoading: boolean;
}
```

### 2FA
```
app/(auth)/verificar-2fa/page.tsx  ← 'use client', reads ?temp= from searchParams
  └── useVerify2FA(tempToken) hook ← Container: timer, submit, redirect
       └── TwoFactorForm           ← Presentational: OTP inputs, timer display, error
            ├── <input×6>          (auto-advance, paste support)
            ├── <timer display>
            └── <button submit>
```

**TwoFactorFormProps**:
```typescript
interface TwoFactorFormProps {
  onSubmit: (code: string) => void;
  onResend: () => void;
  error: string | null;
  isLoading: boolean;
  timeRemaining: number;     // seconds
  canResend: boolean;
}
```

---

## 7. Security Design

| Threat | Mitigation |
|--------|------------|
| XSS token theft | accessToken in Zustand memory ONLY. Never touches localStorage/sessionStorage/cookie from JS. |
| Open redirect via ?redirect= | Validate redirect starts with `/` and does NOT contain `://` or `//`. Default to `/dashboard`. |
| CSRF on mutations | refreshToken is httpOnly + SameSite=Lax cookie. API mutations require Bearer token in Authorization header (double-submit equivalent). |
| Token in SSR | middleware.ts only checks cookie EXISTENCE, never reads token value. No server components access tokens. |
| refreshToken replay | Handled by backend (rotation). Frontend just calls POST /auth/refresh with credentials: include. |

### Open Redirect Prevention
```typescript
function sanitizeRedirect(redirect: string | null): string {
  if (!redirect) return '/dashboard';
  if (!redirect.startsWith('/')) return '/dashboard';
  if (redirect.includes('://') || redirect.startsWith('//')) return '/dashboard';
  return redirect;
}
```

---

## 8. Dependency Decisions

| Package | Version | Why chosen | Alternatives rejected |
|---------|---------|------------|----------------------|
| zustand | ^5.0 | <1KB, works outside React (interceptors read state), no boilerplate | Redux (heavy), Jotai (no getState outside React), Context (re-renders) |
| ky | ^1.0 | Fetch-based, <3KB, hooks API for interceptors, retry control | axios (XHR-based, 13KB), ofetch (less mature hooks) |
| react-hook-form | ^7.54 | Uncontrolled perf, Zod integration, field-level re-render control | Formik (heavier, controlled), native (no field arrays) |
| @hookform/resolvers | ^3.9 | Official bridge: zodResolver for RHF | Manual validation (verbose, error-prone) |
| zod | ^3.23 | Already in shared-types, runtime + static types from one source | Yup (no infer), Valibot (less ecosystem) |

**NOT adding**: @radix-ui/* (not needed for auth — only input/button/label which are native HTML). Radix comes with dashboard UI module later.

---

## 9. Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | auth.store.ts: setAuth, clearAuth, isLoading | Vitest: direct store manipulation |
| Unit | predio.store.ts: setPredios, switchPredio, clearPredios | Vitest: store + sessionStorage mock |
| Unit | ApiError class, normalizeApiError | Vitest: various status codes |
| Unit | usePermission hook, Can component | Vitest + RTL: permission arrays → boolean/DOM |
| Unit | LoginSchema, Verify2FASchema | Vitest: valid/invalid inputs → parse results |
| Unit | sanitizeRedirect | Vitest: various malicious inputs |
| Integration | useLogin hook: mock service → store populated → redirect | Vitest + mock authService |
| Integration | api-client 401 refresh queue | Vitest: 3 concurrent 401s → single refresh |
| Integration | middleware.ts | Edge runtime test: cookie present/absent → redirect behavior |
| Security | accessToken NOT in localStorage after setAuth | Vitest: explicit assertion |

---

## 10. Integration Points

### Future Modules (animales, servicios, etc.)
- Import `apiClient` from `@/shared/lib/api-client` — auth headers auto-attached
- Import `usePermission` / `Can` from `@/modules/auth` — RBAC in any module
- Read `predioStore.predioActivo` — interceptor sends X-Predio-Id automatically

### shared-types Consumption
- `auth.schema.ts` defines Zod schemas → `auth.dto.ts` exports inferred types
- `modules/auth/services/` parse API responses through Zod schemas (contract enforcement)
- `modules/auth/schemas/login.schema.ts` imports from shared-types for form validation

### Predio Switch → Cache Invalidation
- `predioStore.switchPredio()` updates `lastSwitchTimestamp`
- Future: components subscribe to `lastSwitchTimestamp` to trigger TanStack Query `invalidateQueries()`
- Auth change establishes the pattern; data modules consume it

---

## 11. Provider Architecture

### Nesting Order (root layout.tsx)
```
<html>
  <body>
    <AppProviders>           ← Client component boundary
      {children}             ← Route group layouts render here
    </AppProviders>
  </body>
</html>
```

**AppProviders** for auth-frontend phase is minimal — just a client boundary. No QueryClientProvider yet (comes with data modules). Zustand stores don't need providers (module-level singletons).

### Hydration Strategy
- Stores initialize with `null/[]` defaults (no SSR hydration needed)
- middleware.ts ensures unauthenticated users never see dashboard (no flash)
- On authenticated page load: `useLogin`/`useVerify2FA` already populated the store during login flow
- On page refresh while authenticated: store is empty but middleware.ts allows render (cookie exists); a future `AuthProvider` will call `getMe()` to rehydrate. For auth-frontend phase, this is an ACCEPTED LIMITATION — refresh loses in-memory state, middleware still protects routes.

---

## Migration / Rollout

No migration required. Greenfield module — all files are new except minor modifications to `layout.tsx`, `package.json`, and `shared-types/index.ts`.

## Open Questions

- [x] IDs format: existing schemas use `z.number().int()` (not UUID strings). Auth schemas should use `z.string().uuid()` for user/predio IDs per spec, OR align with existing numeric IDs. **Decision**: Auth schemas use `z.string()` for IDs as spec defines — backend auth API may use string UUIDs even if animal tables use numeric. Reconcile at integration time.
- [ ] Does the backend set `refreshToken` cookie with `SameSite=Lax; Secure; HttpOnly`? Mock service simulates this with an internal flag.
- [ ] POST /auth/login — does it return predios in the response, or is a separate GET /predios required? Design assumes separate call.
