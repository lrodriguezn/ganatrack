// apps/web/src/shared/hooks/use-sync-actions.ts
/**
 * use-sync-actions.ts — Actions for sync queue management.
 *
 * Provides functions to:
 * - discardItem: Remove an item from the sync queue
 * - retryItem: Retry a failed mutation
 * - resolveConflict: Resolve a conflict (keep local or accept server)
 */

'use client';

/**
 * Sync queue item structure.
 */
export interface ISyncQueueItem {
  url: string;
  method: string;
  body?: string;
  timestamp: number;
  error?: string;
  status?: number;
  reason?: string;
}

/**
 * Discards an item from the sync queue.
 * Posts a message to the service worker to remove the item.
 *
 * @param url - The URL of the item to discard
 * @throws Error if service worker communication fails
 */
export async function discardItem(url: string): Promise<void> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) {
        throw new Error('No active service worker');
      }
      registration.active.postMessage({
        type: 'DISCARD_SYNC_ITEM',
        payload: { url },
      });
    } catch (error) {
      console.error('[use-sync-actions] Failed to discard item:', error);
      throw new Error('No se pudo descartar el item. Verifica tu conexión.');
    }
  } else {
    throw new Error('Service worker no disponible');
  }
}

/**
 * Retries a failed mutation.
 *
 * @param item - The sync queue item to retry
 * @returns The response from the retry
 * @throws Error if the retry fails
 */
export async function retryItem(item: ISyncQueueItem): Promise<Response> {
  try {
    const response = await fetch(item.url, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: item.body,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Retry failed: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de red. Verifica tu conexión.');
    }
    throw error;
  }
}

/**
 * Resolves a conflict by either keeping the local version or accepting the server version.
 *
 * @param item - The conflict item
 * @param keepLocal - If true, sends PUT with force flag to keep local version
 *                    If false, discards the local version (accepts server)
 * @throws Error if resolution fails
 */
export async function resolveConflict(
  item: ISyncQueueItem,
  keepLocal: boolean,
): Promise<void> {
  if (keepLocal) {
    // Send PUT with X-Force-Update header to override server version
    const response = await fetch(item.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Force-Update': 'true',
      },
      body: item.body,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Conflict resolution failed: ${response.status}`);
    }
  } else {
    // Accept server version - send message to remove from conflict queue
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (!registration.active) {
          throw new Error('No active service worker');
        }
        registration.active.postMessage({
          type: 'DISCARD_CONFLICT_ITEM',
          payload: { url: item.url },
        });
      } catch (error) {
        console.error('[use-sync-actions] Failed to discard conflict item:', error);
        throw new Error('No se pudo resolver el conflicto. Verifica tu conexión.');
      }
    } else {
      throw new Error('Service worker no disponible');
    }
  }
}
