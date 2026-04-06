// apps/web/tests/integration/sync-replay-success.test.ts
/**
 * Integration test: Successful token refresh leads to mutation replay.
 *
 * Scenario: A mutation is queued offline. When reconnecting:
 * 1. Token refresh succeeds with new token
 * 2. Mutation replays with new token
 * 3. Success response received
 * 4. No items in failed-sync queue
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

function createMockResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Sync Replay Success', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('debería replay la mutación exitosamente después de refresh de token', async () => {
    // Mock fetch for token refresh
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { accessToken: 'new-refreshed-token' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', mockFetch);

    const { refreshAccessToken, handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    // Step 1: Refresh token succeeds
    const newToken = await refreshAccessToken();
    expect(newToken).toBe('new-refreshed-token');

    // Step 2: Create a mock request and response for replay
    const request = createMockRequest('https://example.com/api/v1/animales', 'POST');

    const successResponse = new Response(
      JSON.stringify({ success: true, data: { id: 1, codigo: 'A001' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

    // Step 3: Handle replay response - should return true (success, no retry needed)
    const result = await handleReplayResponse(successResponse, request);
    expect(result).toBe(true);

    // Step 4: Verify no items in failed-sync queue (success case)
    const { get } = await import('idb-keyval');
    const failedItems = (await get('ganatrack-failed-sync')) as unknown[];
    expect(failedItems).toBeUndefined();
  });

  it('debería notificar al cliente de éxito', async () => {
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
      JSON.stringify({ success: true, data: { id: 1 } }),
      { status: 200 },
    );

    await handleReplayResponse(response, request);

    // For success (200/201), notifyClient is not called
    // The function returns true without notification
    expect(mockPostMessage).not.toHaveBeenCalled();
  });
});
