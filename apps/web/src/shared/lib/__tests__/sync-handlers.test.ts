// apps/web/src/shared/lib/__tests__/sync-handlers.test.ts
/**
 * Tests for sync-handlers.ts — Service Worker sync handlers.
 *
 * Coverage targets:
 * - moveToFailedSyncQueue stores items in IndexedDB
 * - moveToConflictQueue stores items in conflict queue
 * - notifyClient sends postMessage to all clients
 * - handleReplayResponse correctly routes 404/409/400/401/5xx
 * - clearFailedSyncQueue and clearConflictQueue
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock idb-keyval module
const mockStore: Record<string, unknown> = {};
vi.mock('idb-keyval', async () => {
  return {
    get: vi.fn(async <T>(key: string): Promise<T | undefined> => mockStore[key]),
    set: vi.fn(async (key: string, value: unknown) => {
      mockStore[key] = value;
    }),
    del: vi.fn(async (key: string) => {
      delete mockStore[key];
    }),
  };
});

// Mock Service Worker globals
const mockClients: WindowClient[] = [];
const mockMatchAll = vi.fn(async () => mockClients);
const mockPostMessage = vi.fn();

vi.stubGlobal('self', {
  location: { origin: 'https://example.com' },
  clients: {
    matchAll: mockMatchAll,
  },
});

function resetStore() {
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  mockPostMessage.mockClear();
  mockMatchAll.mockClear();
}

function createMockRequest(url: string, method = 'POST', body = '{"foo":"bar"}'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

function createMockResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('sync-handlers', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('moveToFailedSyncQueue', () => {
    it('debería almacenar el item en IndexedDB con la key correcta', async () => {
      const { moveToFailedSyncQueue } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals', 'POST');

      await moveToFailedSyncQueue(request, 'Network error');

      const { get, set } = await import('idb-keyval');
      expect(set).toHaveBeenCalledWith(
        'ganatrack-failed-sync',
        expect.arrayContaining([
          expect.objectContaining({
            url: 'https://example.com/api/v1/animals',
            method: 'POST',
            body: '{"foo":"bar"}',
            reason: 'Network error',
          }),
        ]),
      );
    });

    it('debería usar status code cuando se proporciona', async () => {
      const { moveToFailedSyncQueue } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals', 'POST');

      await moveToFailedSyncQueue(request, 'Validation failed', 400);

      const { get } = await import('idb-keyval');
      const items = (await get('ganatrack-failed-sync')) as Array<{
        status?: number;
      }>;
      expect(items[0].status).toBe(400);
    });

    it('debería agregar múltiples items al array existente', async () => {
      const { moveToFailedSyncQueue } = await import('../sync-handlers');
      const request1 = createMockRequest('https://example.com/api/v1/animals/1', 'POST');
      const request2 = createMockRequest('https://example.com/api/v1/animals/2', 'POST');

      // First item
      await moveToFailedSyncQueue(request1, 'Error 1');

      // Second item
      await moveToFailedSyncQueue(request2, 'Error 2');

      const { get } = await import('idb-keyval');
      const items = (await get('ganatrack-failed-sync')) as Array<unknown>;
      expect(items).toHaveLength(2);
    });

    it('debería manejar requests sin body', async () => {
      const { moveToFailedSyncQueue } = await import('../sync-handlers');
      const request = new Request('https://example.com/api/v1/animals/1', {
        method: 'DELETE',
      });

      await moveToFailedSyncQueue(request, 'Deleted');

      const { get } = await import('idb-keyval');
      const items = (await get('ganatrack-failed-sync')) as Array<{ body?: string }>;
      expect(items[0].body).toBe('');
    });
  });

  describe('moveToConflictQueue', () => {
    it('debería almacenar el item en conflict queue con status 409', async () => {
      const { moveToConflictQueue } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals/1', 'PUT');
      const serverData = { error: 'Version mismatch', currentVersion: 2 };

      await moveToConflictQueue(request, serverData);

      const { get } = await import('idb-keyval');
      const items = (await get('ganatrack-conflict-queue')) as Array<{
        status?: number;
        reason?: string;
      }>;
      expect(items[0].status).toBe(409);
      expect(items[0].reason).toBe(JSON.stringify(serverData));
    });

    it('debería guardar el body original del request', async () => {
      const { moveToConflictQueue } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals/1', 'PUT', '{"name":"updated"}');

      await moveToConflictQueue(request, {});

      const { get } = await import('idb-keyval');
      const items = (await get('ganatrack-conflict-queue')) as Array<{ body?: string }>;
      expect(items[0].body).toBe('{"name":"updated"}');
    });
  });

  describe('clearFailedSyncQueue', () => {
    it('debería eliminar la cola de failed-sync', async () => {
      const { clearFailedSyncQueue, moveToFailedSyncQueue } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/test', 'POST');

      // Add an item first
      await moveToFailedSyncQueue(request, 'Error');

      // Clear it
      await clearFailedSyncQueue();

      const { del } = await import('idb-keyval');
      expect(del).toHaveBeenCalledWith('ganatrack-failed-sync');
    });
  });

  describe('clearConflictQueue', () => {
    it('debería eliminar la cola de conflictos', async () => {
      const { clearConflictQueue } = await import('../sync-handlers');

      await clearConflictQueue();

      const { del } = await import('idb-keyval');
      expect(del).toHaveBeenCalledWith('ganatrack-conflict-queue');
    });
  });

  describe('notifyClient', () => {
    it('debería enviar postMessage a todos los clientes window', async () => {
      const { notifyClient } = await import('../sync-handlers');

      const mockClient1 = { postMessage: mockPostMessage } as unknown as WindowClient;
      const mockClient2 = { postMessage: mockPostMessage } as unknown as WindowClient;
      mockClients.length = 0;
      mockClients.push(mockClient1, mockClient2);

      await notifyClient({
        type: 'SYNC_FAILED',
        severity: 'error',
        message: 'Test error',
        action: 'failed',
      });

      expect(mockPostMessage).toHaveBeenCalledTimes(2);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SYNC_FAILED',
        severity: 'error',
        message: 'Test error',
        action: 'failed',
      });
    });

    it('debería manejar cuando no hay clientes conectados', async () => {
      const { notifyClient } = await import('../sync-handlers');
      mockClients.length = 0;

      // Should not throw
      await notifyClient({
        type: 'SYNC_SUCCESS',
        severity: 'info',
        message: 'Success',
        action: 'refreshed',
      });

      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it('debería incluir originalUrl cuando está presente', async () => {
      const { notifyClient } = await import('../sync-handlers');
      mockClients.length = 0;
      mockClients.push({ postMessage: mockPostMessage } as unknown as WindowClient);

      await notifyClient({
        type: 'SYNC_CONFLICT',
        severity: 'conflict',
        message: 'Conflicto',
        action: 'pending_resolution',
        originalUrl: 'https://example.com/api/v1/animals/1',
      });

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          originalUrl: 'https://example.com/api/v1/animals/1',
        }),
      );
    });
  });

  describe('handleReplayResponse', () => {
    it('debería retornar true para respuestas ok (200/201/204)', async () => {
      const { handleReplayResponse } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/test');
      const response = createMockResponse({ success: true }, 200);

      const result = await handleReplayResponse(response, request);
      expect(result).toBe(true);
    });

    it('debería retornar true para 404 (recurso eliminado)', async () => {
      const { handleReplayResponse, moveToConflictQueue } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals/1');
      const response = createMockResponse({ error: { message: 'Resource not found' } }, 404);

      const result = await handleReplayResponse(response, request);

      expect(result).toBe(true);
      // Should notify but not move to conflict queue (discarded)
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SYNC_CONFLICT',
          action: 'discarded',
        }),
      );
    });

    it('debería mover a conflict queue para 409', async () => {
      const { handleReplayResponse } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals/1', 'PUT');
      const response = createMockResponse({ error: 'Version conflict' }, 409);

      const result = await handleReplayResponse(response, request);

      expect(result).toBe(true);
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SYNC_CONFLICT',
          severity: 'conflict',
          action: 'pending_resolution',
        }),
      );
    });

    it('debería mover a failed queue para 400', async () => {
      const { handleReplayResponse } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals', 'POST');
      const response = createMockResponse({ error: { message: 'Validation error' } }, 400);

      const result = await handleReplayResponse(response, request);

      expect(result).toBe(true);
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SYNC_FAILED',
          severity: 'error',
          action: 'failed',
        }),
      );
    });

    it('debería manejar 401 (sesión expirada)', async () => {
      const { handleReplayResponse } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals', 'POST');
      const response = createMockResponse({ error: 'Unauthorized' }, 401);

      const result = await handleReplayResponse(response, request);

      expect(result).toBe(true);
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SYNC_FAILED',
          severity: 'error',
          message: 'Tu sesión expiró. Inicia sesión nuevamente.',
        }),
      );
    });

    it('debería retornar false para 5xx (retry needed)', async () => {
      const { handleReplayResponse } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/animals', 'POST');
      const response = createMockResponse({ error: 'Server error' }, 500);

      const result = await handleReplayResponse(response, request);

      expect(result).toBe(false);
      // Should not notify on 5xx — let BackgroundSync retry
      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it('debería retornar false para 502 y 503', async () => {
      const { handleReplayResponse } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/test');

      const response502 = createMockResponse({}, 502);
      const response503 = createMockResponse({}, 503);

      expect(await handleReplayResponse(response502, request)).toBe(false);
      expect(await handleReplayResponse(response503, request)).toBe(false);
    });

    it('debería manejar respuestas sin body JSON', async () => {
      const { handleReplayResponse } = await import('../sync-handlers');
      const request = createMockRequest('https://example.com/api/v1/test');
      const response = new Response('Server error', { status: 500 });

      const result = await handleReplayResponse(response, request);

      expect(result).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('debería retornar el token del response', async () => {
      // Mock fetch
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: { accessToken: 'new-token-123' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      vi.stubGlobal('fetch', mockFetch);

      const { refreshAccessToken } = await import('../sync-handlers');
      const token = await refreshAccessToken();

      expect(token).toBe('new-token-123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/v1/auth/refresh',
        { method: 'POST', credentials: 'include' },
      );
    });

    it('debería retornar null si el response no es ok', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })));

      const { refreshAccessToken } = await import('../sync-handlers');
      const token = await refreshAccessToken();

      expect(token).toBeNull();
    });

    it('debería retornar null si hay excepción', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const { refreshAccessToken } = await import('../sync-handlers');
      const token = await refreshAccessToken();

      expect(token).toBeNull();
    });

    it('debería retornar null si no hay accessToken en response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ));

      const { refreshAccessToken } = await import('../sync-handlers');
      const token = await refreshAccessToken();

      expect(token).toBeNull();
    });
  });
});
