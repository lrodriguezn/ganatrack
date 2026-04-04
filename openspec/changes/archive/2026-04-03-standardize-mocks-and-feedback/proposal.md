# Proposal: Standardize Mock Services + Shared Feedback Components

## Intent

Fix inconsistent mock patterns across 11 modules and add shared feedback components (toast, error-boundary, offline-banner) to eliminate silent error failures. The codebase has all mock files but they don't follow a uniform contract — `reportes.mock.ts` doesn't implement its interface, comments lie about defaults, and `reportes.service.ts` inlines `RealReportesService` instead of using a separate `.api.ts` like all other modules.

## Scope

### In Scope
- Fix `MockReportesService` to `implements ReportesService`
- Extract `RealReportesService` from `reportes.service.ts` → `reportes.api.ts`
- Fix wrong comment in `animal.service.ts` ("Default to mock" → actually defaults to real)
- Standardize all 11 `.service.ts` factory comments (some say "Default to mock", others "Default to real")
- Create `apps/web/src/shared/components/feedback/toast-provider.tsx`
- Create `apps/web/src/shared/components/feedback/error-boundary.tsx`
- Create `apps/web/src/shared/components/feedback/offline-banner.tsx`
- Create `apps/web/src/shared/components/feedback/index.ts` barrel export

### Out of Scope
- MSW handler creation (no MSW infrastructure exists — deferred to dedicated change)
- Backend API implementation
- Migration from service-level mocks to MSW
- Unit tests for new components (separate follow-up)

## Capabilities

### New Capabilities
- `shared-feedback-components`: Toast provider (Sonner-based), React error boundary, offline connectivity banner — shared UX layer for error display and user feedback

### Modified Capabilities
- None — mock standardization is a refactor that doesn't change spec-level behavior

## Approach

**Two parallel tracks, no cross-dependency:**

### Track 1: Mock Standardization (11 modules)
Apply per-module in this order:
1. `reportes` — extract `RealReportesService` → `reportes.api.ts`, add `implements ReportesService` to mock
2. `animales` — fix misleading comment in `.service.ts`
3. Remaining 9 modules — align factory comments (all should say "Default to real when env var is not set")

Each module is independent — can be done in parallel.

### Track 2: Feedback Components (shared)
1. `toast-provider.tsx` — wraps Sonner's `<Toaster>`, integrates with existing dark mode toggle
2. `error-boundary.tsx` — React class component with fallback UI, catches render errors
3. `offline-banner.tsx` — listens to `navigator.onLine` + events, shows dismissible banner
4. `index.ts` — barrel export

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `modules/reportes/services/reportes.service.ts` | Modified | Remove inline `RealReportesService`, keep interface + factory only |
| `modules/reportes/services/reportes.api.ts` | New | Extracted real service (standard pattern) |
| `modules/reportes/services/reportes.mock.ts` | Modified | Add `implements ReportesService` |
| `modules/animales/services/animal.service.ts` | Modified | Fix comment on line 68 |
| `modules/*/services/*.service.ts` (9 files) | Modified | Align factory comments |
| `shared/components/feedback/toast-provider.tsx` | New | Sonner wrapper |
| `shared/components/feedback/error-boundary.tsx` | New | Error boundary |
| `shared/components/feedback/offline-banner.tsx` | New | Offline indicator |
| `shared/components/feedback/index.ts` | New | Barrel export |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Extracting `RealReportesService` breaks existing imports | Low | `reportes.service.ts` still exports `reportesService` singleton — internal refactor only |
| Sonner not installed as dependency | Medium | Check `package.json` first; add `sonner` if missing |
| Error boundary conflicts with Next.js error.tsx | Low | Different layers — ours catches render crashes, Next.js handles route errors |

## Rollback Plan

Each module change is a single commit. Revert individual commits per module if issues arise. Feedback components are additive (new files) — delete folder to revert.

## Dependencies

- `sonner` npm package (verify installed, add if missing)
- Existing `@/shared/lib/errors.ts` (ApiError class) — already present

## Success Criteria

- [ ] `MockReportesService implements ReportesService` compiles without errors
- [ ] `reportes.api.ts` exists with extracted `RealReportesService`
- [ ] All 11 `.service.ts` files have consistent "Default to real" comments
- [ ] `shared/components/feedback/` folder exists with 4 files
- [ ] `pnpm type-check` passes with no new errors
