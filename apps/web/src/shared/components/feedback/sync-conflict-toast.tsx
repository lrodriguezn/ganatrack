// apps/web/src/shared/components/feedback/sync-conflict-toast.tsx
/**
 * SyncConflictToast — Warning toast content for sync conflict notifications.
 *
 * Renders as Sonner custom toast content via toast.custom().
 * Shows conflict count with resolve and dismiss action buttons.
 *
 * @example
 * import { toast } from '@/shared/components/feedback';
 * import { SyncConflictToast } from '@/shared/components/feedback/sync-conflict-toast';
 *
 * toast.custom((t) => (
 *   <SyncConflictToast
 *     conflictCount={3}
 *     onResolve={() => { toast.dismiss(t); navigate('/sincronizacion'); }}
 *     onDismiss={() => toast.dismiss(t)}
 *   />
 * ), { duration: 10000 });
 */

'use client';

import { AlertTriangle } from 'lucide-react';

interface SyncConflictToastProps {
  conflictCount: number;
  onResolve: () => void;
  onDismiss: () => void;
}

export function SyncConflictToast({
  conflictCount,
  onResolve,
  onDismiss,
}: SyncConflictToastProps): JSX.Element {
  const label =
    conflictCount === 1
      ? '1 conflicto de sincronización detectado'
      : `${conflictCount} conflictos de sincronización detectados`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Revise los conflictos antes de continuar sincronizando
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onResolve}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        >
          Resolver
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
