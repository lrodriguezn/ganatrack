# Technical Design: shared-feedback-components

## Architecture Decisions

### AD-1: Compose from existing Skeleton atom, not from scratch
**Decision**: `PageSkeleton` and `ChartSkeleton` compose the existing `Skeleton` atom from `@/shared/components/ui/skeleton`, rather than creating new skeleton primitives.
**Rationale**: The `Skeleton` atom already provides `variant` (rectangular/circular/text) and `animation` (pulse/wave) with proper `twMerge` integration. Reusing it avoids duplication and maintains visual consistency across the app. The shimmer animation (`animate-shimmer`) is already defined in the atom and reused by both new components.
**Alternatives considered**:
- Build standalone skeleton components with inline styles — rejected: duplicates existing atom logic
- Create a new `skeleton-group` compound component — rejected: over-engineering for only 2 consumers

### AD-2: SyncStatusIndicator uses inline badge pattern, not the existing Badge atom
**Decision**: `SyncStatusIndicator` is a standalone component that composes `Sync` and `CheckCircle` icons from lucide-react with inline count text, rather than composing the existing `Badge` atom.
**Rationale**: The existing `Badge` atom is designed as an absolutely-positioned notification dot (`absolute -top-1 -right-1 rounded-full`), suitable for overlaying on icons. The `SyncStatusIndicator` needs to be a standalone inline element with icon + text + color states (warning/success). Composing the Badge atom would require fighting its positioning styles via className overrides.
**Alternatives considered**:
- Extend Badge with a new `variant="inline"` prop — rejected: changes the atom's contract and breaks existing consumers
- Use the Badge atom with heavy className overrides — rejected: fragile, defeats the purpose of the atom

### AD-3: SyncConflictToast uses Sonner's `toast.custom()` directly, not a wrapper
**Decision**: `SyncConflictToast` is a React component that renders the toast UI, and a separate `showSyncConflictToast(count, actions)` function triggers it via `toast.custom()`. The component itself is NOT a toast trigger — it's purely the toast content.
**Rationale**: This follows the existing pattern in `toast-provider.tsx` where `toast` is a helper object and the provider renders the Toaster. Separating the UI component from the trigger function allows: (1) testing the component in isolation, (2) reusing the toast content in different contexts, (3) keeping the `toast` helper API clean. The `duration: Infinity` and `closeButton: false` options enforce the spec's "no auto-dismiss" requirement.
**Alternatives considered**:
- Make SyncConflictToast self-triggering on mount — rejected: harder to test, side-effect on render
- Add a new `toast.conflict()` method to the toast helper — rejected: too domain-specific for a generic helper

### AD-4: Test mocking strategy — mock at module boundary, not implementation
**Decision**: External dependencies (`sonner`, `useOnlineStatus`) are mocked with `vi.mock()` at the module level. Sonner is mocked to prevent portal rendering side effects. `useOnlineStatus` is mocked to return controlled boolean values. No MSW is used in feedback tests — `vi.resetModules()` is called per file to prevent handler pollution from the global setup.
**Rationale**: The global `setup.ts` starts an MSW server. Feedback tests should not depend on network mocking since they test UI feedback, not API integration. Module-level mocks are the Vitest-recommended approach and match the existing pattern in `conflict-resolver.test.tsx`.
**Alternatives considered**:
- Use MSW handlers for toast tests — rejected: unnecessary, toast doesn't make HTTP calls
- Mock `navigator.onLine` directly — rejected: fragile across test runners, `useOnlineStatus` mock is cleaner

### AD-5: ErrorBoundary testing via dynamic import with throwing child
**Decision**: ErrorBoundary tests use a dynamically imported child component that throws during render, wrapped in `act()` from RTL. The error is caught and the fallback UI is asserted.
**Rationale**: This is the standard RTL pattern for testing error boundaries. The existing `conflict-resolver.test.tsx` already uses dynamic `import()` patterns, confirming this is the project's established approach.
**Alternatives considered**:
- Use `vi.spyOn` to make a component throw — rejected: doesn't simulate actual render errors
- Test ErrorBoundary class methods directly — rejected: tests implementation, not behavior

## Component Designs

### PageSkeleton

```typescript
// apps/web/src/shared/components/feedback/page-skeleton.tsx
'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { twMerge } from 'tailwind-merge';

interface PageSkeletonProps {
  /** Number of content lines below the header. Default: 5 */
  lines?: number;
  /** Whether to show the header skeleton (title + subtitle bars). Default: true */
  showHeader?: boolean;
  /** Additional Tailwind classes for the root container */
  className?: string;
}

/**
 * Pre-defined width percentages for content lines to simulate natural content flow.
 * Cycles through the array for lines beyond the preset count.
 */
const LINE_WIDTHS = ['100%', '85%', '75%', '90%', '70%'] as const;

function PageSkeleton({
  lines = 5,
  showHeader = true,
  className,
}: PageSkeletonProps): JSX.Element {
  return (
    <div className={twMerge('flex flex-col gap-4 p-6', className)}>
      {showHeader && (
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" animation="wave" className="h-7 w-3/5" />
          <Skeleton variant="text" animation="wave" className="h-4 w-2/5" />
        </div>
      )}
      <div className="flex flex-col gap-3">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            variant="text"
            animation="wave"
            className={`h-4`}
            style={{ width: LINE_WIDTHS[i % LINE_WIDTHS.length] }}
          />
        ))}
      </div>
    </div>
  );
}

export { PageSkeleton };
```

**Implementation notes**:
- Uses `Skeleton` atom with `variant="text"` and `animation="wave"` for shimmer effect
- `LINE_WIDTHS` array provides natural-looking content variation (70-100%)
- Header consists of two bars: title (larger, 60% width) and subtitle (smaller, 40% width)
- Root container uses `flex flex-col gap-4` for spacing consistency with other feedback components
- `aria-hidden` is inherited from the Skeleton atom

### ChartSkeleton

```typescript
// apps/web/src/shared/components/feedback/chart-skeleton.tsx
'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { twMerge } from 'tailwind-merge';

interface ChartSkeletonProps {
  /** Height of the chart placeholder in pixels. Default: 300, minimum: 50 */
  height?: number;
  /** Additional Tailwind classes for the root container */
  className?: string;
}

const MIN_HEIGHT = 50;

function ChartSkeleton({
  height = 300,
  className,
}: ChartSkeletonProps): JSX.Element {
  const effectiveHeight = Math.max(height, MIN_HEIGHT);

  return (
    <div
      className={twMerge('w-full rounded-lg border border-gray-200 p-4 dark:border-gray-700', className)}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
        className="w-full"
        style={{ height: `${effectiveHeight}px` }}
      />
    </div>
  );
}

export { ChartSkeleton, MIN_HEIGHT as CHART_SKELETON_MIN_HEIGHT };
```

**Implementation notes**:
- Wraps the Skeleton in a bordered container to match ApexCharts card styling
- `MIN_HEIGHT = 50` enforces the spec's minimum visible height requirement
- The border and padding mimic the chart card container used in dashboard pages
- Exports `MIN_HEIGHT` constant for test assertions

### SyncStatusIndicator

```typescript
// apps/web/src/shared/components/feedback/sync-status-indicator.tsx
'use client';

import { Sync, CheckCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SyncStatusIndicatorProps {
  /** Number of pending sync items. 0 = fully synced */
  pendingCount: number;
  /** Additional Tailwind classes for the root container */
  className?: string;
}

function SyncStatusIndicator({
  pendingCount,
  className,
}: SyncStatusIndicatorProps): JSX.Element {
  const isPending = pendingCount > 0;

  return (
    <div
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        isPending
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
          : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={
        isPending
          ? `${pendingCount} cambios pendientes de sincronización`
          : 'Todo sincronizado'
      }
    >
      {isPending ? (
        <Sync className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>{isPending ? pendingCount : 'Todo sincronizado'}</span>
    </div>
  );
}

export { SyncStatusIndicator };
```

**Implementation notes**:
- Uses `role="status"` + `aria-live="polite"` for screen reader announcements on state changes
- Sync icon uses `animate-spin` (Tailwind built-in) for the rotation animation
- Color scheme: amber for pending (matches `OfflineBanner` warning pattern), green for synced
- Badge-style pill shape (`rounded-full`) for visual consistency with notification patterns
- No truncation of count — full number always displayed per spec

### SyncConflictToast

```typescript
// apps/web/src/shared/components/feedback/sync-conflict-toast.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { toast } from '@/shared/components/feedback/toast-provider';

interface SyncConflictToastProps {
  /** Number of conflicting items */
  count: number;
  /** Callback when user clicks "Descartar todo" */
  onDiscardAll: () => void;
  /** Callback when user clicks "Resolver todo" */
  onResolveAll: () => void;
}

/**
 * Returns the correct singular/plural message for conflict count.
 */
function getConflictMessage(count: number): string {
  return count === 1
    ? '1 conflicto de sincronización detectado'
    : `${count} conflictos de sincronización detectados`;
}

/**
 * The toast content component — renders the conflict warning UI.
 * This is NOT a self-triggering toast; use `showSyncConflictToast()` to display it.
 */
function SyncConflictToast({
  count,
  onDiscardAll,
  onResolveAll,
}: SyncConflictToastProps): JSX.Element | null {
  if (count === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getConflictMessage(count)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Revise cada conflicto y decida qué versión mantener
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDiscardAll}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Descartar todo
        </button>
        <button
          type="button"
          onClick={onResolveAll}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
        >
          Resolver todo
        </button>
      </div>
    </div>
  );
}

/**
 * Shows a sync conflict toast that does NOT auto-dismiss.
 * Returns the Sonner toast ID for programmatic dismissal.
 */
function showSyncConflictToast(
  count: number,
  actions: { onDiscardAll: () => void; onResolveAll: () => void },
): string | number {
  return toast.custom(
    (t) => (
      <SyncConflictToast
        count={count}
        onDiscardAll={() => {
          actions.onDiscardAll();
          toast.custom.dismiss(t);
        }}
        onResolveAll={() => {
          actions.onResolveAll();
          toast.custom.dismiss(t);
        }}
      />
    ),
    {
      duration: Infinity,
      closeButton: false,
    },
  );
}

export { SyncConflictToast, showSyncConflictToast };
```

**Implementation notes**:
- Returns `null` when `count === 0` per spec edge case requirement
- `getConflictMessage()` handles singular/plural Spanish grammar
- `showSyncConflictToast()` is the trigger function — uses `toast.custom()` from the existing `toast` helper
- `duration: Infinity` + `closeButton: false` enforces no auto-dismiss
- Dismisses itself after either action button is clicked
- Warning color scheme (amber) matches `OfflineBanner` pattern

## Test Strategy

### Mocking Approach

| Dependency | Mock Strategy | Reason |
|---|---|---|
| `sonner` | `vi.mock('sonner', () => ({ Toaster: () => null, toast: { custom: vi.fn() } }))` | Prevents portal rendering, isolates toast helper tests |
| `useOnlineStatus` | `vi.mock('@/shared/hooks/use-online-status', () => ({ useOnlineStatus: vi.fn() }))` | Controls online/offline state without DOM events |
| `next/navigation` | `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }))` | Same pattern as existing `conflict-resolver.test.tsx` |
| MSW | `vi.resetModules()` per test file | Prevents handler pollution from global `setup.ts` |

### Test Structure per Component

```
apps/web/src/shared/components/feedback/__tests__/
├── loading-spinner.test.tsx       # 12+ tests: 3 variants × 4 sizes + a11y
├── empty-state.test.tsx           # 4 tests: with/without action, icon visibility
├── error-boundary.test.tsx        # 5 tests: error catch, reset, dev/prod, custom fallback
├── offline-banner.test.tsx        # 4 tests: online/offline, transitions
├── toast-provider.test.tsx        # 4 tests: Toaster render, toast methods callable
├── page-skeleton.test.tsx         # 5 tests: default, custom lines, hide header, className, zero lines
├── chart-skeleton.test.tsx        # 4 tests: default, custom height, className, min height
├── sync-status-indicator.test.tsx # 4 tests: pending, synced, className, large count
└── sync-conflict-toast.test.tsx   # 6 tests: display, discard, resolve, no auto-dismiss, singular, zero
```

### Coverage Targets

| File | Lines | Branches | Notes |
|---|---|---|---|
| `loading-spinner.tsx` | ≥80% | ≥80% | All variant×size combos, a11y role |
| `empty-state.tsx` | ≥80% | ≥80% | With/without action |
| `error-boundary.tsx` | ≥70% | ≥70% | Dev/prod branches, custom fallback |
| `offline-banner.tsx` | ≥90% | ≥80% | Online/offline branches |
| `toast-provider.tsx` | ≥80% | ≥60% | Toaster render, toast object methods |
| `page-skeleton.tsx` | ≥90% | ≥80% | All prop combos |
| `chart-skeleton.tsx` | ≥90% | ≥80% | Min height enforcement |
| `sync-status-indicator.tsx` | ≥90% | ≥80% | Pending/synced branches |
| `sync-conflict-toast.tsx` | ≥90% | ≥90% | Actions, singular/plural, zero count |

### Test Pattern Example (LoadingSpinner)

```typescript
describe('LoadingSpinner', () => {
  it('debería renderizar el spinner por defecto con tamaño md', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('[aria-label="Cargando"]');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('role', 'status');
  });

  it('debería renderizar variante inline sin contenedor', () => {
    render(<LoadingSpinner variant="inline" />);
    expect(document.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it('debería renderizar variante fullscreen con overlay', () => {
    render(<LoadingSpinner variant="fullscreen" />);
    const overlay = document.querySelector('[role="status"]');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
  });

  // ... size variants: sm, md, lg, xl
  // ... label rendering
});
```

### ErrorBoundary Testing Pattern

```typescript
// Dynamic import of a child that throws
function ThrowingChild() {
  throw new Error('Error de prueba');
}

describe('ErrorBoundary', () => {
  it('debería mostrar fallback cuando un hijo lanza error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('debería llamar a onReset al hacer click en Reintentar', async () => {
    const onReset = vi.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
```

## Implementation Order

1. **Test mocks setup** — Create mock files for `sonner` and `useOnlineStatus` in `__tests__/` or as inline `vi.mock()` calls. This unblocks all subsequent test writing.

2. **Existing component tests (TDD)** — Write failing tests for `loading-spinner`, `empty-state`, `error-boundary`, `offline-banner`, `toast-provider`. Verify they fail, then confirm they pass against current implementations. This validates the test infrastructure before building new components.

3. **PageSkeleton + tests** — Implement alongside tests. Depends on: existing `Skeleton` atom (already exists). Simplest new component — pure composition.

4. **ChartSkeleton + tests** — Implement alongside tests. Depends on: existing `Skeleton` atom. Similar complexity to PageSkeleton.

5. **SyncStatusIndicator + tests** — Implement alongside tests. Depends on: `lucide-react` icons (already installed). Introduces conditional rendering (pending vs synced states).

6. **SyncConflictToast + tests** — Implement alongside tests. Depends on: existing `toast` helper from `toast-provider.tsx`. Most complex — requires testing both the component and the `showSyncConflictToast()` trigger function.

7. **Barrel export update** — Update `index.ts` with all 4 new exports. Verify all imports resolve.

8. **Coverage verification** — Run `pnpm vitest --coverage` and verify all files meet the 80% branch threshold. Add missing edge case tests if needed.

**Rationale for order**: Infrastructure first (mocks), then validate existing code (TDD on existing), then build new components from simplest to most complex. This ensures each step has a green test suite before proceeding.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/shared/components/feedback/page-skeleton.tsx` | Create | Page-level Suspense skeleton composing Skeleton atom |
| `apps/web/src/shared/components/feedback/chart-skeleton.tsx` | Create | Chart loading placeholder with min height enforcement |
| `apps/web/src/shared/components/feedback/sync-status-indicator.tsx` | Create | Pending sync count badge with animated icon |
| `apps/web/src/shared/components/feedback/sync-conflict-toast.tsx` | Create | Conflict resolution toast content + trigger function |
| `apps/web/src/shared/components/feedback/index.ts` | Modify | Add exports for 4 new components |
| `apps/web/src/shared/components/feedback/__tests__/loading-spinner.test.tsx` | Create | Tests for LoadingSpinner (12+ cases) |
| `apps/web/src/shared/components/feedback/__tests__/empty-state.test.tsx` | Create | Tests for EmptyState (4 cases) |
| `apps/web/src/shared/components/feedback/__tests__/error-boundary.test.tsx` | Create | Tests for ErrorBoundary (5 cases) |
| `apps/web/src/shared/components/feedback/__tests__/offline-banner.test.tsx` | Create | Tests for OfflineBanner (4 cases) |
| `apps/web/src/shared/components/feedback/__tests__/toast-provider.test.tsx` | Create | Tests for ToastProvider (4 cases) |
| `apps/web/src/shared/components/feedback/__tests__/page-skeleton.test.tsx` | Create | Tests for PageSkeleton (5 cases) |
| `apps/web/src/shared/components/feedback/__tests__/chart-skeleton.test.tsx` | Create | Tests for ChartSkeleton (4 cases) |
| `apps/web/src/shared/components/feedback/__tests__/sync-status-indicator.test.tsx` | Create | Tests for SyncStatusIndicator (4 cases) |
| `apps/web/src/shared/components/feedback/__tests__/sync-conflict-toast.test.tsx` | Create | Tests for SyncConflictToast (6 cases) |

**Total**: 4 new component files, 8 new test files, 1 modified file = 13 files.
