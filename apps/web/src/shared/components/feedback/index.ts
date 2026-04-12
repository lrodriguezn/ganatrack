// apps/web/src/shared/components/feedback/index.ts
/**
 * Feedback components barrel export.
 *
 * Shared UI components for user feedback:
 * - ToastProvider + toast: notification system (Sonner)
 * - ErrorBoundary: render error catcher with fallback UI
 * - OfflineBanner: connectivity warning banner
 * - EmptyState: reusable empty list/table placeholder
 * - LoadingSpinner: animated spinner for async operations
 * - PageSkeleton: page layout loading skeleton
 * - ChartSkeleton: chart container loading skeleton
 * - SyncStatusIndicator: pending sync count badge
 * - SyncConflictToast: sync conflict warning toast
 */

export { ToastProvider, toast } from './toast-provider';
export { ErrorBoundary } from './error-boundary';
export { OfflineBanner } from './offline-banner';
export { EmptyState } from './empty-state';
export { LoadingSpinner } from './loading-spinner';
export { PageSkeleton } from './page-skeleton';
export { ChartSkeleton } from './chart-skeleton';
export { SyncStatusIndicator } from './sync-status-indicator';
export { SyncConflictToast } from './sync-conflict-toast';
