// apps/web/src/shared/components/feedback/offline-banner.tsx
/**
 * OfflineBanner — Shows a warning banner when the browser is offline.
 *
 * Uses the existing `useOnlineStatus` hook.
 * Auto-hides when connection is restored.
 * Non-intrusive: appears at top of screen without blocking interaction.
 *
 * @example
 * // Place at the root of your layout
 * <OfflineBanner />
 */

'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';

export function OfflineBanner(): JSX.Element | null {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-800 shadow-sm dark:bg-amber-950 dark:text-amber-200"
    >
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      <span className="text-center">
        Sin conexión — Los cambios se guardarán cuando vuelva la conexión
      </span>
    </div>
  );
}
