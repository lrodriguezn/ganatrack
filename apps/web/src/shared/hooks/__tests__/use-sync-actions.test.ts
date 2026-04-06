// apps/web/src/shared/hooks/__tests__/use-sync-actions.test.ts
/**
 * Tests for use-sync-actions.ts — sync actions hook.
 *
 * Coverage targets:
 * - discardItem sends postMessage to service worker
 * - retryItem retries a failed mutation
 * - resolveConflict handles conflict resolution
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

describe('useSyncActions', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    postMessageCalls.length = 0;
    fetchSpy = vi.spyOn(globalThis, 'fetch');
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
      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/animales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"nombre":"Vaca"}',
        credentials: 'include',
      });
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
  });

  describe('resolveConflict', () => {
    it('debería enviar PUT con X-Force-Update al mantener local', async () => {
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

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/animales/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Force-Update': 'true' },
        body: '{"nombre":"Mi Vaca"}',
        credentials: 'include',
      });
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
  });
});
