# Spec: shared-feedback-components

## Overview

This change adds comprehensive unit tests for all existing feedback components and implements 4 missing components (PageSkeleton, ChartSkeleton, SyncStatusIndicator, SyncConflictToast) with tests from day one. It also adds the SWUpdateToast component for PWA service-worker update notifications.

## Delta Specs

| Domain | Path | Description |
|--------|------|-------------|
| loading-states | `specs/loading-states/spec.md` | PageSkeleton and ChartSkeleton requirements |
| shared-feedback-components | `specs/shared-feedback-components/spec.md` | Test coverage and barrel export requirements |
| sync-feedback | `specs/sync-feedback/spec.md` | SyncStatusIndicator and SyncConflictToast requirements |

## Requirements Summary

### Added Requirements

1. **Test Coverage** — All feedback components MUST have unit tests with minimum 80% branch coverage. Tests MUST NOT depend on MSW. External dependencies (Sonner, useOnlineStatus) MUST be mocked.
2. **Loading States** — PageSkeleton and ChartSkeleton components for page and chart loading placeholders.
3. **Sync Feedback** — SyncStatusIndicator (pending count badge) and SyncConflictToast (conflict resolution UI).
4. **Barrel Export** — `shared/components/feedback/index.ts` MUST export all 10 feedback components.
5. **PWA Update Toast** — SWUpdateToast for service-worker update notifications.

### Modified Requirements

- `shared-feedback-components` main spec updated to include LoadingSpinner and new component requirements.

## Scenarios

### Scenario: All feedback component tests pass
- GIVEN all 10 test files in `__tests__/`
- WHEN `pnpm vitest run src/shared/components/feedback/` executes
- THEN 68 tests pass with 0 failures

### Scenario: No MSW dependency in feedback tests
- GIVEN feedback test files
- WHEN grepping for `msw` imports
- THEN 0 matches (all external deps mocked at module boundary)

### Scenario: Barrel export includes all components
- GIVEN `index.ts`
- WHEN importing any feedback component from barrel
- THEN all 10 components are resolvable

## Acceptance Criteria

- [x] All existing components have passing unit tests (≥23 test cases)
- [x] 4 new components implemented with tests from day one (later extended to 5 with SWUpdateToast)
- [x] Coverage ≥50% lines / ≥40% branches per feedback component file
- [x] Barrel export includes all 10 components
- [x] Zero TypeScript errors (`pnpm typecheck` passes)
- [x] No MSW dependency in any feedback test file
- [x] All test descriptions in Spanish
