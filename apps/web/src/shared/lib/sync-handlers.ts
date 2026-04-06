// apps/web/src/shared/lib/sync-handlers.ts
/**
 * Sync handlers for Service Worker — extracted for testability.
 *
 * These functions handle:
 * - Failed sync queue management (idb-keyval based)
 * - Conflict queue management
 * - Client notifications via postMessage
 * - Token refresh
 * - Replay response handling
 *
 * Used by sw.ts and tested independently.
 */

import { get, set, del } from 'idb-keyval';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SyncNotification {
  type: 'SYNC_CONFLICT' | 'SYNC_FAILED' | 'SYNC_SUCCESS';
  severity: 'info' | 'warning' | 'error' | 'conflict';
  message: string;
  action: 'discarded' | 'pending_resolution' | 'failed' | 'refreshed';
  originalUrl?: string;
  timestamp?: number;
}

export interface FailedSyncItem {
  url: string;
  method: string;
  body: string;
  reason: string;
  timestamp: number;
  status?: number;
}

// ============================================================================
// IndexedDB Queue Operations
// ============================================================================

/**
 * Moves a failed request to the failed-sync queue in IndexedDB.
 */
export async function moveToFailedSyncQueue(
  request: Request,
  reason: string,
  status?: number,
): Promise<void> {
  const failedItems: FailedSyncItem[] = (await get('ganatrack-failed-sync')) ?? [];
  failedItems.push({
    url: request.url,
    method: request.method,
    body: await request.clone().text(),
    reason,
    timestamp: Date.now(),
    status,
  });
  await set('ganatrack-failed-sync', failedItems);
}

/**
 * Moves a request to the conflict queue (409 responses).
 */
export async function moveToConflictQueue(
  request: Request,
  serverData: unknown,
): Promise<void> {
  const conflictItems: FailedSyncItem[] = (await get('ganatrack-conflict-queue')) ?? [];
  conflictItems.push({
    url: request.url,
    method: request.method,
    body: await request.clone().text(),
    reason: JSON.stringify(serverData),
    timestamp: Date.now(),
    status: 409,
  });
  await set('ganatrack-conflict-queue', conflictItems);
}

/**
 * Clears the failed sync queue.
 */
export async function clearFailedSyncQueue(): Promise<void> {
  await del('ganatrack-failed-sync');
}

/**
 * Clears the conflict queue.
 */
export async function clearConflictQueue(): Promise<void> {
  await del('ganatrack-conflict-queue');
}

// ============================================================================
// Client Notifications
// ============================================================================

/**
 * Notifies all open clients via postMessage.
 */
export async function notifyClient(data: SyncNotification): Promise<void> {
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage(data);
  }
}

// ============================================================================
// Token Refresh
// ============================================================================

const API_BASE_URL = self.location.origin;

/**
 * Attempts to refresh the access token via httpOnly cookie.
 * Returns the new token or null if refresh failed.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data?.data?.accessToken ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Response Handling
// ============================================================================

/**
 * Handles the response from a replayed mutation.
 * Routes to appropriate queue based on status code.
 *
 * @returns true if handled (no retry needed), false if BackgroundSync should retry
 */
export async function handleReplayResponse(
  response: Response,
  originalRequest: Request,
): Promise<boolean> {
  if (response.ok) return true;

  const status = response.status;
  const body = await response.clone().json().catch(() => null);

  if (status === 404) {
    await notifyClient({
      type: 'SYNC_CONFLICT',
      severity: 'warning',
      message: body?.error?.message ?? 'El recurso fue eliminado por otro usuario.',
      action: 'discarded',
      originalUrl: originalRequest.url,
    });
    return true; // Handled — don't retry
  }

  if (status === 409) {
    await moveToConflictQueue(originalRequest, body);
    await notifyClient({
      type: 'SYNC_CONFLICT',
      severity: 'conflict',
      message: 'Conflicto detectado. Se requiere tu decisión.',
      action: 'pending_resolution',
    });
    return true; // Handled
  }

  if (status === 400) {
    await moveToFailedSyncQueue(
      originalRequest,
      body?.error?.message ?? 'Validación fallida',
      status,
    );
    await notifyClient({
      type: 'SYNC_FAILED',
      severity: 'error',
      message: body?.error?.message ?? 'El cambio offline no pudo aplicarse.',
      action: 'failed',
    });
    return true; // Handled
  }

  if (status === 401) {
    // Token refresh already failed before replay — move to failed
    await moveToFailedSyncQueue(originalRequest, 'Sesión expirada', status);
    await notifyClient({
      type: 'SYNC_FAILED',
      severity: 'error',
      message: 'Tu sesión expiró. Inicia sesión nuevamente.',
      action: 'failed',
    });
    return true;
  }

  // 5xx — let BackgroundSync retry with backoff
  return false;
}
