# Proposal: Fix Mock Services & Add Shared Feedback Components

## Intent

Standardize the mock service layer across all 11 frontend modules and add missing shared feedback components. Current state has inconsistencies that cause confusion (wrong comments, missing interface implementations, inline real services) and no centralized error/offline UX — errors fail silently.

## Scope

### In Scope
1. **Fix reportes mock** — add `implements ReportesService` to `MockReportesService`
2. **Extract RealReportesService** — move from inline in `reportes.service.ts` to `reportes.api.ts`
3. **Fix 5 wrong comments** — "Default to mock" → "Default to real" in: animales, predios, configuracion, maestros, notificaciones
4. **Create `ToastProvider`** — shared toast notification system for success/error/warning messages
5. **Create `ErrorBoundary`** — React error boundary with fallback UI and error reporting
6. **Create `OfflineBanner`** — persistent banner when browser loses connectivity (uses existing `useOnlineStatus` hook)

### Out of Scope
- MSW handler layer (separate concern, future change)
- New mock data or seed expansion
- Refactoring mock delay patterns
- Adding mock tests for modules that lack them

## Capabilities

### New Capabilities
- `shared-feedback`: ToastProvider, ErrorBoundary, OfflineBanner — centralized user feedback components

### Modified Capabilities
None — mock fixes are implementation-level, not spec-level changes.

## Approach

**Two batches by concern:**

### Batch 1: Mock Service Fixes (low risk, no behavior change)
- Fix `reportes.mock.ts`: add interface import + `implements ReportesService`
- Create `reportes.api.ts`: extract `RealReportesService` class
- Update `reportes.service.ts`: remove inline class, import from `.api.ts`
- Fix JSDoc comments in 5 `.service.ts` files

### Batch 2: Shared Feedback Components (new code, isolated)
- Create `apps/web/src/shared/components/feedback/toast-provider.tsx`
- Create `apps/web/src/shared/components/feedback/error-boundary.tsx`
- Create `apps/web/src/shared/components/feedback/offline-banner.tsx`
- Wire into `app-providers.tsx`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `modules/reportes/services/reportes.mock.ts` | Modified | Add `implements ReportesService` |
| `modules/reportes/services/reportes.api.ts` | New | Extract RealReportesService |
| `modules/reportes/services/reportes.service.ts` | Modified | Remove inline real service, import from .api.ts |
| `modules/{animales,predios,configuracion,maestros,notificaciones}/services/*.service.ts` | Modified | Fix JSDoc comment |
| `shared/components/feedback/toast-provider.tsx` | New | Toast notification context + hook |
| `shared/components/feedback/error-boundary.tsx` | New | React error boundary component |
| `shared/components/feedback/offline-banner.tsx` | New | Offline connectivity banner |
| `shared/providers/app-providers.tsx` | Modified | Wire ToastProvider + ErrorBoundary |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking reportes imports after extracting .api.ts | Low | Factory uses require(), consumers import from .service.ts unchanged |
| ToastProvider conflicts with existing error handling | Low | Use additive approach — hooks for manual toasts, auto-capture via react-query onError |
| OfflineBanner annoyance on brief disconnects | Medium | Add 3-second debounce before showing banner |

## Rollback Plan

Batch 1: Revert the 6 modified service files — no data migration, no runtime impact.
Batch 2: Remove feedback directory and revert `app-providers.tsx` — components are leaf nodes with no dependents.

## Dependencies

- Existing `useOnlineStatus` hook (already exists in `shared/hooks/`)
- Existing `ApiError` class (already exists in `shared/lib/errors.ts`)
- Existing `queryClient` config (already has `onError` — can wire to toast)

## Success Criteria

- [ ] `MockReportesService implements ReportesService` — TypeScript catches interface violations
- [ ] `reportes.api.ts` exists with `RealReportesService` — follows animales/predios pattern
- [ ] Zero "Default to mock" comments in service files
- [ ] `ToastProvider` renders toasts via `useToast()` hook
- [ ] `ErrorBoundary` catches render errors and shows fallback UI
- [ ] `OfflineBanner` appears after 3s of offline status
