// apps/web/src/shared/hooks/__tests__/use-sync-actions.test.ts
/**
 * Tests for use-sync-actions.ts — sync actions hook.
 *
 * Coverage targets:
 * - discardItem sends postMessage to service worker
 * - retryItem retries a failed mutation with auth headers
 * - resolveConflict handles conflict resolution with auth headers
 * - Token refresh on 401 during retry
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Track postMessage calls
const postMessageCalls: unknown[] = [];

// Mock navigator.serviceWorker
Object.defineProperty(globalThis, 'navigator', {
  value: {
    serviceWorker: {
      ready: Promise.resolve({
        active: {
          postMessage: (msg: unknown) => { postMessageCalls.push(msg); },
        },
      }),
    },
  },
  writable: true,
  configurable: true,
});

// Mock Zustand stores
const mockAuthStore = {
  accessToken: 'test-access-token-123',
  user: null,
  permissions: [],
  clearAuth: vi.fn(),
  setAuth: vi.fn((data) => {
    mockAuthStore.accessToken = data.accessToken;
    mockAuthStore.user = data.user;
    mockAuthStore.permissions = data.permissions;
  }),
};

const mockPredioStore = {
  predioActivo: { id: 42, nombre: 'Test Predio' },
};

vi.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    vi.fn(),
    { getState: () => mockAuthStore },
  ),
}));

vi.mock('@/store/predio.store', () => ({
  usePredioStore: Object.assign(
    vi.fn(),
    { getState: () => mockPredioStore },
  ),
}));

describe('useSyncActions', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    postMessageCalls.length = 0;
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    // Reset store mocks
    mockAuthStore.accessToken = 'test-access-token-123';
    mockPredioStore.predioActivo = { id: 42, nombre: 'Test Predio' };
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('discardItem', () => {
    it('debería enviar mensaje al SW para descartar un item', async () => {
      const { discardItem } = await import('../use-sync-actions');
      await discardItem('/api/v1/animales/123');
      await new Promise((r) => setTimeout(r, 0));

      expect(postMessageCalls).toContainEqual({
        type: 'DISCARD_SYNC_ITEM',
        payload: { url: '/api/v1/animales/123' },
      });
    });
  });

  describe('retryItem', () => {
    it('debería retornar response exitosa al reintentar', async () => {
      const { retryItem } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const response = await retryItem({
        url: '/api/v1/animales',
        method: 'POST',
        body: '{"nombre":"Vaca"}',
        timestamp: Date.now(),
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
    });

    it('debería incluir headers de autenticación en el retry', async () => {
      const { retryItem } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await retryItem({
        url: '/api/v1/animales',
        method: 'POST',
        body: '{"nombre":"Vaca"}',
        timestamp: Date.now(),
      });

      const callArgs = fetchSpy.mock.calls[0];
      expect(callArgs[0]).toBe('/api/v1/animales');
      const options = callArgs[1] as RequestInit;
      expect(options.method).toBe('POST');
      expect(options.body).toBe('{"nombre":"Vaca"}');
      expect(options.credentials).toBe('include');

      const headers = options.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer test-access-token-123');
      expect(headers.get('X-Predio-Id')).toBe('42');
    });

    it('debería NO incluir Authorization si no hay token', async () => {
      mockAuthStore.accessToken = null;
      const { retryItem } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await retryItem({
        url: '/api/v1/animales',
        method: 'POST',
        body: '{"nombre":"Vaca"}',
        timestamp: Date.now(),
      });

      const callArgs = fetchSpy.mock.calls[0];
      const headers = callArgs[1].headers as Headers;
      expect(headers.get('Authorization')).toBeNull();
    });

    it('debería NO incluir X-Predio-Id si no hay predio activo', async () => {
      mockPredioStore.predioActivo = null;
      const { retryItem } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await retryItem({
        url: '/api/v1/animales',
        method: 'POST',
        body: '{"nombre":"Vaca"}',
        timestamp: Date.now(),
      });

      const callArgs = fetchSpy.mock.calls[0];
      const headers = callArgs[1].headers as Headers;
      expect(headers.get('X-Predio-Id')).toBeNull();
    });

    it('debería lanzar error si el retry falla', async () => {
      const { retryItem } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response('{"message":"Error"}', {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(
        retryItem({
          url: '/api/v1/animales',
          method: 'POST',
          body: '{}',
          timestamp: Date.now(),
        }),
      ).rejects.toThrow('Retry failed: 400');
    });

    it('debería refrescar token y reintentar en 401', async () => {
      const { retryItem } = await import('../use-sync-actions');

      // First call returns 401
      fetchSpy.mockResolvedValueOnce(
        new Response('{"error":"Unauthorized"}', {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // Refresh token call succeeds
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({
          success: true,
          data: { accessToken: 'new-refreshed-token', expiresIn: 3600 },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // Retry with new token succeeds
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const response = await retryItem({
        url: '/api/v1/animales',
        method: 'POST',
        body: '{"nombre":"Vaca"}',
        timestamp: Date.now(),
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);

      // Verify the retry used the new token
      const calls = fetchSpy.mock.calls;
      // Third call should be the retry with new token
      const retryCall = calls[2];
      const retryHeaders = retryCall[1].headers as Headers;
      expect(retryHeaders.get('Authorization')).toBe('Bearer new-refreshed-token');
    });

    it('debería lanzar error de autenticación si refresh token también falla', async () => {
      const { retryItem } = await import('../use-sync-actions');

      // First call returns 401
      fetchSpy.mockResolvedValueOnce(
        new Response('{"error":"Unauthorized"}', {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // Refresh token call fails
      fetchSpy.mockResolvedValueOnce(
        new Response('{"error":"Refresh failed"}', {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(
        retryItem({
          url: '/api/v1/animales',
          method: 'POST',
          body: '{}',
          timestamp: Date.now(),
        }),
      ).rejects.toThrow('Sesión expirada. Por favor, inicia sesión nuevamente.');
    });
  });

  describe('resolveConflict', () => {
    it('debería enviar PUT con If-Match al mantener local con serverVersion', async () => {
      const { resolveConflict } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await resolveConflict(
        {
          url: '/api/v1/animales/123',
          method: 'PUT',
          body: '{"nombre":"Mi Vaca"}',
          timestamp: Date.now(),
          serverVersion: 5,
        },
        true,
      );

      const callArgs = fetchSpy.mock.calls[0];
      expect(callArgs[0]).toBe('/api/v1/animales/123');
      const options = callArgs[1] as RequestInit;
      expect(options.method).toBe('PUT');
      expect(options.body).toBe('{"nombre":"Mi Vaca"}');
      expect(options.credentials).toBe('include');

      const headers = options.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('If-Match')).toBe('5');
      expect(headers.get('X-Force-Update')).toBeNull();
      expect(headers.get('Authorization')).toBe('Bearer test-access-token-123');
      expect(headers.get('X-Predio-Id')).toBe('42');
    });

    it('debería enviar PUT sin If-Match cuando no hay serverVersion', async () => {
      const { resolveConflict } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await resolveConflict(
        {
          url: '/api/v1/animales/123',
          method: 'PUT',
          body: '{"nombre":"Mi Vaca"}',
          timestamp: Date.now(),
        },
        true,
      );

      const callArgs = fetchSpy.mock.calls[0];
      const options = callArgs[1] as RequestInit;
      const headers = options.headers as Headers;
      expect(headers.get('If-Match')).toBeNull();
    });

    it('debería incluir headers de autenticación al mantener local', async () => {
      const { resolveConflict } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await resolveConflict(
        {
          url: '/api/v1/animales/123',
          method: 'PUT',
          body: '{"nombre":"Mi Vaca"}',
          timestamp: Date.now(),
        },
        true,
      );

      const callArgs = fetchSpy.mock.calls[0];
      const headers = callArgs[1].headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer test-access-token-123');
      expect(headers.get('X-Predio-Id')).toBe('42');
    });

    it('debería lanzar error si la resolución falla', async () => {
      const { resolveConflict } = await import('../use-sync-actions');

      fetchSpy.mockResolvedValueOnce(
        new Response('{"message":"Not found"}', {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(
        resolveConflict(
          {
            url: '/api/v1/animales/123',
            method: 'PUT',
            body: '{}',
            timestamp: Date.now(),
          },
          true,
        ),
      ).rejects.toThrow('Conflict resolution failed: 404');
    });

    it('debería descartar sin fetch al aceptar servidor', async () => {
      const { resolveConflict } = await import('../use-sync-actions');

      await resolveConflict(
        {
          url: '/api/v1/animales/123',
          method: 'PUT',
          body: '{}',
          timestamp: Date.now(),
        },
        false,
      );
      await new Promise((r) => setTimeout(r, 0));

      expect(fetchSpy).not.toHaveBeenCalled();
      // When accepting server, it sends DISCARD_CONFLICT_ITEM to remove from conflict queue
      expect(postMessageCalls).toContainEqual({
        type: 'DISCARD_CONFLICT_ITEM',
        payload: { url: '/api/v1/animales/123' },
      });
    });

    it('debería refrescar token y reintentar en 401 al mantener local', async () => {
      const { resolveConflict } = await import('../use-sync-actions');

      // First call returns 401
      fetchSpy.mockResolvedValueOnce(
        new Response('{"error":"Unauthorized"}', {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // Refresh token call succeeds
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({
          success: true,
          data: { accessToken: 'new-refreshed-token', expiresIn: 3600 },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // Retry with new token succeeds
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: '123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await resolveConflict(
        {
          url: '/api/v1/animales/123',
          method: 'PUT',
          body: '{"nombre":"Mi Vaca"}',
          timestamp: Date.now(),
          serverVersion: 3,
        },
        true,
      );

      // Verify the retry used the new token
      const calls = fetchSpy.mock.calls;
      const retryCall = calls[2];
      const retryHeaders = retryCall[1].headers as Headers;
      expect(retryHeaders.get('Authorization')).toBe('Bearer new-refreshed-token');
      expect(retryHeaders.get('If-Match')).toBe('3');
    });
  });
});
