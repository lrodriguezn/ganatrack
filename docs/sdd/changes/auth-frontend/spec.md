# SDD Delta Spec: auth-frontend

## Project Context
- **Project**: ganatrack
- **Persistence**: engram
- **Topic key**: sdd/auth-frontend/spec
- **Proposal**: sdd/auth-frontend/proposal (mem #25)
- **PRD Context**: sdd/prd-frontend/spec (mems #8, #15)

---

## 1. Auth Store (Zustand)

### SPEC-AUTH-STORE-01: State Shape

**Description**: Auth store MUST hold authentication state in memory-only (Zustand).

**State Shape**:
```typescript
interface AuthState {
  accessToken: string | null;      // Memory-only, NEVER persisted
  user: User | null;
  permissions: string[];         // Array of "module:action" strings
  isAuthenticated: boolean;      // Derived: !!accessToken && !!user
  isLoading: boolean;            // For async operations (login, refresh)
}
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Initial state | App loads | accessToken === null, user === null, permissions === [], isAuthenticated === false |
| setAuth called with valid token+user | Any time | accessToken, user, permissions populated; isAuthenticated === true |
| clearAuth called | Any time | accessToken === null, user === null, permissions === [], isAuthenticated === false |
| setLoading(true) | Before async operation | isLoading === true |
| setLoading(false) | After async operation | isLoading === false |

**Constraints**:
- **MUST NOT**: Store accessToken in localStorage, sessionStorage, cookies, or any persistent storage
- **MUST NOT**: Use Zustand persist middleware for auth store
- **MUST**: Clear all fields on logout

---

### SPEC-AUTH-STORE-02: Actions

**Description**: Auth store MUST expose typed actions for state mutations.

**Actions**:
```typescript
interface AuthActions {
  setAuth(auth: { accessToken: string; user: User; permissions: string[] }): void;
  clearAuth(): void;
  setLoading(loading: boolean): void;
}
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Any state | setAuth({ accessToken, user, permissions }) | State updated atomically, isAuthenticated auto-derives to true |
| Any state | clearAuth() | All fields reset to initial state |
| Any state | setLoading(true) | isLoading === true |
| Any state | setLoading(false) | isLoading === false |

---

### SPEC-AUTH-STORE-03: Selectors / Derived State

**Description**: Auth store MUST provide memoized selectors for common derived values.

**Selectors**:
```typescript
// Manual derivation (not Zustand selectors, just computed booleans)
const isAuthenticated = () => !!authStore.getState().accessToken && !!authStore.getState().user;
const hasPermission = (permission: string) => authStore.getState().permissions.includes(permission);
const hasAnyPermission = (perms: string[]) => perms.some(p => authStore.getState().permissions.includes(p));
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| user.role === "admin" | hasPermission("usuarios:ver") | true |
| user.role === "visor" | hasPermission("usuarios:ver") | false |
| Empty permissions array | hasAnyPermission(["a:write", "b:write"]) | false |
| permissions includes "a:write" | hasAnyPermission(["a:write", "b:write"]) | true |

---

## 2. Predio Store (Zustand)

### SPEC-PREDIO-STORE-01: State Shape

**Description**: Predio store MUST hold multi-predio state and active selection.

**State Shape**:
```typescript
interface PredioState {
  predioActivo: Predio | null;
  predios: Predio[];           // List of predios accessible to user
  isLoading: boolean;
  lastSwitchTimestamp: number | null;  // Unix ms — for cache invalidation signal
}
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Initial state | App loads | predioActivo === null, predios === [], isLoading === false |
| setPredios([predioA, predioB]) called | Login or fetch | predios === [predioA, predioB], isLoading === false |
| switchPredio(predioB.id) | User changes selection | predioActivo === predioB, lastSwitchTimestamp updated to Date.now() |
| clearPredios() | Logout | All fields reset to initial |

---

### SPEC-PREDIO-STORE-02: Actions

**Description**: Predio store MUST expose actions for managing predios and signaling cache invalidation.

**Actions**:
```typescript
interface PredioActions {
  setPredios(predios: Predio[]): void;
  switchPredio(id: string): void;
  clearPredios(): void;
}
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| predios = [predioA, predioB] | switchPredio(predioB.id) | predioActivo === predioB AND lastSwitchTimestamp === Date.now() |
| predios = [] | switchPredio(anyId) | No-op (guard: if predios.length === 0, do nothing) |
| Any state | clearPredios() | All fields reset to initial values |

**Constraints**:
- **MUST**: Update `lastSwitchTimestamp` on every successful switchPredio call
- **MUST**: The timestamp is the signal for TanStack Query cache invalidation hooks (external consumers read this value)

---

## 3. API Client (ky)

### SPEC-API-CLIENT-01: Base Configuration

**Description**: API client MUST be a configured ky instance with base URL from env.

**File**: `apps/web/src/shared/lib/api-client.ts`

**Configuration**:
```typescript
import ky from 'ky';

export const apiClient = ky.create({
  prefixUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: 30000,
  retry: 0, // No automatic retry — manual token refresh handles 401
});
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Env: NEXT_PUBLIC_API_URL="https://api.ganatrack.com" | Any request | URL prefix is "https://api.ganatrack.com/api/v1" |
| Env not set | Any request | prefixUrl falls back to "" + "/api/v1" (relative) |

---

### SPEC-API-CLIENT-02: Request Interceptor (beforeRequest)

**Description**: Request interceptor MUST attach auth headers and active predio on every outgoing request.

**Headers**:
- `Authorization: Bearer {accessToken}` — from authStore (memory)
- `X-Predio-Id: {predioActivo.id}` — from predioStore (if active)
- `Accept-Language: es` — hardcoded locale

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| authStore has accessToken="abc123" | apiClient.get("animales") | Request headers include Authorization: Bearer abc123 |
| authStore has NO accessToken | apiClient.get("animales") | Authorization header NOT sent |
| predioStore has predioActivo.id="predio-1" | apiClient.get("animales") | X-Predio-Id: predio-1 header sent |
| predioStore has NO active predio | apiClient.get("animales") | X-Predio-Id header NOT sent |
| Always | Any request | Accept-Language: es header sent |

---

### SPEC-API-CLIENT-03: Response Interceptor (afterResponse) — 401 → Refresh → Retry

**Description**: Response interceptor MUST detect 401, refresh token, retry original request transparently.

**Flow**:
1. Response has status 401
2. Check if this is an auth endpoint (login, 2fa, refresh) — if so, don't refresh, throw error
3. Call `POST /auth/refresh` — browser auto-sends httpOnly refreshToken cookie
4. On success: update authStore with new accessToken
5. Retry original request with new token
6. On refresh failure (401/403): call clearAuth() and throw ApiError

**Constraints**:
- **MUST NOT**: Retry auth endpoints (/auth/login, /auth/2fa/*, /auth/refresh) — these return 401 legitimately when credentials are wrong
- **MUST**: Throw normalized ApiError after exhausted retries

---

### SPEC-API-CLIENT-04: Refresh Queue Pattern (Shared Promise)

**Description**: Parallel 401 responses MUST share a single refresh promise to avoid race conditions.

**Pattern**:
```typescript
let refreshPromise: Promise<string> | null = null;

const getOrCreateRefreshPromise = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = executeRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
};
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| 3 concurrent requests all return 401 | Each response interceptor calls getOrCreateRefreshPromise | executeRefresh called exactly ONCE |
| Refresh completes with new token | All 3 requests retry | All 3 receive new token and succeed |
| Refresh fails | All 3 requests receive ApiError | clearAuth called once, authStore cleared |

---

### SPEC-API-CLIENT-05: Error Normalization

**Description**: All non-2xx responses MUST be normalized to an ApiError class with typed structure.

**ApiError Class**:
```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,        // e.g., "INVALID_CREDENTIALS", "RATE_LIMITED"
    public message: string,     // User-facing message
    public details?: Record<string, string[]>  // Field-level errors for forms
  ) {
    super(message);
  }
}
```

**Response → ApiError Mapping**:

| Status | Response body shape | ApiError fields |
|--------|---------------------|-----------------|
| 400 | `{ message: string, errors?: Record<string, string[]> }` | status=400, code="VALIDATION_ERROR", message, details |
| 401 | `{ message: string }` | status=401, code="INVALID_CREDENTIALS", message |
| 403 | `{ message: string }` | status=403, code="FORBIDDEN", message |
| 404 | `{ message: string }` | status=404, code="NOT_FOUND", message |
| 422 | `{ message: string, code?: string }` | status=422, code=body.code or "UNPROCESSABLE", message |
| 429 | `{ message: string }` | status=429, code="RATE_LIMITED", message |
| 500 | `{ message: string }` | status=500, code="SERVER_ERROR", message |

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Server returns 400 with field errors | After response | ApiError.status===400, ApiError.details populated |
| Server returns 401 | After response (not refresh) | ApiError.code==="INVALID_CREDENTIALS" |
| Server returns 500 | After response | ApiError.code==="SERVER_ERROR", message is generic "Error del servidor" |

---

## 4. Auth Service Interface

### SPEC-AUTH-SERVICE-IF-01: Interface Definition

**Description**: Auth service MUST be defined as an interface for mock/real swap.

**File**: `apps/web/src/modules/auth/services/auth.service.ts`

```typescript
interface AuthService {
  login(credentials: { email: string; password: string }): Promise<AuthResponse | TwoFactorResponse>;
  verify2FA(tempToken: string, code: string): Promise<AuthResponse>;
  refreshToken(): Promise<{ accessToken: string }>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
  getPredios(): Promise<Predio[]>;
}

interface AuthResponse {
  accessToken: string;
  user: User;
  permissions: string[];
}

interface TwoFactorResponse {
  requires2FA: true;
  tempToken: string;
}

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: "admin" | "operario" | "visor";
  permisos?: string[]; //_DEPRECATED — use permissions array from AuthResponse
}

interface Predio {
  id: string;
  nombre: string;
  departamento: string;
  municipio: string;
  area: number;
  estado: "activo" | "inactivo";
}
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Valid credentials, no 2FA | login() | Returns AuthResponse with accessToken, user, permissions |
| Valid credentials, 2FA enabled | login() | Returns TwoFactorResponse with requires2FA=true and tempToken |
| Invalid credentials | login() | Throws ApiError(401, "INVALID_CREDENTIALS", ...) |
| Valid tempToken + correct OTP | verify2FA() | Returns AuthResponse |
| Invalid OTP | verify2FA() | Throws ApiError(422, "INVALID_OTP", ...) |
| Valid refreshToken cookie | refreshToken() | Returns { accessToken: string } |
| Expired refreshToken | refreshToken() | Throws ApiError(401, ..., ...) |
| Authenticated | getMe() | Returns User |
| Authenticated | getPredios() | Returns Predio[] |

---

## 5. Mock Auth Service

### SPEC-AUTH-MOCK-01: Hardcoded Users

**Description**: Mock service MUST provide 3 hardcoded users with realistic data.

**Users**:

| Email | Password | Role | 2FA | Permissions |
|-------|----------|------|-----|-------------|
| admin@ganatrack.com | Admin123! | admin | No | ["*:*"] (all) |
| vet@ganatrack.com | Vet123! | operario | No | ["animales:read", "animales:write", "servicios:read", "servicios:write", "reportes:read"] |
| visor@ganatrack.com | Visor123! | visor | No | ["animales:read", "reportes:read"] |
| vet2fa@ganatrack.com | Vet2FA123! | operario | YES | ["animales:read", "animales:write"] |

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Email "admin@ganatrack.com", password "Admin123!" | mock.login() | Returns AuthResponse, permissions includes "*:*" |
| Email "vet2fa@ganatrack.com", password "Vet2FA123!" | mock.login() | Returns TwoFactorResponse with tempToken |
| Any wrong password | mock.login() | Throws ApiError(401, "INVALID_CREDENTIALS", ...) |
| Any unknown email | mock.login() | Throws ApiError(401, "INVALID_CREDENTIALS", ...) |

---

### SPEC-AUTH-MOCK-02: Simulated Delays

**Description**: Mock service MUST simulate network latency for realistic testing.

**Delays**:
- login(): 800ms delay
- verify2FA(): 600ms delay
- refreshToken(): 300ms delay
- logout(): 400ms delay
- getMe(): 200ms delay
- getPredios(): 500ms delay

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| login() called | Timer check | Response received after 700-900ms |
| verify2FA() called | Timer check | Response received after 500-700ms |

---

### SPEC-AUTH-MOCK-03: Env Var Toggle

**Description**: Mock/real service selection MUST be controlled by NEXT_PUBLIC_USE_MOCKS env var.

**Logic**:
```typescript
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// In service factory:
export const authService: AuthService = USE_MOCKS ? authMockService : realApiAuthService;
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| NEXT_PUBLIC_USE_MOCKS="true" | App starts | authService uses authMockService |
| NEXT_PUBLIC_USE_MOCKS="false" or unset | App starts | authService uses realApiAuthService |

**Constraints**:
- **MUST**: Default to real API (mock disabled) when env var not set
- **MUST**: Mock simulate httpOnly cookie behavior via internal state flag (NOT actual cookies)

---

## 6. Login Flow

### SPEC-LOGIN-01: Form Validation Schema (Zod)

**Description**: Login form MUST validate inputs before submission.

**Schema**:
```typescript
const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| email="" | Submit | Zod error: "Email inválido" |
| email="notanemail" | Submit | Zod error: "Email inválido" |
| email="test@test.com", password="short" | Submit | Zod error: "La contraseña debe tener al menos 8 caracteres" |
| Valid email+password | Submit | No Zod errors, form proceeds |

---

### SPEC-LOGIN-02: Submit Flow

**Description**: Login form submit MUST execute full auth flow with proper branching.

**Flow**:
1. Validate form with Zod schema → if invalid, show field errors
2. Set authStore.setLoading(true)
3. Call authService.login({ email, password })
4. **If returns AuthResponse** (no 2FA):
   - authStore.setAuth({ accessToken, user, permissions })
   - Call authService.getPredios() → authService.getMe()
   - authStore.setLoading(false)
   - redirect to /dashboard
5. **If returns TwoFactorResponse** (requires 2FA):
   - authStore.setLoading(false)
   - redirect to /verificar-2fa?temp={tempToken}
6. **If ApiError thrown**:
   - authStore.setLoading(false)
   - Show error message: if status===401 → "Credenciales inválidas", else → "Error del servidor"

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Valid credentials, no 2FA | Submit | User redirected to /dashboard |
| Valid credentials, 2FA enabled | Submit | User redirected to /verificar-2fa?temp=... |
| Invalid credentials (401) | Submit | Error shown: "Credenciales inválidas", password field cleared |
| Network error | Submit | Error shown: "Error de conexión" |
| Rate limited (429) | Submit | Error shown: "Demasiados intentos. Intenta más tarde." |

**Constraints**:
- **MUST**: Clear password field on 401 error (security — don't reveal which field was wrong)
- **MUST NOT**: Reveal whether email or password was wrong on 401

---

### SPEC-LOGIN-03: Error Handling

**Description**: Login form MUST handle all error cases with appropriate user feedback.

**Error Messages**:

| Error type | Message | Visual treatment |
|------------|---------|-------------------|
| Invalid credentials (401) | "Credenciales inválidas" | Red text below form |
| Rate limited (429) | "Demasiados intentos. Intenta más tarde." | Red text below form + disable submit for 60s |
| Network error | "Error de conexión. Verifica tu internet." | Red text below form |
| Server error (500) | "Error del servidor. Intenta de nuevo." | Red text below form |
| Form validation | Field-level Zod errors | Red text under each invalid field |

---

## 7. 2FA Flow

### SPEC-2FA-01: OTP Input

**Description**: 2FA page MUST accept 6-digit OTP with proper validation.

**Validation Schema**:
```typescript
const Verify2FASchema = z.object({
  code: z.string().length(6, "Código debe tener 6 dígitos").regex(/^\d{6}$/, "Solo números"),
});
```

**UI Behavior**:
- 6 separate input boxes, auto-advance on digit entry
- Paste support: pasting 6 digits distributes across inputs
- Backspace moves to previous input and clears current

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| User types 1 digit | Any input | Focus moves to next input |
| User pastes "123456" | Paste event | All 6 inputs populated, form submittable |
| User presses Backspace on empty input | Backspace | Focus moves to previous input |
| Less than 6 digits entered | Submit attempt | Zod error shown |

---

### SPEC-2FA-02: TempToken Expiry Timer

**Description**: 2FA page MUST show countdown timer for tempToken validity.

**Behavior**:
- tempToken valid for 5 minutes (300 seconds)
- Display as "Código expira en 4:59" format (mm:ss)
- At 60 seconds remaining: turn red/warning style
- At 0 seconds: disable submit, show "Código expirado", enable "Reenviar código" button

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Page loads with tempToken | Timer starts | Shows 5:00, counts down |
| 60 seconds remaining | Timer tick | Text turns red |
| 0 seconds | Timer tick | Submit disabled, "Código expirado" shown |
| Expired token submitted | Submit | Error: "Código expirado. Solicita uno nuevo." |

---

### SPEC-2FA-03: Resend OTP Action

**Description**: 2FA page MUST provide resend action to request new OTP.

**Behavior**:
- "Reenviar código" button calls authService.resend2FA(tempToken)
- Resend disabled if < 30 seconds since last send
- After resend success: reset timer to 5:00, show "Código reenviado"

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| 30+ seconds since last send | Click "Reenviar código" | New tempToken obtained, timer reset |
| < 30 seconds since last send | Click "Reenviar código" | Button disabled, no action |
| Resend fails | API returns error | Toast: "No se pudo reenviar. Intenta de nuevo." |

---

### SPEC-2FA-04: Submit Flow

**Description**: 2FA form submit MUST complete authentication on success.

**Flow**:
1. Validate OTP with Verify2FASchema → if invalid, show errors
2. Set authStore.setLoading(true)
3. Read tempToken from URL searchParams (?temp=...)
4. Call authService.verify2FA(tempToken, code)
5. **On success (AuthResponse)**:
   - authStore.setAuth({ accessToken, user, permissions })
   - Call authService.getPredios()
   - authStore.setLoading(false)
   - redirect to /dashboard
6. **On error (ApiError)**:
   - authStore.setLoading(false)
   - Show error: if status===422 → "Código inválido", else → generic error

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Valid tempToken + correct OTP | Submit | User redirected to /dashboard, auth state populated |
| Wrong OTP | Submit | Error: "Código inválido" |
| Expired tempToken | Submit | Error: "Código expirado. Solicita uno nuevo." |

---

## 8. Route Protection (middleware.ts)

### SPEC-MIDDLEWARE-01: Public Routes

**Description**: middleware.ts MUST define public routes that don't require authentication.

**Public Routes**:
- `/login` — Login page
- `/verificar-2fa` — 2FA verification page
- `/api/v1/auth/*` — Auth API endpoints (let API handle auth)
- Next.js internals: `_next/*`, `favicon.ico`, etc.

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Unauthenticated request | GET /login | Rendered (no redirect) |
| Unauthenticated request | GET /verificar-2fa?temp=xxx | Rendered (no redirect) |
| Authenticated request | GET /login | Redirect to /dashboard |

---

### SPEC-MIDDLEWARE-02: Protected Routes

**Description**: All routes under `/(dashboard)` MUST require authentication.

**Protected Pattern**: `/(dashboard)/:path*` or `/((?!login|verificar-2fa|api/auth).)*` depending on Next.js route group convention.

**Session Check**: Read `refreshToken` cookie (httpOnly, set by backend on login/refresh). If cookie absent → unauthenticated.

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| No refreshToken cookie | GET /dashboard | Redirect to /login?redirect=/dashboard |
| No refreshToken cookie | GET /animales | Redirect to /login?redirect=/animales |
| No refreshToken cookie | GET /dashboard/predios/123 | Redirect to /login?redirect=/dashboard/predios/123 |
| Has refreshToken cookie | GET /dashboard | Rendered (no redirect) |
| Has refreshToken cookie | GET /login | Redirect to /dashboard |

---

### SPEC-MIDDLEWARE-03: Redirect Preservation

**Description**: Original path MUST be preserved in redirect for post-login redirect.

**Logic**:
```
1. Extract `redirect` query param from /login URL
2. If redirect param present and is internal path: redirect there
3. Else default to /dashboard
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Accessing /animales without auth | GET /login?redirect=/animales after login | User lands on /animales |
| Accessing /dashboard/predios/123 without auth | GET /login?redirect=/dashboard/predios/123 | User lands on /dashboard/predios/123 |
| No redirect param | /login? redirect= | User lands on /dashboard |
| External redirect attempt | redirect=https://evil.com | Redirect blocked, default to /dashboard |

**Constraints**:
- **MUST**: Validate redirect is internal (same origin) to prevent open redirect vulnerability

---

## 9. RBAC (usePermission + Can)

### SPEC-RBAC-01: usePermission Hook

**Description**: usePermission hook MUST check if current user has a specific permission.

**Signature**:
```typescript
function usePermission(permission: string): boolean;
```

**Implementation**:
```typescript
function usePermission(permission: string): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  
  // Admin wildcard: "*" grants all permissions
  if (permissions.includes("*")) return true;
  
  return permissions.includes(permission);
}
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| permissions=["*:*"] | usePermission("anything:read") | true |
| permissions=["animales:read", "animales:write"] | usePermission("animales:read") | true |
| permissions=["animales:read", "animales:write"] | usePermission("reportes:read") | false |
| permissions=[] | usePermission("any:thing") | false |
| user not authenticated (permissions=[]) | usePermission(any) | false |

---

### SPEC-RBAC-02: Can Component

**Description**: Can component MUST conditionally render children based on permission check.

**Signature**:
```typescript
interface CanProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function Can({ permission, children, fallback = null }: CanProps): JSX.Element;
```

**Implementation**:
```typescript
function Can({ permission, children, fallback = null }: CanProps): JSX.Element {
  const hasPermission = usePermission(permission);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| User has "animales:write" | `<Can permission="animales:write"><button>Crear</button></Can>` | Button rendered |
| User lacks "animales:write" | `<Can permission="animales:write"><button>Crear</button></Can>` | Nothing rendered |
| User lacks permission, fallback provided | `<Can permission="x" fallback={<span>No access</span>}>...</Can>` | Fallback rendered |
| Admin user (*:* ) | `<Can permission="usuarios:delete">...</Can>` | Children rendered (wildcard match) |

---

### SPEC-RBAC-03: Permission Format

**Description**: Permissions MUST follow `module:action` format from backend.

**Examples**:
| Permission string | Meaning |
|-------------------|---------|
| `animales:read` | View animals |
| `animales:write` | Create/edit animals |
| `animales:delete` | Delete animals |
| `reportes:export` | Export reports |
| `usuarios:ver` | View user management |
| `*:*` | Admin wildcard (all permissions) |

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Backend sends `permissions: ["animales:read", "animales:write"]` | Login | Store contains exactly those strings |
| Any permission string | usePermission() | Correct boolean based on array.includes() |

---

## 10. Auth Schemas (shared-types)

### SPEC-SCHEMAS-01: Login Schemas

**Description**: Zod schemas for login request/response.

```typescript
// LoginRequest
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// LoginResponse (normal login success)
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
  permissions: z.array(z.string()),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// TwoFactorResponse
export const TwoFactorResponseSchema = z.object({
  requires2FA: z.literal(true),
  tempToken: z.string(),
});
export type TwoFactorResponse = z.infer<typeof TwoFactorResponseSchema>;
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Valid login response | Parse with LoginResponseSchema | accessToken, user, permissions extracted correctly |
| 2FA response | Parse with TwoFactorResponseSchema | requires2FA===true, tempToken extracted |
| Malformed response | Parse | Zod throws error (schema validation) |

---

### SPEC-SCHEMAS-02: 2FA Schemas

**Description**: Zod schemas for 2FA verification.

```typescript
// Verify2FARequest
export const Verify2FARequestSchema = z.object({
  tempToken: z.string(),
  code: z.string().length(6).regex(/^\d{6}$/),
});
export type Verify2FARequest = z.infer<typeof Verify2FARequestSchema>;

// AuthResponse (same as LoginResponse, reused)
export const AuthResponseSchema = LoginResponseSchema;
export type AuthResponse = LoginResponse;
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| Valid Verify2FARequest | Parse | { tempToken, code } extracted |
| Code not 6 digits | Parse | Zod throws |
| Code non-numeric | Parse | Zod throws |

---

### SPEC-SCHEMAS-03: Refresh and Logout Schemas

**Description**: Zod schemas for token refresh and logout.

```typescript
// RefreshResponse
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
});
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

// LogoutRequest (empty, just cookie-based)
export const LogoutRequestSchema = z.object({});
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
```

---

### SPEC-SCHEMAS-04: User and Predio Schemas

**Description**: Zod schemas for User and Predio types.

```typescript
// User
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nombre: z.string().min(1),
  rol: z.enum(["admin", "operario", "visor"]),
});
export type User = z.infer<typeof UserSchema>;

// Predio
export const PredioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  departamento: z.string(),
  municipio: z.string(),
  area: z.number().positive(),
  estado: z.enum(["activo", "inactivo"]),
});
export type Predio = z.infer<typeof PredioSchema>;
```

**Acceptance Criteria**:

| Given | When | Then |
|-------|------|------|
| API returns user object | Parse with UserSchema | User typed with correct fields |
| API returns array of predios | Parse with z.array(PredioSchema) | Array of typed Predio |
| Invalid rol value | Parse | Zod throws |

---

### SPEC-SCHEMAS-05: Permission Schema

**Description**: Zod schema for permission strings.

```typescript
// Permission (string format: "module:action")
// No strict validation — backend controls format
// But we validate it's a non-empty string with colon
export const PermissionSchema = z.string().regex(/^[^:]+:[^:]+$/, {
  message: "Permission must be in 'module:action' format",
});
export type Permission = z.infer<typeof PermissionSchema>;

// PermissionsArray
export const PermissionsArraySchema = z.array(PermissionSchema);
export type Permissions = z.infer<typeof PermissionsArraySchema>;
```

---

## File Structure Summary

```
apps/web/src/
├── modules/auth/
│   ├── services/
│   │   ├── auth.service.ts          # Interface + factory
│   │   ├── auth.mock.ts            # Mock implementation
│   │   └── auth.api.ts             # Real API implementation
│   ├── hooks/
│   │   ├── usePermission.ts
│   │   └── useAuth.ts
│   ├── components/
│   │   └── Can.tsx
│   └── pages/
│       └── (auth)/
│           ├── login/page.tsx
│           └── verificar-2fa/page.tsx
├── store/
│   ├── auth.store.ts
│   └── predio.store.ts
├── shared/
│   └── lib/
│       ├── api-client.ts           # ky instance + interceptors
│       └── errors.ts               # ApiError class
├── middleware.ts
└── app-providers.tsx               # Providers wrapper

packages/shared-types/src/
├── schemas/
│   └── auth.schema.ts             # All auth Zod schemas
└── dtos/
    └── auth.dto.ts                 # z.infer type exports
```

---

## Acceptance Criteria Summary

| ID | Criterion | Verification |
|----|-----------|--------------|
| CA-AUTH-01 | accessToken never in localStorage/sessionStorage | Vitest: after setAuth, localStorage.getItem === null |
| CA-AUTH-02 | 401 triggers single refresh for parallel requests | Vitest: mock 3 concurrent 401s, verify refresh called once |
| CA-AUTH-03 | Unauthenticated /dashboard → /login?redirect=/dashboard | Unit test middleware |
| CA-AUTH-04 | Authenticated /login → /dashboard | Unit test middleware |
| CA-AUTH-05 | usePermission returns correct boolean | Vitest: multiple permission arrays → expected booleans |
| CA-AUTH-06 | Can renders/hides children correctly | RTL: render with permissions → DOM assertions |
| CA-AUTH-07 | switchPredio updates lastSwitchTimestamp | Vitest: store test |
| CA-AUTH-08 | Mock toggle via NEXT_PUBLIC_USE_MOCKS | Env var check in factory |
| CA-AUTH-09 | Login form validates before submit | Zod schema unit tests |
| CA-AUTH-10 | 2FA timer counts down and expires | Component test with fake timers |

---

## Dependencies (npm packages)

| Package | Version | Purpose |
|---------|---------|---------|
| zustand | ^5.x | Auth + Predio stores |
| ky | ^1.x | HTTP client with interceptors |
| react-hook-form | ^7.x | Form management |
| @hookform/resolvers | ^3.x | Zod resolver for RHF |
| zod | ^3.x | Schema validation (also in shared-types) |
| @radix-ui/react-label | latest | Accessible label |
| @radix-ui/react-slot | latest | Composable primitives |
| @radix-ui/react-form | latest | Accessible form primitives |
