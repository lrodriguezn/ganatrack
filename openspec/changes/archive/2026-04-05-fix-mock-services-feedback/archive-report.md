# Archive Report: Fix Mock Services & Shared Feedback Components

**Change**: fix-mock-services-feedback
**Project**: ganatrack
**Mode**: hybrid
**Date**: 2026-04-05
**Status**: COMPLETED

## Summary

Standardized the mock service layer across frontend modules and added missing shared feedback components (ToastProvider, ErrorBoundary, OfflineBanner) for centralized user feedback UX.

## Artifacts

- ✅ `proposal.md` — Change proposal

> **Note**: Spec, design, and tasks were not formalized — implementation was done directly following the proposal requirements. This archive retrospectively documents the completed work.

## What Was Done

### Batch 1: Mock Service Fixes
- Fixed `MockReportesService implements ReportesService` in `reportes.mock.ts`
- Extracted `RealReportesService` to `reportes.api.ts` (follows animales/predios pattern)
- Updated `reportes.service.ts` to import from `.api.ts` instead of inline class
- Fixed 5 wrong JSDoc comments ("Default to mock" → "Default to real") in:
  - `animales/services/animal.service.ts`
  - `predios/services/predios.service.ts`
  - `configuracion/services/catalogo.service.ts`
  - `maestros/services/maestros.service.ts`
  - `notificaciones/services/notificaciones.service.ts`

### Batch 2: Shared Feedback Components (3 files, 314 lines)

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| ToastProvider | `shared/components/feedback/toast-provider.tsx` | 64 | Toast notification system with `useToast()` hook |
| ErrorBoundary | `shared/components/feedback/error-boundary.tsx` | 144 | React error boundary with fallback UI and error reporting |
| OfflineBanner | `shared/components/feedback/offline-banner.tsx` | 38 | Persistent banner when browser loses connectivity |

### Barrel Export
- Updated `shared/components/feedback/index.ts` with exports for all 4 feedback components

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| N/A | None | This change fixes mock services and adds shared UI feedback components. No domain API specs. |

## Files

```
apps/web/src/shared/components/feedback/
├── toast-provider.tsx   # 64 lines — Toast system + useToast hook
├── error-boundary.tsx   # 144 lines — Error boundary with fallback
├── offline-banner.tsx   # 38 lines — Connectivity banner
├── empty-state.tsx      # 68 lines — Empty state placeholder
└── index.ts             # Barrel export

apps/web/src/modules/reportes/services/
├── reportes.api.ts      # RealReportesService (extracted)
└── reportes.service.ts  # Factory (updated)
```
