// apps/web/src/shared/hooks/use-failed-sync.ts
/**
 * useFailedSync — reads failed/conflict queues from IndexedDB using idb-keyval.
 *
 * Returns count, items, and a refetch function for UI display.
 *
 * @example
 * const { failedCount, conflictCount, failedItems, conflictItems, refetch } = useFailedSync();
 *
 * @returns FailedSyncState with failed/conflict counts, items arrays, and refetch function
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { get } from 'idb-keyval';

/**
 * Validated sync queue item from IndexedDB.
 */
interface SyncQueueItem {
  url: string;
  method: string;
  body?: string;
  timestamp: number;
  reason?: string;
  error?: string;
  status?: number;
}

/**
 * State returned by useFailedSync hook.
 */
interface FailedSyncState {
  failedCount: number;
  conflictCount: number;
  failedItems: SyncQueueItem[];
  conflictItems: SyncQueueItem[];
  refetch: () => Promise<void>;
}

const initialState: FailedSyncState = {
  failedCount: 0,
  conflictCount: 0,
  failedItems: [],
  conflictItems: [],
  refetch: async () => { /* no-op for initial state */ },
};

/**
 * Type guard: validates that an unknown value is a SyncQueueItem.
 */
function isSyncQueueItem(value: unknown): value is SyncQueueItem {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.url === 'string'
    && typeof obj.method === 'string'
    && typeof obj.timestamp === 'number';
}

export function useFailedSync(): FailedSyncState {
  const [state, setState] = useState<FailedSyncState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const readQueues = useCallback(async (): Promise<void> => {
    try {
      // Read from idb-keyval stores where SW writes failed/conflict items
      const failedRaw = await get<unknown[]>('ganatrack-failed-sync') ?? [];
      const conflictRaw = await get<unknown[]>('ganatrack-conflict-queue') ?? [];

      // Validate and filter items using type guards
      const failed: SyncQueueItem[] = failedRaw.filter(isSyncQueueItem);
      const conflicts: SyncQueueItem[] = conflictRaw.filter(isSyncQueueItem);

      setState({
        failedCount: failed.length,
        conflictCount: conflicts.length,
        failedItems: failed,
        conflictItems: conflicts,
        refetch: readQueues,
      });
    } catch {
      // IndexedDB not accessible or queue doesn't exist yet
      setState((prev) => ({
        ...initialState,
        refetch: readQueues,
      }));
    }
  }, []);

  useEffect(() => {
    void readQueues();

    // Listen for sync events
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'SYNC_QUEUE_UPDATED') {
          void readQueues();
        }
      };

      navigator.serviceWorker.addEventListener('message', handler);

      // Cleanup: remove event listener on unmount
      return () => {
        navigator.serviceWorker.removeEventListener('message', handler);
      };
    }
  }, [readQueues]);

  return { ...state, refetch: readQueues };
}
