# Tasks: shared-feedback-components

## Task List

### Phase 1 — Test Infrastructure
- [x] **Task 1.1** Set up module-level mocks for `sonner` and `useOnlineStatus`
- [x] **Task 1.2** Verify `vi.resetModules()` prevents MSW pollution in feedback tests

### Phase 2 — Existing Component Tests (TDD)
- [x] **Task 2.1** Write and verify `loading-spinner.test.tsx` (10 tests: variants, sizes, labels)
- [x] **Task 2.2** Write and verify `empty-state.test.tsx` (5 tests: with/without action, icon, CTA)
- [x] **Task 2.3** Write and verify `error-boundary.test.tsx` (5 tests: catch, reset, dev/prod, custom fallback)
- [x] **Task 2.4** Write and verify `offline-banner.test.tsx` (4 tests: online/offline, transitions)
- [x] **Task 2.5** Write and verify `toast-provider.test.tsx` (6 tests: render, methods callable)

### Phase 3 — New Components
- [x] **Task 3.1** Implement `PageSkeleton` + tests (7 tests: defaults, custom lines, animation, className)
- [x] **Task 3.2** Implement `ChartSkeleton` + tests (8 tests: default, custom height, min height, className)
- [x] **Task 3.3** Implement `SyncStatusIndicator` + tests (10 tests: pending, synced, className, large count)
- [x] **Task 3.4** Implement `SyncConflictToast` + tests (8 tests: singular/plural, buttons, callbacks, icon)
- [x] **Task 3.5** Implement `SWUpdateToast` + tests (5 tests: render null, localStorage, dismiss count)

### Phase 4 — Integration
- [x] **Task 4.1** Update `index.ts` barrel export with all new components
- [x] **Task 4.2** Verify zero TypeScript errors across feedback directory
- [x] **Task 4.3** Run full feedback test suite and confirm 68/68 pass

### Phase 5 — Coverage
- [x] **Task 5.1** Verify coverage meets 50% lines / 40% branches minimum per file
- [x] **Task 5.2** Add edge-case tests for dev/prod branches and variant combos if needed

## Verification

- **Tests**: 68 passing (10 test files)
- **TypeScript**: zero errors
- **Lint**: no regressions
- **MSW dependency**: none in feedback tests
- **Barrel export**: all 10 components exported
