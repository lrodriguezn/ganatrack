# Delta for Shared Feedback Components

## ADDED Requirements

### Requirement: Test Coverage

All feedback components MUST have unit tests with minimum 80% branch coverage. Tests MUST NOT depend on MSW. External dependencies (Sonner, useOnlineStatus) MUST be mocked. Each component's test file MUST co-locate in `__tests__/` directory adjacent to the component.

#### Scenario: LoadingSpinner test suite

- GIVEN loading-spinner.tsx has zero coverage
- WHEN test suite runs
- THEN all 12 variant combinations pass (3 variants × 4 sizes)
- AND default variant renders without crashing
- AND inline variant has reduced padding
- AND fullscreen variant covers viewport

#### Scenario: EmptyState test suite

- GIVEN empty-state.tsx has zero coverage
- WHEN test suite runs
- THEN rendering with all props (icon, title, description, action) passes
- AND rendering without action prop passes
- AND icon is visible in the document

#### Scenario: ErrorBoundary test suite

- GIVEN error-boundary.tsx has zero coverage
- WHEN test suite runs
- THEN catching a child render error displays fallback UI
- AND clicking "Reintentar" resets the boundary
- AND error is logged to console.error in dev mode

#### Scenario: OfflineBanner test suite

- GIVEN offline-banner.tsx has zero coverage
- WHEN test suite runs
- THEN banner is visible when navigator.onLine is false
- AND banner is hidden when navigator.onLine is true
- AND banner appears on online→offline event transition

#### Scenario: ToastProvider test suite

- GIVEN toast-provider.tsx has zero coverage
- WHEN test suite runs
- THEN Sonner Toaster component is rendered
- AND toast context methods (success, error, warning, info) are callable
- AND Sonner is mocked (no real toast side effects)

### Requirement: Barrel Export Update

The `shared/components/feedback/index.ts` barrel export MUST include the four new components: PageSkeleton, ChartSkeleton, SyncStatusIndicator, SyncConflictToast.

#### Scenario: Import new components from barrel

- GIVEN barrel export updated
- WHEN `import { PageSkeleton, ChartSkeleton, SyncStatusIndicator, SyncConflictToast } from '@/shared/components/feedback'`
- THEN all four components are available

## MODIFIED Requirements

### Requirement: Barrel Export

All feedback components MUST be re-exported from `shared/components/feedback/index.ts`, including both existing components (LoadingSpinner, EmptyState, ErrorBoundary, OfflineBanner, ToastProvider) and new components (PageSkeleton, ChartSkeleton, SyncStatusIndicator, SyncConflictToast).

(Previously: Only 5 existing components were exported)

#### Scenario: Import from barrel

- GIVEN component needs toast + boundary
- WHEN `import { ToastProvider, ErrorBoundary } from '@/shared/components/feedback'`
- THEN both available without individual paths

#### Scenario: Import all components

- GIVEN barrel export includes all 9 components
- WHEN importing all from barrel path
- THEN all 9 components are resolvable
