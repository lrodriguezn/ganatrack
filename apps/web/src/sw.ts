/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

/**
 * GanaTrack Service Worker — Serwist-based.
 *
 * Caching strategies:
 * 1. Static assets (/_next/static/*) — StaleWhileRevalidate
 * 2. Images (/icons/*, /images/*) — CacheFirst, 30 days, 100 entries
 * 3. Auth (/api/v1/auth/*) — NetworkOnly (NEVER cached)
 * 4. API images (/api/v1/imagenes/*) — CacheFirst, 7 days, 200 entries
 * 5. Catalogs (/api/v1/configuracion/*, /maestros/*) — StaleWhileRevalidate
 * 6. Dynamic API (/api/v1/* GET) — NetworkFirst, 3s timeout, 1 hour, 50 entries
 * 7. Mutations (POST/PUT /api/v1/*) — NetworkOnly + BackgroundSync, 24h retention
 * 8. Google Fonts — CacheFirst, 1 year
 *
 * Push notification + notificationclick event handlers.
 *
 * PWA Offline enhancements:
 * - Token refresh before replay (for expired access tokens)
 * - Failed sync queue management (404/409/400 handling)
 * - Conflict resolution support
 * - Client notifications via postMessage
 * - Offline fallback navigation
 */

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "serwist";
import { BackgroundSyncPlugin, ExpirationPlugin } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Queue item stored in IndexedDB for failed/conflict sync items.
 */
export interface SyncQueueItem {
  url: string;
  method: string;
  body?: string;
  timestamp: number;
  error?: string;
  status?: number;
}

/**
 * Message types sent to clients via postMessage.
 */
export type SWMessageType =
  | 'SYNC_QUEUE_UPDATED'
  | 'TOKEN_REFRESHED'
  | 'TOKEN_REFRESH_FAILED'
  | 'SYNC_COMPLETE'
  | 'SYNC_FAILED'
  | 'CONFLICT_DETECTED'
  | 'CACHE_CLEARED';

/**
 * Message payload sent to clients.
 */
export interface SWMessage {
  type: SWMessageType;
  payload?: Record<string, unknown>;
}

// ============================================================================
// Sync Response Plugin — intercepts mutation responses for conflict handling
// ============================================================================

/**
 * Custom Serwist plugin that intercepts mutation responses.
 * When BackgroundSync replays a request and gets a non-ok response,
 * this plugin routes it to the appropriate queue (conflict/failed).
 */
class SyncResponsePlugin {
  /** Unique plugin name required by Serwist */
  private pluginName = 'SyncResponsePlugin';

  /**
   * Called after a fetch succeeds (even if response is 4xx/5xx).
   * We use this to detect and handle conflict/validation errors
   * from BackgroundSync replays.
   */
  async fetchDidSucceed({ response }: { response: Response }): Promise<Response> {
    // Only handle non-ok responses on mutation-like requests
    if (response.ok) {
      return response;
    }

    // Clone before reading body (can only read once)
    const clonedResponse = response.clone();
    const status = clonedResponse.status;

    // Route based on status
    switch (status) {
      case 404: {
        // Resource deleted on server — notify client
        await notifyClient({
          type: 'SYNC_FAILED',
          payload: {
            url: response.url,
            message: 'El recurso fue eliminado en el servidor',
          },
        });
        break;
      }

      case 409: {
        // Conflict — move to conflict queue
        const body = await clonedResponse.json().catch(() => ({}));
        await moveToConflictQueue({
          url: response.url,
          method: 'POST', // Unknown method from BackgroundSync replay
          body: JSON.stringify(body),
          timestamp: Date.now(),
          status: 409,
          error: 'Conflicto de versión',
        });
        break;
      }

      case 400: {
        // Validation error — move to failed queue
        const errorBody = await clonedResponse.json().catch(() => ({}));
        await moveToFailedSyncQueue({
          url: response.url,
          method: 'POST',
          timestamp: Date.now(),
          status: 400,
          error: errorBody?.error?.message || 'Error de validación',
        });
        break;
      }

      case 401: {
        // Token expired — move to failed queue
        await moveToFailedSyncQueue({
          url: response.url,
          method: 'POST',
          timestamp: Date.now(),
          status: 401,
          error: 'Sesión expirada.',
        });
        await notifyClient({
          type: 'TOKEN_REFRESH_FAILED',
          payload: { message: 'La sesión expiró. Por favor, inicia sesión.' },
        });
        break;
      }

      case 403: {
        // Forbidden — move to failed queue
        await moveToFailedSyncQueue({
          url: response.url,
          method: 'POST',
          timestamp: Date.now(),
          status: 403,
          error: 'Sin permisos para realizar esta operación.',
        });
        await notifyClient({
          type: 'SYNC_FAILED',
          payload: { message: 'Sin permisos para realizar esta operación.' },
        });
        break;
      }

      default:
        // 5xx — let BackgroundSync retry
        if (status >= 500) {
          console.warn(`[SW] Server error (${status}) on: ${response.url}. BackgroundSync will retry.`);
        }
        break;
    }

    return response;
  }
}

/**
 * Creates a mutation handler with BackgroundSync + SyncResponsePlugin.
 */
function createMutationHandler(queueName: string): NetworkOnly {
  return new NetworkOnly({
    plugins: [
      new BackgroundSyncPlugin(queueName, {
        maxRetentionTime: 24 * 60, // 24 hours
      }),
      new SyncResponsePlugin(),
    ],
  });
}

// ============================================================================
// Service Worker Setup
// ============================================================================

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. Static assets — StaleWhileRevalidate
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
      }),
    },

    // 2. Images (icons, uploaded images) — CacheFirst
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/"),
      handler: new CacheFirst({
        cacheName: "static-images",
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 86400 }),
        ],
      }),
    },

    // 3. Auth — NEVER cache (NetworkOnly)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/v1/auth/"),
      handler: new NetworkOnly(),
    },

    // 4. API images (animal photos, hierros) — CacheFirst
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/v1/imagenes/"),
      handler: new CacheFirst({
        cacheName: "api-images",
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 86400 }),
        ],
      }),
    },

    // 5. Catalogs — NetworkFirst (user can mutate via CRUD; must show fresh data)
    {
      matcher: ({ url }) =>
        /\/api\/v1\/(configuracion|maestros)\//.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: "api-catalogs",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 }),
        ],
      }),
      method: "GET",
    },

    // 6. Dynamic API — NetworkFirst with 3s timeout
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/v1/"),
      handler: new NetworkFirst({
        cacheName: "api-dynamic",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 3600 }),
        ],
      }),
      method: "GET",
    },

    // 7. Mutations POST — NetworkOnly + BackgroundSync (exclude auth)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/v1/") &&
        !url.pathname.startsWith("/api/v1/auth/"),
      handler: createMutationHandler("mutation-queue-post"),
      method: "POST",
    },

    // 7b. Mutations PUT — NetworkOnly + BackgroundSync (exclude auth)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/v1/") &&
        !url.pathname.startsWith("/api/v1/auth/"),
      handler: createMutationHandler("mutation-queue-put"),
      method: "PUT",
    },

    // 7c. Mutations DELETE — NetworkOnly + BackgroundSync (exclude auth)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/v1/") &&
        !url.pathname.startsWith("/api/v1/auth/"),
      handler: createMutationHandler("mutation-queue-delete"),
      method: "DELETE",
    },

    // 8. Google Fonts — CacheFirst, 1 year
    {
      matcher: ({ url }) =>
        /^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(url.href),
      handler: new CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 365 * 86400 }),
        ],
      }),
    },
  ],
});

// ============================================================================
// Token Refresh Before Replay
// ============================================================================

/**
 * Refreshes the access token via POST /auth/refresh.
 * @returns The new access token or null if refresh fails
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    // API returns { success: true, data: { accessToken: "..." } }
    return json?.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Replays a failed request with a new access token.
 * 
 * @param request - The original request that failed
 * @param newToken - The new access token to use
 * @returns The response from the replayed request
 */
export async function replayWithTokenRefresh(
  request: Request,
  newToken: string,
): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${newToken}`);

  const replayRequest = new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    mode: request.mode,
    credentials: request.credentials,
  });

  return fetch(replayRequest);
}

// ============================================================================
// Failed Sync Queue Management — Uses idb-keyval for consistency
// ============================================================================

/**
 * Moves a failed item to the failed-sync queue using idb-keyval.
 * 
 * @param item - The sync queue item to move
 */
export async function moveToFailedSyncQueue(item: SyncQueueItem): Promise<void> {
  try {
    const items: SyncQueueItem[] = (await idbGet('ganatrack-failed-sync')) ?? [];

    // Replace if same URL, otherwise add
    const existingIndex = items.findIndex((i) => i.url === item.url);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    await idbSet('ganatrack-failed-sync', items);
    notifyClient({ type: 'SYNC_QUEUE_UPDATED' });
  } catch (error) {
    console.error('[SW] Failed to move item to failed-sync queue:', error);
  }
}

/**
 * Moves an item to the conflict queue using idb-keyval (for 409 responses).
 * 
 * @param item - The sync queue item to move
 */
export async function moveToConflictQueue(item: SyncQueueItem): Promise<void> {
  try {
    const items: SyncQueueItem[] = (await idbGet('ganatrack-conflict-queue')) ?? [];

    const existingIndex = items.findIndex((i) => i.url === item.url);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    await idbSet('ganatrack-conflict-queue', items);
    notifyClient({ type: 'CONFLICT_DETECTED', payload: { url: item.url } });
  } catch (error) {
    console.error('[SW] Failed to move item to conflict queue:', error);
  }
}

// ============================================================================
// Response Handling
// ============================================================================

/**
 * Handles the response from a replayed mutation.
 * Routes to appropriate queue based on status code.
 * 
 * @param response - The response from the replayed request
 * @param item - The original sync queue item
 * @returns void
 */
export async function handleReplayResponse(
  response: Response,
  item: SyncQueueItem,
): Promise<void> {
  const status = response.status;

  switch (status) {
    case 200:
    case 201:
    case 204:
      // Success - no action needed, item removed from queue automatically
      notifyClient({ type: 'SYNC_COMPLETE', payload: { url: item.url } });
      break;

    case 404:
      // Resource deleted on server - discard silently, notify user
      console.warn(`[SW] Resource not found (404): ${item.url}`);
      notifyClient({
        type: 'SYNC_FAILED',
        payload: {
          url: item.url,
          message: 'El recurso fue eliminado en el servidor',
        },
      });
      // Item is automatically removed from queue by BackgroundSync
      break;

    case 409:
      // Conflict - move to conflict queue for user resolution
      await moveToConflictQueue({
        ...item,
        status: 409,
        error: 'Conflicto de versión',
      });
      break;

    case 400: {
      // Validation error - move to failed queue
      const errorData = await response.clone().json().catch(() => ({}));
      await moveToFailedSyncQueue({
        ...item,
        status: 400,
        error: errorData?.error?.message || 'Error de validación',
      });
      break;
    }

    case 401:
      // Unauthorized - token refresh failed or token still expired
      await moveToFailedSyncQueue({
        ...item,
        status: 401,
        error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
      });
      notifyClient({
        type: 'TOKEN_REFRESH_FAILED',
        payload: { message: 'La sesión expiró. Por favor, inicia sesión.' },
      });
      break;

    case 403:
      // Forbidden - explicit permission denied handling
      await moveToFailedSyncQueue({
        ...item,
        status: 403,
        error: 'Sin permisos para realizar esta operación.',
      });
      notifyClient({
        type: 'SYNC_FAILED',
        payload: { message: 'Sin permisos para realizar esta operación.' },
      });
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      // Server error - retry with backoff (handled by BackgroundSync)
      console.error(`[SW] Server error (${status}): ${item.url}`);
      // Don't move to failed queue - let BackgroundSync retry
      break;

    default:
      // Unknown error - move to failed queue
      await moveToFailedSyncQueue({
        ...item,
        status,
        error: `Error desconocido: ${status}`,
      });
  }
}

// ============================================================================
// Client Notifications
// ============================================================================

/**
 * Sends a message to all connected clients.
 * 
 * @param message - The message to send
 */
export function notifyClient(message: SWMessage): void {
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    for (const client of clients) {
      client.postMessage(message);
    }
  });
}

// ============================================================================
// Message Handlers
// ============================================================================

/**
 * Handles messages from the main thread.
 */
self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'CLEAR_DYNAMIC_CACHE':
      clearDynamicCache();
      break;

    case 'CLEAR_SYNC_QUEUES':
      void idbDel('ganatrack-failed-sync');
      void idbDel('ganatrack-conflict-queue');
      break;

    case 'GET_SYNC_STATUS':
      getSyncStatus().then((status) => {
        event.ports[0]?.postMessage(status);
      });
      break;

    case 'DISCARD_SYNC_ITEM': {
      void (async () => {
        const { url } = event.data?.payload || {};
        if (url) {
          try {
            const failedItems: SyncQueueItem[] = (await idbGet('ganatrack-failed-sync')) ?? [];
            const filtered = failedItems.filter((item) => item.url !== url);
            await idbSet('ganatrack-failed-sync', filtered);
            notifyClient({ type: 'SYNC_QUEUE_UPDATED' });
          } catch (error) {
            console.error('[SW] Failed to discard sync item:', error);
          }
        }
      })();
      break;
    }

    case 'DISCARD_CONFLICT_ITEM': {
      void (async () => {
        const { url } = event.data?.payload || {};
        if (url) {
          try {
            const conflictItems: SyncQueueItem[] = (await idbGet('ganatrack-conflict-queue')) ?? [];
            const filtered = conflictItems.filter((item) => item.url !== url);
            await idbSet('ganatrack-conflict-queue', filtered);
            notifyClient({ type: 'SYNC_QUEUE_UPDATED' });
          } catch (error) {
            console.error('[SW] Failed to discard conflict item:', error);
          }
        }
      })();
      break;
    }

    default:
      break;
  }
});

/**
 * Clears the dynamic API cache (used when switchingpredio).
 */
async function clearDynamicCache(): Promise<void> {
  try {
    const cache = await caches.open('api-dynamic');
    await cache.keys().then((requests) => {
      return Promise.all(requests.map((request) => cache.delete(request)));
    });
    notifyClient({ type: 'CACHE_CLEARED' });
  } catch (error) {
    console.error('[SW] Failed to clear dynamic cache:', error);
  }
}

/**
 * Gets the current sync status (failed and conflict items) using idb-keyval.
 */
async function getSyncStatus(): Promise<{
  failedCount: number;
  conflictCount: number;
}> {
  try {
    const failedItems = (await idbGet<SyncQueueItem[]>('ganatrack-failed-sync')) ?? [];
    const conflictItems = (await idbGet<SyncQueueItem[]>('ganatrack-conflict-queue')) ?? [];

    return {
      failedCount: failedItems.length,
      conflictCount: conflictItems.length,
    };
  } catch {
    return { failedCount: 0, conflictCount: 0 };
  }
}

// ============================================================================
// Push Notification Event Handlers
// ============================================================================

self.addEventListener("push", (event) => {
  let data: unknown = null;
  try {
    data = event.data?.json();
  } catch {
    // Fallback for non-JSON push payloads
    data = { title: "GanaTrack", body: event.data?.text() ?? "" };
  }
  if (!data) return;

  const payload = data as { title?: string; body?: string; actionUrl?: string };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "GanaTrack", {
      body: payload.body ?? "",
      icon: "/icons/icon-192.png",
      data: { url: payload.actionUrl },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data as { url?: string })?.url ?? "/notificaciones";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Check if there is already a window/tab open with the target URL
      for (const client of clients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      return self.clients.openWindow(targetUrl);
    }),
  );
});

// ============================================================================
// Offline Fallback Navigation
// ============================================================================

// Offline fallback for navigation requests
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first (uses navigation preload if available)
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch {
          // Offline — try to serve from cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;

          // No cache — serve offline page
          const offlineResponse = await caches.match('/offline');
          if (offlineResponse) return offlineResponse;

          // Last resort
          return new Response('Offline — Esta página no está disponible sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
      })(),
    );
  }
});

// ============================================================================
// Register Service Worker
// ============================================================================

serwist.addEventListeners();
