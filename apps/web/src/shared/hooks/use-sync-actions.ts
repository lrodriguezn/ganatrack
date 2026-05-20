// apps/web/src/shared/hooks/use-sync-actions.ts
/**
 * use-sync-actions.ts — Actions for sync queue management.
 *
 * Provides functions to:
 * - discardItem: Remove an item from the sync queue
 * - retryItem: Retry a failed mutation with auth headers and token refresh
 * - resolveConflict: Resolve a conflict (keep local or accept server) with auth headers
 */

'use client';

import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';

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
  serverVersion?: number; // Version from server on 409 conflict
}

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Builds request headers with auth info from Zustand stores.
 * Mirrors the attachAuthHeaders pattern from api-client.ts.
 */
function buildAuthHeaders(): Record<string, string> {
  const authStore = useAuthStore.getState();
  const predioStore = usePredioStore.getState();
  const headers: Record<string, string> = {};

  if (authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`;
  }

  if (predioStore.predioActivo?.id) {
    headers['X-Predio-Id'] = String(predioStore.predioActivo.id);
  }

  return headers;
}

/**
 * Refreshes the access token via the Next.js proxy route.
 * Updates the auth store with the new token on success.
 * @returns The new access token or null if refresh fails
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const wrapped = (await response.json()) as {
      success: boolean;
      data: { accessToken: string; expiresIn: number };
    };
    const { accessToken } = wrapped.data;

    // Update auth store with new token
    const authStore = useAuthStore.getState();
    authStore.setAuth({
      accessToken,
      user: authStore.user ?? null,
      permissions: authStore.permissions,
    });

    return accessToken;
  } catch {
    return null;
  }
}

/**
 * Performs an authenticated fetch with automatic token refresh on 401.
 *
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Response
 * @throws Error on non-ok response or unrecoverable auth failure
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const authHeaders = buildAuthHeaders();
  const headers = new Headers(options.headers);

  // Merge auth headers
  for (const [key, value] of Object.entries(authHeaders)) {
    headers.set(key, value);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If 401, attempt token refresh and retry once
  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      // Refresh failed — clear auth and throw
      const authStore = useAuthStore.getState();
      authStore.clearAuth();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    // Retry with new token
    headers.set('Authorization', `Bearer ${newToken}`);
    const retryResponse = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    return retryResponse;
  }

  return response;
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
 * Retries a failed mutation with auth headers and token refresh.
 *
 * @param item - The sync queue item to retry
 * @returns The response from the retry
 * @throws Error if the retry fails
 */
export async function retryItem(item: ISyncQueueItem): Promise<Response> {
  try {
    const response = await fetchWithAuth(item.url, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: item.body,
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
 * @param keepLocal - If true, sends PUT with If-Match header using serverVersion to overwrite
 *                    If false, discards the local version (accepts server)
 * @throws Error if resolution fails
 */
export async function resolveConflict(
  item: ISyncQueueItem,
  keepLocal: boolean,
): Promise<void> {
  if (keepLocal) {
    // Send PUT with If-Match header using the server's version to overwrite
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use serverVersion for If-Match — tells the server "I know the current version"
    if (item.serverVersion !== undefined) {
      headers['If-Match'] = String(item.serverVersion);
    }

    const response = await fetchWithAuth(item.url, {
      method: 'PUT',
      headers,
      body: item.body,
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
