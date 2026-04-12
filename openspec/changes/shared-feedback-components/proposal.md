# Proposal: Shared Feedback Components — Tests + Missing Components

## Intent

The `shared/components/feedback/` directory contains 6 production components with **ZERO test coverage**. This change adds comprehensive unit tests for all existing components and implements 4 missing components required by the PRD (PageSkeleton, ChartSkeleton, SyncStatusIndicator, SyncConflictToast) with tests from day one.

Without this, the feedback layer is untested and incomplete — any regression in toast, error boundary, or offline banner goes undetected.

## Scope

### In Scope
- Unit tests for all 5 existing components (~23 test cases):
  - `loading-spinner.tsx` (95 lines) — 3 variants (default/inline/fullscreen) × 4 sizes (sm/md/lg/xl) + a11y role="status"
  - `empty-state.tsx` (68 lines) — with/without action, LucideIcon rendering, CTA click handler
  - `error-boundary.tsx` (144 lines) — render error catch, retry reset, dev/prod logging, custom fallback
  - `offline-banner.tsx` (38 lines) — online/offline transitions, initial state, null when online
  - `toast-provider.tsx` (64 lines) — toast.success/error/warning/info helpers, Sonner defaults
- New components with tests:
  - `page-skeleton.tsx` — Suspense fallback for page loads (PRD §11.4)
  - `chart-skeleton.tsx` — ApexCharts loading placeholder (PRD §11.4)
  - `sync-status-indicator.tsx` — pending sync count badge (PRD §14.3)
  - `sync-conflict-toast.tsx` — conflict resolution toast (PRD §14.5)
- Barrel export update (`index.ts`) for new components
- Coverage meets 50% lines / 40% branches minimum per file

### Out of Scope
- MSW integration — feedback tests must NOT depend on network mocking
- E2E tests for feedback components (deferred to Playwright suite)
- Changes to `useOnlineStatus` hook (tested separately if needed)
- Visual regression testing

## Capabilities

### New Capabilities
- `loading-states`: Skeleton components for page and chart loading states
- `sync-feedback`: Sync status indicator and conflict resolution toast

### Modified Capabilities
- `shared-feedback-components`: Add test coverage requirements for all existing components; add LoadingSpinner to barrel export spec

## Approach

1. **Tests first (TDD)** — write failing tests for each existing component, then verify they pass against current implementation
2. **New components** — implement PageSkeleton, ChartSkeleton, SyncStatusIndicator, SyncConflictToast with tests alongside
3. **Mocking strategy** — `vi.mock()` for Sonner (portal), `useOnlineStatus` hook (DOM events), no MSW dependency
4. **ErrorBoundary testing** — use dynamic `import()` for child component that throws during render
5. **Spanish test descriptions** — follow existing project convention

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/shared/components/feedback/__tests__/` | New | Test files for all 5 existing components |
| `apps/web/src/shared/components/feedback/page-skeleton.tsx` | New | Page-level Suspense skeleton |
| `apps/web/src/shared/components/feedback/chart-skeleton.tsx` | New | Chart loading placeholder |
| `apps/web/src/shared/components/feedback/sync-status-indicator.tsx` | New | Pending sync count badge |
| `apps/web/src/shared/components/feedback/sync-conflict-toast.tsx` | New | Sync conflict resolution toast |
| `apps/web/src/shared/components/feedback/__tests__/` | New | Tests for 4 new components |
| `apps/web/src/shared/components/feedback/index.ts` | Modified | Add exports for 4 new components |
| `openspec/specs/shared-feedback-components/spec.md` | Modified | Add LoadingSpinner + new component requirements |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `useOnlineStatus` hook requires DOM events (`online`/`offline`) | Medium | Mock hook return value, test hook separately |
| Sonner renders in portal — hard to assert | Medium | Mock `sonner` module, test `toast` helper object only |
| ErrorBoundary needs child that throws during render | Low | Dynamic `import()` with `vi.doMock()` pattern |
| Coverage thresholds not met for edge cases | Low | Add branch coverage for dev/prod, variant combos |
| MSW interference if tests run in same process | Low | Explicit `vi.resetModules()` per test file, no MSW imports |

## Rollback Plan

1. `git revert` the change commit — all new test files and components are additive
2. If barrel export causes import errors: revert `index.ts` to previous state
3. If new components break existing pages: remove new exports from `index.ts` only, keep tests
4. No database or API changes — zero backend risk

## Dependencies

- `useOnlineStatus` hook at `@/shared/hooks/use-online-status` (existing, untested)
- Sonner library (already installed)
- Vitest + React Testing Library (existing test infra)
- `tailwind-merge` + `lucide-react` (existing deps)

## Success Criteria

- [ ] All 5 existing components have passing unit tests (≥23 test cases)
- [ ] 4 new components implemented with tests from day one
- [ ] Coverage ≥50% lines / ≥40% branches per feedback component file
- [ ] Barrel export includes all 9 components
- [ ] Zero TypeScript errors (`pnpm typecheck` passes)
- [ ] No MSW dependency in any feedback test file
- [ ] All test descriptions in Spanish
