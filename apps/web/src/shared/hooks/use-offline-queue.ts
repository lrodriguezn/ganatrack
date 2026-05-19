// apps/web/src/shared/hooks/use-offline-queue.ts
/**
 * useOfflineQueue — React hook for managing the offline form queue.
 *
 * Provides:
 * - queueCount: Current number of items in the queue
 * - isOnline: Browser connectivity status
 * - add(item): Add a form item to the queue
 * - remove(id): Remove an item by id
 * - peek(): Return the oldest item without removing
 * - flush(): Clear all items from the queue
 *
 * Automatically refreshes queueCount after every operation.
 * Subscribes to online/offline events.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  enqueue,
  remove as removeFromQueue,
  peek as peekQueue,
  flush as flushQueue,
  getStatus,
} from '@/shared/lib/offline/form-queue';
import type { FormQueueItem } from '@/shared/lib/offline/types';

export interface UseOfflineQueueReturn {
  /** Current number of items in the queue */
  queueCount: number;
  /** Whether the browser is online */
  isOnline: boolean;
  /** Add a form item to the queue */
  add: (item: FormQueueItem) => Promise<void>;
  /** Remove an item from the queue by id */
  remove: (id: string) => Promise<void>;
  /** Return the oldest item without removing */
  peek: () => Promise<FormQueueItem | null>;
  /** Clear all items from the queue */
  flush: () => Promise<void>;
}

/**
 * Hook for managing the offline form submission queue.
 *
 * @returns Queue state and operations
 */
export function useOfflineQueue(): UseOfflineQueueReturn {
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') return navigator.onLine;
    return true;
  });

  /**
   * Refresh the queue count from IndexedDB.
   */
  const refreshCount = useCallback(async () => {
    const status = await getStatus();
    setQueueCount(status.count);
  }, []);

  // Initialize queue count on mount
  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  // Subscribe to online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Add an item to the queue and refresh count.
   */
  const add = useCallback(
    async (item: FormQueueItem) => {
      await enqueue(item);
      await refreshCount();
    },
    [refreshCount],
  );

  /**
   * Remove an item from the queue and refresh count.
   */
  const remove = useCallback(
    async (id: string) => {
      await removeFromQueue(id);
      await refreshCount();
    },
    [refreshCount],
  );

  /**
   * Peek at the oldest item without removing.
   */
  const peek = useCallback(async () => {
    return await peekQueue();
  }, []);

  /**
   * Clear all items from the queue and refresh count.
   */
  const flush = useCallback(async () => {
    await flushQueue();
    await refreshCount();
  }, [refreshCount]);

  return {
    queueCount,
    isOnline,
    add,
    remove,
    peek,
    flush,
  };
}
