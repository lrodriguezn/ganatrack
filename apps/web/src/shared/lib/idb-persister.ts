// apps/web/src/shared/lib/idb-persister.ts
/**
 * idb-persister.ts — IndexedDB persister for TanStack Query.
 *
 * Provides persistence for TanStack Query's client state using IndexedDB
 * via idb-keyval. This enables offline-first behavior by persisting
 * query cache across page reloads and browser restarts.
 *
 * @module idb-persister
 */

import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Creates an IndexedDB-based persister for TanStack Query.
 *
 * @param key - The IndexedDB key to use for storing the client. Defaults to 'ganatrack-query-cache'.
 * @returns A Persister object with persistClient, restoreClient, and removeClient methods.
 *
 * @example
 * const persister = createIDBPersister();
 * // Use with PersistQueryClientProvider
 *
 * @example
 * const persister = createIDBPersister('my-custom-cache-key');
 */
export function createIDBPersister(key = 'ganatrack-query-cache'): Persister {
  return {
    /**
     * Persists the client state to IndexedDB.
     * @param client - The persisted client state from TanStack Query
     */
    persistClient: async (client: PersistedClient): Promise<void> => {
      await set(key, client);
    },

    /**
     * Restores the client state from IndexedDB.
     * @returns The persisted client state, or undefined if none exists
     */
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      return await get<PersistedClient>(key);
    },

    /**
     * Removes the client state from IndexedDB.
     */
    removeClient: async (): Promise<void> => {
      await del(key);
    },
  };
}
