// apps/web/tests/integration/sync-discard-404.test.ts
/**
 * Integration test: 404 Not Found response discards mutation and notifies client.
 *
 * Scenario: A mutation is replayed but the server returns 404 because
 * the entity was deleted by another user. The mutation is discarded
 * (not added to any queue) and the client is notified.
 *
 * Note: These tests use direct fetch mocking instead of starting a separate
 * MSW server, to avoid conflicts with the global MSW setup.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock idb-keyval
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
vi.stubGlobal('self', {
  location: { origin: 'https://example.com' },
  clients: {
    matchAll: vi.fn(async () => []),
  },
});

function resetStore() {
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
}

function createMockRequest(url: string, method = 'PUT', body = '{"foo":"bar"}'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

describe('Sync Discard 404', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('debería descartar la mutación cuando recibe 404 (no agregar a queue)', async () => {
    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const request = createMockRequest('https://example.com/api/v1/animales/deleted', 'PUT');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Animal no encontrado' },
      }),
      { status: 404 },
    );

    const result = await handleReplayResponse(response, request);

    // Returns true - handled, don't retry
    expect(result).toBe(true);

    // Verify item was NOT moved to failed-sync queue (discarded)
    const { get } = await import('idb-keyval');
    const failedItems = (await get('ganatrack-failed-sync')) as unknown[];

    // For 404, item should NOT be added to any queue
    expect(failedItems).toBeUndefined();

    // Also verify it's not in conflict queue
    const conflictItems = (await get('ganatrack-conflict-queue')) as unknown[];
    expect(conflictItems).toBeUndefined();
  });

  it('debería notificar al cliente de descarte con action discarded', async () => {
    // Mock clients for notification
    const mockPostMessage = vi.fn();
    const mockClients = [{ postMessage: mockPostMessage }];

    vi.stubGlobal('self', {
      location: { origin: 'https://example.com' },
      clients: {
        matchAll: vi.fn(async () => mockClients),
      },
    });

    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const request = createMockRequest('https://example.com/api/v1/animales/deleted', 'PUT');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Animal no encontrado' },
      }),
      { status: 404 },
    );

    await handleReplayResponse(response, request);

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SYNC_CONFLICT',
        severity: 'warning',
        action: 'discarded',
      }),
    );
  });

  it('debería incluir originalUrl en la notificación', async () => {
    // Mock clients for notification
    const mockPostMessage = vi.fn();
    const mockClients = [{ postMessage: mockPostMessage }];

    vi.stubGlobal('self', {
      location: { origin: 'https://example.com' },
      clients: {
        matchAll: vi.fn(async () => mockClients),
      },
    });

    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const originalUrl = 'https://example.com/api/v1/animales/deleted';
    const request = createMockRequest(originalUrl, 'PUT');

    const response = new Response(
      JSON.stringify({ success: false, error: { message: 'Not found' } }),
      { status: 404 },
    );

    await handleReplayResponse(response, request);

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        originalUrl,
      }),
    );
  });
});
