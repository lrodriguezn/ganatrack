# Archive Report: standardize-mocks-and-feedback

## Change Summary

**Change**: standardize-mocks-and-feedback
**Date Archived**: 2026-04-03
**Status**: Complete — All 4 phases implemented and verified (5/5 verification passing)

## What Was Done

Standardized mock service patterns across 11 modules and added shared feedback components (toast, error boundary, offline banner, empty state) to eliminate silent error failures in the GanaTrack web application.

### Track 1: Mock Standardization (11 modules)
- Extracted `RealReportesService` from `reportes.service.ts` → `reportes.api.ts` (new file)
- Added `implements ReportesService` to `MockReportesService` + `resetReportesMock()` export
- Fixed misleading "Default to mock" comments in 5 modules (animales, notificaciones, configuracion, maestros, predios) → "Default to real"
- 6 modules already correct (usuarios, auth, imagenes, productos, servicios)

### Track 2: Feedback Components (shared)
- Created `ToastProvider` — Sonner-based toast wrapper (top-right, 5s, rich colors)
- Created `ErrorBoundary` — React class component with fallback UI + "Reintentar" button
- Created `OfflineBanner` — Client component consuming `useOnlineStatus()`, amber banner
- Created `EmptyState` — Reusable centered layout with icon/title/description/action
- Created barrel export `index.ts`

### Track 3: Integration
- Wired `<Toaster />` into root `layout.tsx`
- Wired `<ErrorBoundary>` + `<OfflineBanner>` into `dashboard/layout.tsx`

### Track 4: Verification
- `pnpm typecheck` — zero new TypeScript errors
- `pnpm lint` — no linting regressions
- Grep "Default to mock" across `.service.ts` — 0 matches
- `reportesService` singleton exports unchanged — no consumer breakage

## Impact

| Metric | Value |
|--------|-------|
| New files created | 6 |
| Files modified | 11 |
| New type errors introduced | 0 |
| Modules standardized | 11 |
| Feedback components added | 4 |
| Verification checks passing | 5/5 |

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| mock-services | Created | New main spec from delta (95 lines, 2 added requirements, 1 modified requirement) |
| shared-feedback-components | Created | New main spec from delta (112 lines, 5 added requirements) |

## Archive Contents

- `proposal.md` ✅ — Intent, scope, approach, risks, rollback plan
- `specs/mock-services/spec.md` ✅ — Delta spec for mock standardization
- `specs/shared-feedback-components/spec.md` ✅ — Delta spec for feedback components
- `design.md` ✅ — Architecture decisions, data flow, interfaces, testing strategy
- `tasks.md` ✅ — Implementation task checklist (all phases complete)

## Source of Truth Updated

The following specs now reflect the new behavior:
- `openspec/specs/mock-services/spec.md`
- `openspec/specs/shared-feedback-components/spec.md`

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived.
Ready for the next change.
