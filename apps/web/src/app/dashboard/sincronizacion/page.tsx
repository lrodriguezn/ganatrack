// apps/web/src/app/dashboard/sincronizacion/page.tsx
/**
 * SincronizacionPage — sync status and conflict resolution page.
 *
 * Shows:
 * - Sync status summary
 * - Conflict queue with resolution UI
 * - Failed sync queue with retry/discard actions
 */

'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useFailedSync } from '@/shared/hooks/use-failed-sync';
import { discardItem, retryItem, resolveConflict } from '@/shared/hooks/use-sync-actions';
import { SyncQueueList } from './components/sync-queue-list';
import { ConflictResolver } from './components/conflict-resolver';
import type { ISyncQueueItem } from './components/sync-queue-list';

export default function SincronizacionPage() {
  const { failedItems, conflictItems, failedCount, conflictCount, refetch } = useFailedSync();
  const [resolvingItem, setResolvingItem] = useState<ISyncQueueItem | null>(null);

  const total = failedCount + conflictCount;

  const handleDiscard = async (url: string) => {
    await discardItem(url);
    await refetch();
  };

  const handleRetry = async (url: string) => {
    const item = failedItems.find((i) => i.url === url);
    if (item) {
      await retryItem(item);
      await refetch();
    }
  };

  const handleConflictDiscard = async (url: string) => {
    await discardItem(url);
    await refetch();
  };

  const handleResolve = async (url: string, keepLocal: boolean) => {
    const item = conflictItems.find((i) => i.url === url);
    if (item) {
      await resolveConflict(item, keepLocal);
      await refetch();
      setResolvingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sincronización</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gestiona los cambios pendientes de sincronizar
        </p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-lg font-medium">Todo sincronizado</h2>
          <p className="text-gray-500">No hay cambios pendientes</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 dark:text-amber-200">
              Hay {total} cambio{total !== 1 ? 's' : ''} que requiere{total === 1 ? '' : 'n'} tu atención
            </span>
            <button
              onClick={() => { void refetch(); }}
              className="ml-auto rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900"
              aria-label="Refrescar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {conflictCount > 0 && (
            <SyncQueueList
              items={conflictItems}
              type="conflict"
              onDiscard={handleConflictDiscard}
              onResolve={(url, keepLocal) => { void handleResolve(url, keepLocal); }}
            />
          )}

          {failedCount > 0 && (
            <SyncQueueList
              items={failedItems}
              type="failed"
              onDiscard={handleDiscard}
              onRetry={handleRetry}
            />
          )}
        </>
      )}

      {resolvingItem && (
        <ConflictResolver
          item={resolvingItem}
          serverData={(() => {
            try {
              return resolvingItem.reason ? JSON.parse(resolvingItem.reason) as Record<string, unknown> : {};
            } catch {
              return {};
            }
          })()}
          onKeepLocal={() => { void handleResolve(resolvingItem.url, true); }}
          onAcceptServer={() => { void handleResolve(resolvingItem.url, false); }}
          onClose={() => setResolvingItem(null)}
        />
      )}
    </div>
  );
}
