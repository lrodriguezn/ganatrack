// apps/web/src/shared/hooks/__tests__/use-offline-queue.test.ts
/**
 * Tests for use-offline-queue.ts — React hook for offline queue management.
 *
 * Coverage targets:
 * - Returns queueCount, isOnline, add, remove, peek, flush
 * - Subscribes to online/offline events
 * - Refreshes queueCount on operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock form-queue operations
const mockQueueItems: unknown[] = [];

vi.mock('@/shared/lib/offline/form-queue', () => ({
  enqueue: vi.fn(async (item: unknown) => {
    mockQueueItems.push(item);
  }),
  remove: vi.fn(async (id: string) => {
    const idx = mockQueueItems.findIndex(
      (it: Record<string, unknown>) => it.id === id,
    );
    if (idx >= 0) mockQueueItems.splice(idx, 1);
  }),
  peek: vi.fn(async () => {
    return mockQueueItems[0] ?? null;
  }),
  flush: vi.fn(async () => {
    mockQueueItems.length = 0;
  }),
  getStatus: vi.fn(async () => ({
    count: mockQueueItems.length,
    isEmpty: mockQueueItems.length === 0,
  })),
}));

describe('useOfflineQueue', () => {
  beforeEach(() => {
    mockQueueItems.length = 0;
    // Default to online
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar queueCount inicial 0 y isOnline true', async () => {
    const { useOfflineQueue } = await import('../use-offline-queue');
    const { result } = renderHook(() => useOfflineQueue());

    expect(result.current.queueCount).toBe(0);
    expect(result.current.isOnline).toBe(true);
  });

  it('debería incrementar queueCount al agregar un item', async () => {
    const { useOfflineQueue } = await import('../use-offline-queue');
    const { result } = renderHook(() => useOfflineQueue());

    const item = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      formType: 'animal' as const,
      payload: { nombre: 'Vaca' },
      idempotencyKey: 'key-1',
      endpoint: '/api/v1/animales',
      method: 'POST' as const,
      predioId: 42,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending' as const,
    };

    await act(async () => {
      await result.current.add(item);
    });

    await waitFor(() => {
      expect(result.current.queueCount).toBe(1);
    });
  });

  it('debería decrementar queueCount al remover un item', async () => {
    const { useOfflineQueue } = await import('../use-offline-queue');
    const { result } = renderHook(() => useOfflineQueue());

    const item = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      formType: 'animal' as const,
      payload: { nombre: 'Vaca' },
      idempotencyKey: 'key-2',
      endpoint: '/api/v1/animales',
      method: 'POST' as const,
      predioId: 42,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending' as const,
    };

    await act(async () => {
      await result.current.add(item);
    });

    await waitFor(() => {
      expect(result.current.queueCount).toBe(1);
    });

    await act(async () => {
      await result.current.remove(item.id);
    });

    await waitFor(() => {
      expect(result.current.queueCount).toBe(0);
    });
  });

  it('debería retornar el item más antiguo con peek', async () => {
    const { useOfflineQueue } = await import('../use-offline-queue');
    const { result } = renderHook(() => useOfflineQueue());

    const item = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      formType: 'animal' as const,
      payload: { nombre: 'Vaca' },
      idempotencyKey: 'key-3',
      endpoint: '/api/v1/animales',
      method: 'POST' as const,
      predioId: 42,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending' as const,
    };

    await act(async () => {
      await result.current.add(item);
    });

    let peeked: typeof item | null = null;
    await act(async () => {
      peeked = await result.current.peek();
    });

    expect(peeked?.id).toBe(item.id);
  });

  it('debería limpiar la cola con flush', async () => {
    const { useOfflineQueue } = await import('../use-offline-queue');
    const { result } = renderHook(() => useOfflineQueue());

    const item = {
      id: '550e8400-e29b-41d4-a716-446655440004',
      formType: 'animal' as const,
      payload: { nombre: 'Vaca' },
      idempotencyKey: 'key-4',
      endpoint: '/api/v1/animales',
      method: 'POST' as const,
      predioId: 42,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending' as const,
    };

    await act(async () => {
      await result.current.add(item);
    });

    await waitFor(() => {
      expect(result.current.queueCount).toBe(1);
    });

    await act(async () => {
      await result.current.flush();
    });

    await waitFor(() => {
      expect(result.current.queueCount).toBe(0);
    });
  });

  it('debería actualizar isOnline cuando cambia la conectividad', async () => {
    const { useOfflineQueue } = await import('../use-offline-queue');
    const { result } = renderHook(() => useOfflineQueue());

    expect(result.current.isOnline).toBe(true);

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });

  it('debería remover listeners al desmontar', async () => {
    const { useOfflineQueue } = await import('../use-offline-queue');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOfflineQueue());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
