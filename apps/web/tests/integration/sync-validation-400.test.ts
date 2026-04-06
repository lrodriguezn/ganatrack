// apps/web/tests/integration/sync-validation-400.test.ts
/**
 * Integration test: 400 Validation error moves item to failed queue.
 *
 * Scenario: A mutation is replayed but the server returns 400 because
 * the data failed validation (e.g., duplicate code). The item is moved
 * to the failed-sync queue and the client is notified.
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

describe('Sync Validation 400', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('debería mover item a failed-sync queue cuando recibe 400', async () => {
    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const request = createMockRequest('https://example.com/api/v1/animales/invalid', 'POST');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El código ya existe',
          details: [{ field: 'codigo', message: 'Código duplicado' }],
        },
      }),
      { status: 400 },
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
    expect(failedItems[0].url).toBe('https://example.com/api/v1/animales/invalid');
    expect(failedItems[0].status).toBe(400);
    expect(failedItems[0].reason).toBe('El código ya existe');
  });

  it('debería notificar al cliente con type SYNC_FAILED', async () => {
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

    const request = createMockRequest('https://example.com/api/v1/animales/invalid', 'POST');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validación fallida' },
      }),
      { status: 400 },
    );

    await handleReplayResponse(response, request);

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SYNC_FAILED',
        severity: 'error',
        action: 'failed',
      }),
    );
  });

  it('debería incluir el mensaje de error de validación', async () => {
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

    const request = createMockRequest('https://example.com/api/v1/animales/invalid', 'POST');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El código ya existe',
          details: [{ field: 'codigo', message: 'Código duplicado' }],
        },
      }),
      { status: 400 },
    );

    await handleReplayResponse(response, request);

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'El código ya existe',
      }),
    );
  });

  it('debería incluir los detalles de validación si están disponibles', async () => {
    const { handleReplayResponse } = await import('@/shared/lib/sync-handlers');

    const request = createMockRequest('https://example.com/api/v1/animales/invalid', 'POST');

    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validación fallida',
          details: [
            { field: 'codigo', message: 'Código duplicado' },
            { field: 'nombre', message: 'Nombre requerido' },
          ],
        },
      }),
      { status: 400 },
    );

    await handleReplayResponse(response, request);

    // Check that the failed item reason contains the validation message
    const { get } = await import('idb-keyval');
    const failedItems = (await get('ganatrack-failed-sync')) as Array<{
      reason: string;
    }>;

    expect(failedItems[0].reason).toBe('Validación fallida');
  });
});
