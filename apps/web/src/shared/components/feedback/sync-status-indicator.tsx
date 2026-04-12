// apps/web/src/shared/components/feedback/sync-status-indicator.tsx
/**
 * SyncStatusIndicator — Badge showing pending synchronization count.
 *
 * Displays an amber warning badge with the number of pending sync operations.
 * Returns null when count is 0 (nothing to show).
 *
 * Used in header/navbar contexts to indicate offline queue status.
 *
 * @example
 * <SyncStatusIndicator pendingCount={5} />
 * <SyncStatusIndicator pendingCount={150} max={99} />
 */

'use client';

import { twMerge } from 'tailwind-merge';

interface SyncStatusIndicatorProps {
  pendingCount: number;
  max?: number;
  className?: string;
}

const DEFAULT_MAX = 99;

export function SyncStatusIndicator({
  pendingCount,
  max = DEFAULT_MAX,
  className,
}: SyncStatusIndicatorProps): JSX.Element | null {
  if (pendingCount === 0) {
    return null;
  }

  const displayCount = pendingCount > max ? `${max}+` : pendingCount.toString();

  return (
    <span
      role="status"
      aria-label={`${pendingCount} cambios pendientes de sincronización`}
      className={twMerge(
        'inline-flex items-center justify-center rounded-full',
        'bg-amber-500 text-white text-[10px] font-bold',
        'px-1.5 min-w-[1.25rem] h-5',
        className,
      )}
    >
      {displayCount}
    </span>
  );
}
