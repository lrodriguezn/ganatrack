// apps/web/src/shared/hooks/use-failed-sync.ts
/**
 * useFailedSync — reads failed/conflict queues from IndexedDB (BackgroundSyncPlugin).
 *
 * Returns count and items for UI display.
 *
 * @example
 * const { failedCount, conflictCount, failedItems, conflictItems } = useFailedSync();
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SyncQueueItem {
  url: string;
  method: string;
  body?: string;
  timestamp: number;
  error?: string;
}

interface FailedSyncState {
  failedCount: number;
  conflictCount: number;
  failedItems: SyncQueueItem[];
  conflictItems: SyncQueueItem[];
}

const initialState: FailedSyncState = {
  failedCount: 0,
  conflictCount: 0,
  failedItems: [],
  conflictItems: [],
};

export function useFailedSync(): FailedSyncState {
  const [state, setState] = useState<FailedSyncState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const readQueues = useCallback(async () => {
    // Check if IndexedDB is available
    if (!('indexedDB' in window)) {
      return;
    }

    try {
      // Serwist uses workbox-background-sync internally
      // Try multiple possible database names since Serwist may use different naming
      const dbNames = [
        'workbox-background-sync',
        'bgSync',
        'serwist-background-sync',
      ];

      let allRequests: any[] = [];

      for (const dbName of dbNames) {
        try {
          const db = await openDB(dbName, 1);
          const storeNames = Array.from(db.objectStoreNames);
          for (const storeName of storeNames) {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const items = await store.getAll();
            allRequests = allRequests.concat(items);
          }
          db.close();
          break; // Found a valid DB, stop trying
        } catch {
          // Try next DB name
          continue;
        }
      }

      if (allRequests.length === 0) {
        setState(initialState);
        return;
      }

      // Categorize by status
      const failed: SyncQueueItem[] = [];
      const conflicts: SyncQueueItem[] = [];

      for (const request of allRequests) {
        const item: SyncQueueItem = {
          url: request.url,
          method: request.method,
          body: request.body,
          timestamp: request.timestamp,
        };

        // Check if this is a conflict (409) or failure (400)
        if (request.lastError?.status === 409) {
          conflicts.push(item);
        } else {
          failed.push(item);
        }
      }

      setState({
        failedCount: failed.length,
        conflictCount: conflicts.length,
        failedItems: failed,
        conflictItems: conflicts,
      });
    } catch {
      // IndexedDB not accessible or queue doesn't exist yet
      setState(initialState);
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

  return state;
}

// ============================================================================
// Helpers
// ============================================================================

function openDB(name: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      // Don't create stores — we're only reading existing ones
      const db = request.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.close();
        reject(new Error(`No 'requests' store in ${name}`));
      }
    };
  });
}
