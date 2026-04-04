# Delta for Shared Feedback Components

## Purpose

Provide shared UX layer for user feedback: toast notifications, error boundaries, offline detection, empty states. Currently errors fail silently and users get no connectivity feedback.

## ADDED Requirements

### Requirement: Toast Provider

System MUST provide global toast context via `toast-provider.tsx` wrapping the app. Exposes: `success(message)`, `error(message)`, `warning(message)`, `info(message)`. Auto-dismiss after configurable timeout (default 5s). Supports stacking. Position: top-right.

#### Scenario: Show success toast

- GIVEN toast provider mounted
- WHEN `toast.success("Animal creado")` called
- THEN green toast appears top-right, auto-dismisses after 5s

#### Scenario: Multiple toasts stack

- GIVEN no toasts visible
- WHEN three `toast.info()` calls made rapidly
- THEN all three visible simultaneously stacked

#### Scenario: Custom dismiss timeout

- GIVEN toast provider mounted
- WHEN `toast.warning("Expira pronto", { duration: 120000 })` called
- THEN toast remains visible for 120s

### Requirement: Error Boundary

System MUST provide React error boundary via `error-boundary.tsx` catching render errors. Shows fallback UI with error message and "Reintentar" button. Logs to `console.error` in dev, silent in prod. Usable per-module wrapping route groups.

#### Scenario: Catch render error

- GIVEN child component throws during render
- WHEN error boundary wraps that component
- THEN fallback UI displayed with error message

#### Scenario: Retry resets state

- GIVEN fallback UI showing
- WHEN user clicks "Reintentar"
- THEN boundary resets and re-renders children

#### Scenario: Dev vs prod logging

- GIVEN error caught
- WHEN `NODE_ENV === 'development'`
- THEN error logged to `console.error`
- WHEN `NODE_ENV === 'production'`
- THEN no console output

### Requirement: Offline Banner

System MUST provide offline banner via `offline-banner.tsx` detecting connectivity via `navigator.onLine` + `online`/`offline` events. Shows at top of screen when offline. Auto-hides on reconnect. Does NOT block interaction.

#### Scenario: Show on disconnect

- GIVEN user online browsing
- WHEN connection lost (navigator.onLine → false)
- THEN banner appears at top: "Sin conexión a internet"
- AND page remains interactive

#### Scenario: Hide on reconnect

- GIVEN offline banner visible
- WHEN connection restored (navigator.onLine → true)
- THEN banner auto-disappears

#### Scenario: Initial offline state

- GIVEN app loads while offline
- WHEN offline banner mounts
- THEN banner immediately visible

### Requirement: Empty State

System MUST provide reusable empty state component for empty lists/tables. Props: `icon` (ReactNode), `title` (string), `description` (string), `action` (optional ReactNode). Renders centered with friendly design.

#### Scenario: Render with action

- GIVEN empty animal list
- WHEN rendered with icon, title, description, action
- THEN all four elements displayed centered

#### Scenario: Render without action

- GIVEN empty list, no suggested action
- WHEN rendered without `action` prop
- THEN only icon, title, description shown

### Requirement: Barrel Export

All feedback components MUST be re-exported from `shared/components/feedback/index.ts`.

#### Scenario: Import from barrel

- GIVEN component needs toast + boundary
- WHEN `import { ToastProvider, ErrorBoundary } from '@/shared/components/feedback'`
- THEN both available without individual paths

## Component Summary

| Component | File | Status |
|-----------|------|--------|
| Toast Provider | `shared/components/feedback/toast-provider.tsx` | New — Sonner-based |
| Error Boundary | `shared/components/feedback/error-boundary.tsx` | New — React class |
| Offline Banner | `shared/components/feedback/offline-banner.tsx` | New — navigator.onLine |
| Empty State | `shared/components/feedback/empty-state.tsx` | New — Reusable |
| Barrel Export | `shared/components/feedback/index.ts` | New — Re-exports all |
