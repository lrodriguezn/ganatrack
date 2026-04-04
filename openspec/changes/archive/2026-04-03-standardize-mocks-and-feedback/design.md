# Design: Standardize Mocks & Shared Feedback Components

## Technical Approach

Two independent tracks, no cross-dependency. Track 1 refactors 11 module service files to enforce interface compliance, extract inline classes, and fix misleading comments. Track 2 creates 4 shared feedback components under `shared/components/feedback/`, integrating with existing providers and hooks.

## Architecture Decisions

### Decision: Toast Library — Sonner

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **sonner** | 4KB gzipped, zero-config dark mode via `.dark` class, no context provider needed | ✅ Selected |
| react-hot-toast | 5KB, needs manual dark-mode CSS var wiring | Rejected |
| Custom component | Full control, but reinvents animation/stacking/a11y/timeout | Rejected |

**Rationale**: Sonner's `<Toaster />` auto-detects Tailwind's `.dark` class on `<html>` — our `theme.store.ts` toggles exactly that class via `document.documentElement.classList.toggle('dark', isDark)`. Zero integration cost. API is imperative (`toast.success()`) — no React context needed.

**Action required**: `sonner` is NOT in `package.json`. Must run `pnpm add sonner -w --filter @ganatrack/web`.

### Decision: Error Boundary Placement — Per Route Group

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Per route group** `(dashboard)`, `(auth)` | Catches render crashes per UX context, doesn't mask unrelated failures | ✅ Selected |
| Global in root `layout.tsx` | One crash kills entire app including error UI itself | Rejected |
| Per module (11 boundaries) | Granular but 11 boundaries = maintenance nightmare | Rejected |

**Rationale**: Next.js `error.tsx` handles route-level errors. Our `ErrorBoundary` catches *inter-component render crashes* that `error.tsx` can't reach. Placing it in `dashboard/layout.tsx` wraps all authenticated pages. Auth layout gets its own boundary to isolate login flow crashes from dashboard crashes.

**Placement**: Wrap `<main>` children inside `dashboard/layout.tsx`. Auth layout optional (deferred).

### Decision: Offline Detection — Reuse Existing Hook

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Reuse `useOnlineStatus()`** | Already SSR-safe, event listeners wired, zero new code | ✅ Selected |
| New `useNetworkStatus()` with ping/captive-portal | More robust, but over-engineering for v1 | Rejected |

**Rationale**: `shared/hooks/use-online-status.ts` already implements `navigator.onLine` + `online`/`offline` events + SSR default (`useState(true)`). The `OfflineBanner` just consumes this hook — no new detection logic.

### Decision: Mock Reset Pattern — Standardize `reset*Mock()`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **All mocks export `reset*Mock()`** | Consistent test cleanup, follows `animal.mock.ts` gold standard | ✅ Selected |
| Only reportes (per spec) | Minimal scope, inconsistent across 11 modules | Rejected |
| No reset functions | Tests leak state, causes flaky suite | Rejected |

**Rationale**: `animal.mock.ts` already exports `resetAnimalMock()` (line 399). Reportes must add `resetReportesMock()`. Other 9 modules should audit for reset functions during implementation. This decision establishes the contract now; implementation follows.

## Data Flow

### Track 1 — Service Factory (reportes, BEFORE → AFTER)

```
BEFORE (broken):
  reportes.service.ts
    ├── ReportesService interface (line 30)
    ├── RealReportesService class (line 46) ← INLINE, violates pattern
    └── Factory → createRealService() returns inline class

AFTER (standardized):
  reportes.service.ts
    ├── ReportesService interface
    └── Factory → createRealService() → require('./reportes.api')

  reportes.api.ts (NEW)
    └── RealReportesService implements ReportesService

  reportes.mock.ts
    ├── MockReportesService implements ReportesService ← ADDED
    └── resetReportesMock() ← ADDED
```

### Track 2 — Feedback Components Integration

```
app/layout.tsx (root, server)
  ├── <html class="dark">  ← theme store toggles this
  ├── <body>
  │     ├── <Toaster />     ← Sonner, reads .dark class, renders toasts
  │     ├── <OfflineBanner /> ← consumes useOnlineStatus()
  │     └── <SerwistProvider>
  │           └── <AppProviders>
  │                 └── {children}

app/dashboard/layout.tsx
  └── <AdminLayout>
        └── <ErrorBoundary>   ← catches render crashes
              └── <main>{children}</main>

Component anywhere:
  import { toast } from 'sonner';
  toast.success('Animal creado');  ← direct API, no context
```

## File Changes

### Track 1: Mock Standardization

| File | Action | Description |
|------|--------|-------------|
| `modules/reportes/services/reportes.api.ts` | **Create** | Extract `RealReportesService` class (lines 46-111 from current `.service.ts`) |
| `modules/reportes/services/reportes.service.ts` | **Modify** | Remove inline `RealReportesService`, update `createRealService()` to `require('./reportes.api')` |
| `modules/reportes/services/reportes.mock.ts` | **Modify** | Add `implements ReportesService`, import interface type, export `resetReportesMock()` |
| `modules/animales/services/animal.service.ts` | **Modify** | Fix line 68: "Default to mock" → "Default to real" |
| `modules/notificaciones/services/notificaciones.service.ts` | **Modify** | Fix line 67 comment |
| `modules/configuracion/services/catalogo.service.ts` | **Modify** | Fix line 44 comment |
| `modules/maestros/services/maestros.service.ts` | **Modify** | Fix line 42 comment |
| `modules/predios/services/predios.service.ts` | **Modify** | Fix line 90 comment |

### Track 2: Feedback Components

| File | Action | Description |
|------|--------|-------------|
| `shared/components/feedback/toast-provider.tsx` | **Create** | Renders `<Toaster position="top-right" duration={5000} richColors closeButton />` |
| `shared/components/feedback/error-boundary.tsx` | **Create** | React class component: `getDerivedStateFromError`, fallback UI + "Reintentar" button, `console.error` in dev only |
| `shared/components/feedback/offline-banner.tsx` | **Create** | Client component consuming `useOnlineStatus()`, sticky amber banner, non-blocking |
| `shared/components/feedback/empty-state.tsx` | **Create** | Centered layout: `icon`, `title`, `description`, optional `action` slot |
| `shared/components/feedback/index.ts` | **Create** | Barrel export for all 4 components |
| `app/layout.tsx` | **Modify** | Add `<Toaster />` from sonner inside `<body>`, above `<SerwistProvider>` |
| `app/dashboard/layout.tsx` | **Modify** | Wrap `<main>` with `<ErrorBoundary>`, add `<OfflineBanner />` inside `<AdminLayout>` |
| `package.json` | **Modify** | Add `sonner` runtime dependency |

## Interfaces / Contracts

```tsx
// toast-provider.tsx — thin wrapper, NOT a context
import { Toaster } from 'sonner';
export function ToastProvider() {
  return <Toaster position="top-right" duration={5000} richColors closeButton />;
}
// Consumers import directly: import { toast } from 'sonner';
```

```tsx
// error-boundary.tsx — React class component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // optional custom fallback
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
// Methods: getDerivedStateFromError, componentDidCatch, handleRetry
// Default fallback: error message + "Reintentar" button
// Logging: console.error in dev, silent in prod
```

```tsx
// offline-banner.tsx — self-contained, no props
function OfflineBanner(): JSX.Element | null;
// Internally: const isOnline = useOnlineStatus();
// Renders: fixed top banner "Sin conexión a internet" (amber bg)
// Visibility: shows when !isOnline, auto-hides on reconnect
```

```tsx
// empty-state.tsx — reusable empty list state
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `MockReportesService implements ReportesService` | `pnpm typecheck` — zero interface errors |
| Unit | `resetReportesMock()` restores seed data | Mutate mock → reset → verify original state |
| Unit | All 11 factory comments accurate | Grep for "Default to mock" → expect 0 matches |
| Integration | `<ErrorBoundary>` catches render throws | Throw in child → assert fallback UI with "Reintentar" |
| Integration | `<OfflineBanner>` toggle | Mock `navigator.onLine` events → assert banner visibility |
| Integration | Sonner dark mode | Toggle `useThemeStore` → assert toast has dark styles |
| Build | No regressions | `pnpm typecheck && pnpm lint` |

## Migration / Rollout

**No breaking changes.** All modifications are internal refactors or additive:

1. **Mock track**: `reportesService` singleton API unchanged. Consumers import from same path. Factory dynamically requires `./reportes.api` instead of inline class.
2. **Feedback track**: New files only. `<Toaster />` is invisible until `toast()` is called. `<ErrorBoundary>` wraps existing children without prop changes. `<OfflineBanner />` auto-manages visibility.
3. **Dependency**: `pnpm add sonner -w --filter @ganatrack/web` before building.
4. **Verification**: `pnpm typecheck && pnpm lint` must pass.

**Rollback**: Each module change is independently revertable. Feedback components are additive — delete folder to revert. Sonner can be uninstalled.

## Open Questions

- [ ] Should `<OfflineBanner />` also appear in `(auth)/layout.tsx`? (Recommend: dashboard only — auth pages have less data dependency)
- [ ] Should `error-boundary.tsx` also fire `toast.error()` on catch? (Recommend: yes — dual feedback: fallback UI + toast notification)
- [ ] Should `resetReportesMock()` reset delays too, or just data state? (Recommend: data only — delays are stateless)
