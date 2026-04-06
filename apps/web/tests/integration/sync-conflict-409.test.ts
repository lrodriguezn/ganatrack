// apps/web/tests/integration/sync-conflict-409.test.ts
/**
 * Integration test: 409 Conflict response moves item to conflict queue.
 *
 * Scenario: A mutation is replayed but the server returns 409 Conflict
 * because another user modified the record. The item is moved to the
 * conflict queue and the client is notified.
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

function createMockRequest(url: string, method = 'POST', body = '{"foo":"bar"}'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

describe('Sync Conflict 409', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('debería mover item a conflict queue cuando recibe 409', async () => {
    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const request = createMockRequest('https://example.com/api/v1/animales/999', 'PUT');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'El registro fue modificado por otro usuario',
          details: { serverVersion: { nombre: 'Vaca B' } },
        },
      }),
      { status: 409 },
    );

    const result = await handleReplayResponse(response, request);

    // Returns true - handled, don't retry
    expect(result).toBe(true);

    // Verify item was moved to conflict queue
    const { get } = await import('idb-keyval');
    const conflictItems = (await get('ganatrack-conflict-queue')) as Array<{
      url: string;
      status?: number;
      reason: string;
    }>;

    expect(conflictItems).toHaveLength(1);
    expect(conflictItems[0].url).toBe('https://example.com/api/v1/animales/999');
    expect(conflictItems[0].status).toBe(409);
    expect(conflictItems[0].reason).toContain('Vaca B');
  });

  it('debería notificar al cliente con severidad conflict', async () => {
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

    const request = createMockRequest('https://example.com/api/v1/animales/999', 'PUT');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: { code: 'CONFLICT', message: 'Conflicto' },
      }),
      { status: 409 },
    );

    await handleReplayResponse(response, request);

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SYNC_CONFLICT',
        severity: 'conflict',
        action: 'pending_resolution',
      }),
    );
  });

  it('debería incluir datos del servidor en el reason del conflict', async () => {
    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const request = createMockRequest('https://example.com/api/v1/animales/999', 'PUT');

    const serverData = {
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'El registro fue modificado por otro usuario',
        details: { serverVersion: { nombre: 'Vaca B' } },
      },
    };

    const response = new Response(JSON.stringify(serverData), { status: 409 });

    await handleReplayResponse(response, request);

    const { get } = await import('idb-keyval');
    const conflictItems = (await get('ganatrack-conflict-queue')) as Array<{
      reason: string;
    }>;

    expect(conflictItems[0].reason).toContain('Vaca B');
  });
});
