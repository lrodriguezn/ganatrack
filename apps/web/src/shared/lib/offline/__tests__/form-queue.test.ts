// apps/web/src/shared/lib/offline/__tests__/form-queue.test.ts
/**
 * Tests for form-queue.ts — IndexedDB queue operations.
 *
 * Coverage targets:
 * - enqueue adds item to queue
 * - dequeue removes oldest item
 * - peek returns oldest without removing
 * - flush clears all items
 * - getAll returns all items
 * - getStatus returns count and empty flag
 * - FIFO eviction when queue exceeds 50 items
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock idb-keyval before importing form-queue
const mockStore = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => mockStore.get(key) ?? undefined),
  set: vi.fn(async (key: string, value: unknown) => {
    mockStore.set(key, value);
  }),
  del: vi.fn(async (key: string) => {
    mockStore.delete(key);
  }),
}));

import type { FormQueueItem, FormType } from '../types';

let mockIdCounter = 0;

function nextUUID(): string {
  mockIdCounter++;
  // Generate valid v4-like UUIDs: 550e8400-e29b-41d4-a716-44665544xxxx
  return `550e8400-e29b-41d4-a716-44665544${String(mockIdCounter).padStart(4, '0')}`;
}

function createMockItem(overrides?: Partial<FormQueueItem>): FormQueueItem {
  const now = Date.now();
  return {
    id: nextUUID(),
    formType: 'animal' as FormType,
    payload: { nombre: 'Test' },
    idempotencyKey: `key-${now}-${mockIdCounter}`,
    endpoint: '/api/v1/animales',
    method: 'POST',
    predioId: 42,
    createdAt: now,
    attempts: 0,
    status: 'pending',
    ...overrides,
  };
}

describe('form-queue', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  describe('enqueue', () => {
    it('debería agregar un item a la cola vacía', async () => {
      const { enqueue, getAll } = await import('../form-queue');
      const item = createMockItem();

      await enqueue(item);
      const items = await getAll();

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(item.id);
    });

    it('debería agregar múltiples items en orden FIFO', async () => {
      const { enqueue, getAll } = await import('../form-queue');
      const item1 = createMockItem({ createdAt: 1000 });
      const item2 = createMockItem({ createdAt: 2000 });

      await enqueue(item1);
      await enqueue(item2);
      const items = await getAll();

      expect(items).toHaveLength(2);
      expect(items[0].id).toBe(item1.id);
      expect(items[1].id).toBe(item2.id);
    });

    it('debería evictar el item más antiguo cuando se excede el límite de 50', async () => {
      const { enqueue, getAll } = await import('../form-queue');

      // Enqueue 51 items
      const firstItem = createMockItem({ createdAt: 1000 });
      await enqueue(firstItem);

      for (let i = 0; i < 50; i++) {
        await enqueue(createMockItem({ createdAt: 2000 + i }));
      }

      const items = await getAll();
      expect(items).toHaveLength(50);
      expect(items.some((it) => it.id === firstItem.id)).toBe(false); // Oldest evicted
    });
  });

  describe('dequeue', () => {
    it('debería retornar null cuando la cola está vacía', async () => {
      const { dequeue } = await import('../form-queue');
      const result = await dequeue();
      expect(result).toBeNull();
    });

    it('debería remover y retornar el item más antiguo', async () => {
      const { enqueue, dequeue, getAll } = await import('../form-queue');
      const item1 = createMockItem({ createdAt: 1000 });
      const item2 = createMockItem({ createdAt: 2000 });

      await enqueue(item1);
      await enqueue(item2);

      const dequeued = await dequeue();
      const remaining = await getAll();

      expect(dequeued?.id).toBe(item1.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(item2.id);
    });
  });

  describe('peek', () => {
    it('debería retornar null cuando la cola está vacía', async () => {
      const { peek } = await import('../form-queue');
      const result = await peek();
      expect(result).toBeNull();
    });

    it('debería retornar el item más antiguo sin removerlo', async () => {
      const { enqueue, peek, getAll } = await import('../form-queue');
      const item1 = createMockItem({ createdAt: 1000 });
      const item2 = createMockItem({ createdAt: 2000 });

      await enqueue(item1);
      await enqueue(item2);

      const peeked = await peek();
      const all = await getAll();

      expect(peeked?.id).toBe(item1.id);
      expect(all).toHaveLength(2);
    });
  });

  describe('flush', () => {
    it('debería limpiar todos los items', async () => {
      const { enqueue, flush, getAll } = await import('../form-queue');
      await enqueue(createMockItem());
      await enqueue(createMockItem());

      await flush();
      const items = await getAll();

      expect(items).toHaveLength(0);
    });

    it('debería funcionar en cola vacía sin error', async () => {
      const { flush, getAll } = await import('../form-queue');
      await flush();
      const items = await getAll();
      expect(items).toHaveLength(0);
    });
  });

  describe('getAll', () => {
    it('debería retornar array vacío cuando no hay items', async () => {
      const { getAll } = await import('../form-queue');
      const items = await getAll();
      expect(items).toEqual([]);
    });
  });

  describe('getStatus', () => {
    it('debería retornar count 0 y isEmpty true para cola vacía', async () => {
      const { getStatus } = await import('../form-queue');
      const status = await getStatus();

      expect(status.count).toBe(0);
      expect(status.isEmpty).toBe(true);
    });

    it('debería retornar count correcto y isEmpty false', async () => {
      const { enqueue, getStatus } = await import('../form-queue');
      await enqueue(createMockItem());
      await enqueue(createMockItem());

      const status = await getStatus();
      expect(status.count).toBe(2);
      expect(status.isEmpty).toBe(false);
    });
  });

  describe('remove', () => {
    it('debería remover un item por su id', async () => {
      const { enqueue, remove, getAll } = await import('../form-queue');
      const item1 = createMockItem();
      const item2 = createMockItem();

      await enqueue(item1);
      await enqueue(item2);
      await remove(item1.id);

      const items = await getAll();
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(item2.id);
    });

    it('debería no hacer nada si el id no existe', async () => {
      const { enqueue, remove, getAll } = await import('../form-queue');
      const item = createMockItem();
      await enqueue(item);

      await remove('550e8400-e29b-41d4-a716-446655449999');
      const items = await getAll();
      expect(items).toHaveLength(1);
    });
  });
});
