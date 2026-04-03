# Exploration: auth-frontend

## Current State
The `apps/web` Next.js app is scaffolded with a basic structure. The `modules/`, `shared/`, and `store/` directories are empty `.gitkeep` placeholders. The `package.json` shows minimal dependencies:

- next: 15.1.6
- react: 18.3.1
- tailwindcss: 4.1.17
- tailwind-merge, @tailwindcss/forms, @tailwindcss/postcss

No auth-related code exists yet.

## Auth Requirements from PRDs

### Frontend PRD (Section 8 — Auth)

| Req ID | Description |
|--------|-------------|
| AUTH-01 | Login flow (email/password → accessToken in Zustand, refreshToken via httpOnly cookie) |
| AUTH-02 | 2FA flow (tempToken → redirect to /verificar-2fa → OTP verification) |
| AUTH-03 | Auto-refresh token on 401 (ky interceptor, queue pending requests) |
| AUTH-04 | Route protection via middleware.ts (cookie-based, redirect to /login) |
| AUTH-05 | RBAC frontend (usePermission hook, Can component) |
| AUTH-06 | Multi-predio: switchPredio() invalidates TanStack Query cache |
| AUTH-07 | Logout: POST /auth/logout → clear stores → redirect /login |

### Backend PRD (Section 7.1 — auth endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/login | Body: `{email, password}` → success: `{accessToken, refreshToken, usuario, predios[]}` or `{requires2FA: true, tempToken}` |
| POST | /auth/refresh | Uses httpOnly cookie, returns new accessToken |
| POST | /auth/logout | Invalidates refresh token server-side |
| POST | /auth/2fa/verify | Body: `{tempToken, codigo}` → returns tokens |
| POST | /auth/2fa/resend | Resend OTP |
| POST | /auth/change-password | Body: `{passwordActual, passwordNuevo}` |

### Token Strategy

- **accessToken**: Stored in Zustand `auth.store.ts` (MEMORY ONLY — NEVER localStorage/sessionStorage)
- **refreshToken**: httpOnly cookie set by API on login response — browser sends automatically
- **tempToken (2FA)**: Short-lived reference token (5 min TTL), not a real JWT

## Technical Decisions to Make

### 1. State Management (Zustand)

| Approach | Pros | Cons |
|----------|------|------|
| Single auth.store.ts | Simple, all auth state in one place | Slightly larger store |
| Separate auth + user stores | Better separation of concerns | More boilerplate |

**Decision**: Follow PRD exactly — single `auth.store.ts` with accessToken, user, permissions.

### 2. Route Protection Mechanism

| Approach | Pros | Cons |
|----------|------|------|
| middleware.ts (Next.js) | Runs on edge, protects all routes | Can't access React state |
| HOC withAuth | Can use React context | Client-side only, slower |
| Layout-based guard | Uses React, customizable | All pages need the layout |

**Decision**: middleware.ts as specified in PRD AUTH-04 (cookie-based verification).

### 3. API Client (ky)

Already specified in PRD:
- Interceptors: beforeRequest (add headers), afterResponse (401 → refresh, normalize errors)
- Refresh queue: pending requests array

### 4. Login Form UI

| Approach | Pros | Cons |
|----------|------|------|
| Radix UI primitives | Accessible, Tailwind v4 compatible | More setup |
| Custom components | Full control | Time-consuming |
| Template components | Fast, consistent with TailAdmin | May not match auth needs |

**Decision**: Use Radix UI primitives directly (no shadcn/ui — incompatible with Tailwind v4).

### 5. 2FA Verification Flow

- Page: `/verificar-2fa?temp={tempToken}`
- Form: 6-digit OTP input
- Resend button: calls POST /auth/2fa/resend

## Dependencies to Install

### Required for Auth (not in package.json)

```
# State management
zustand

# HTTP client
ky

# React Hook Form + Zod
react-hook-form
@hookform/resolvers
zod

# For 2FA (optional — if OTP input needed)
@radix-ui/react-input
@radix-ui/react-form (if available, otherwise custom)
```

### Already in Stack (from PRD)
- @tanstack/react-query (already in template base)
- next-intl (for i18n)
- Radix UI primitives (for accessible components)

### Validation
The PRD says: "React Hook Form v7 + @hookform/resolvers + Zod 3.x"

## Risks and Gotchas

1. **Security**: accessToken MUST NEVER touch localStorage — strict audit needed
2. **Token refresh race**: Multiple parallel 401s must queue and share single refresh
3. **2FA tempToken**: Not a real JWT — just a reference. Must handle expiration (5 min)
4. **Multi-predio**: switchPredio() must invalidate all TanStack Query cache + message SW
5. **Middleware vs client state**: middleware checks cookie, not Zustand — can be out of sync on first load
6. **No email in login response**: Backend doesn't return email — need GET /usuarios/me after login if needed

## UI Components Needed

1. **Login form** (`modules/auth/components/login-form.tsx`)
   - Email input (RFC 5322 validation)
   - Password input (min 8 chars)
   - Submit button
   - Error display (don't reveal which field is wrong)

2. **2FA verification form** (`modules/auth/components/two-factor-form.tsx`)
   - 6-digit OTP input
   - Resend code button
   - Timer countdown (optional)

3. **RBAC components**
   - `Can` component (`modules/auth/components/can.tsx`)
   - `usePermission` hook

4. **Predio selector** (in header)
   - Dropdown with prediosList
   - Single-predio: show as text

## Shared Types Schemas Needed

From PRD Backend auth endpoints:

```typescript
// Login request
interface LoginDto {
  email: string;
  password: string;
}

// Login response (no 2FA)
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  usuario: {
    id: number;
    nombre: string;
    roles: string[];
  };
  predios: Predio[];
}

// Login response (2FA required)
interface Auth2FARequired {
  requires2FA: true;
  tempToken: string;
}

// 2FA verify request
interface TwoFactorVerifyDto {
  tempToken: string;
  codigo: string; // 6-digit OTP
}
```

Note: These should go in `packages/shared-types/src/dtos/auth.dto.ts`

## Recommended Next Phase

**Phase 1: Infrastructure Setup**
1. Install dependencies: zustand, ky, react-hook-form, @hookform/resolvers, zod
2. Create `packages/shared-types/src/dtos/auth.dto.ts`
3. Create `store/auth.store.ts` with accessToken, user, permissions, setAuth(), logout()
4. Create `shared/lib/api-client.ts` with ky + interceptors
5. Create `middleware.ts` for route protection

**Phase 2: Login UI**
1. Create `modules/auth/components/login-form.tsx`
2. Create `modules/auth/hooks/use-login.ts`
3. Create `modules/auth/services/auth.service.ts`
4. Create `app/(auth)/login/page.tsx`

**Phase 3: 2FA (optional, depends on backend)**
1. Create 2FA verification page
2. Handle tempToken expiration

**Phase 4: Post-login**
1. Fetch predios list → populate PredioStore
2. Redirect to dashboard
3. Create logout flow

## Ready for Proposal

Yes. The auth requirements are fully specified in PRDs. Key decisions:
- Zustand for state (no debate)
- middleware.ts for protection (PRD says so)
- httpOnly refreshToken + memory accessToken (PRD says so)
- Radix UI for components (PRD says no shadcn/ui with Tailwind v4)

No blocking decisions — proceed to SDD Spec phase.
