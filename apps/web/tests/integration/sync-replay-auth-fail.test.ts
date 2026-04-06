// apps/web/tests/integration/sync-replay-auth-fail.test.ts
/**
 * Integration test: Token refresh fails (401), mutation moves to failed-sync queue.
 *
 * Scenario: A mutation is queued offline. When reconnecting:
 * 1. Token refresh fails with 401 (refresh token expired)
 * 2. Mutation is moved to failed-sync queue
 * 3. Client is notified of the failure
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

describe('Sync Replay Auth Fail', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('debería retornar null cuando refresh falla con 401', async () => {
    // Mock fetch for failed token refresh
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, error: { code: 'REFRESH_EXPIRED', message: 'Refresh token expired' } }),
        { status: 401 },
      ),
    ));

    const { refreshAccessToken } = await import('@/shared/lib/sync-handlers');

    const token = await refreshAccessToken();
    expect(token).toBeNull();
  });

  it('debería mover la mutación a failed-sync queue cuando auth falla', async () => {
    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const request = createMockRequest('https://example.com/api/v1/animales', 'POST');

    // Simulate a 401 response (token expired during replay)
    const response = new Response(
      JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED' } }),
      { status: 401 },
    );

    const result = await handleReplayResponse(response, request);

    // Returns true - handled, don't retry
    expect(result).toBe(true);

    // Verify item was moved to failed-sync queue
    const { get } = await import('idb-keyval');
    const failedItems = (await get('ganatrack-failed-sync')) as Array<{
      url: string;
      status?: number;
      reason: string;
    }>;

    expect(failedItems).toHaveLength(1);
    expect(failedItems[0].url).toBe('https://example.com/api/v1/animales');
    expect(failedItems[0].status).toBe(401);
    expect(failedItems[0].reason).toBe('Sesión expirada');
  });

  it('debería notificar al cliente de falla de auth', async () => {
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

    const request = createMockRequest('https://example.com/api/v1/animales', 'POST');

    const response = new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 },
    );

    await handleReplayResponse(response, request);

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SYNC_FAILED',
        severity: 'error',
        message: 'Tu sesión expiró. Inicia sesión nuevamente.',
        action: 'failed',
      }),
    );
  });
});
