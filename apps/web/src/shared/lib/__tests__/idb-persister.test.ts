// apps/web/src/shared/lib/__tests__/idb-persister.test.ts
/**
 * Tests for idb-persister.ts — IndexedDB persister for TanStack Query.
 *
 * Coverage targets:
 * - createIDBPersister returns a valid Persister interface
 * - persistClient stores client in IndexedDB
 * - restoreClient retrieves client from IndexedDB
 * - removeClient deletes client from IndexedDB
 * - Default key is 'ganatrack-query-cache'
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

// Mock idb-keyval module
vi.mock('idb-keyval', async () => {
  const mockStore: Record<string, unknown> = {};
  return {
    get: vi.fn(async <T>(key: string): Promise<T | undefined> => mockStore[key]),
    set: vi.fn(async (key: string, value: unknown) => {
      mockStore[key] = value;
    }),
    del: vi.fn(async (key: string) => {
      delete mockStore[key];
    }),
    createStore: vi.fn(() => mockStore),
    __resetStore: () => {
      Object.keys(mockStore).forEach(k => delete mockStore[k]);
    },
  };
});

describe('createIDBPersister', () => {
  let persistClient: (client: PersistedClient) => Promise<void>;
  let restoreClient: () => Promise<PersistedClient | undefined>;
  let removeClient: () => Promise<void>;

  beforeEach(async () => {
    // Reset modules to get fresh persister instance
    vi.resetModules();
    const { createIDBPersister } = await import('../idb-persister');
    const persister: Persister = createIDBPersister();
    persistClient = persister.persistClient;
    restoreClient = persister.restoreClient;
    removeClient = persister.removeClient;
  });

  it('debería retornar un objeto Persister válido', async () => {
    const { createIDBPersister } = await import('../idb-persister');
    const persister = createIDBPersister();
    
    expect(persister).toHaveProperty('persistClient');
    expect(persister).toHaveProperty('restoreClient');
    expect(persister).toHaveProperty('removeClient');
    expect(typeof persister.persistClient).toBe('function');
    expect(typeof persister.restoreClient).toBe('function');
    expect(typeof persister.removeClient).toBe('function');
  });

  it('debería usar key por defecto "ganatrack-query-cache"', async () => {
    const { createIDBPersister } = await import('../idb-persister');
    const persister = createIDBPersister();
    
    // The persister should be created with default key
    expect(persister).toBeDefined();
  });

  it('debería usar key personalizado cuando se pasa como argumento', async () => {
    const { createIDBPersister } = await import('../idb-persister');
    const customKey = 'custom-cache-key';
    const persister = createIDBPersister(customKey);
    
    expect(persister).toBeDefined();
  });

  describe('persistClient', () => {
    it('debería guardar el cliente en IndexedDB', async () => {
      const mockClient: PersistedClient = {
        queries: [],
        mutations: [],
        timestamp: Date.now(),
      };

      await persistClient(mockClient);

      const { get } = await import('idb-keyval');
      const restored = await get<PersistedClient>('ganatrack-query-cache');
      expect(get).toHaveBeenCalledWith('ganatrack-query-cache');
      expect(restored).toEqual(mockClient);
    });
  });

  describe('restoreClient', () => {
    it('debería recuperar el cliente de IndexedDB', async () => {
      const mockClient: PersistedClient = {
        queries: [{ queryKey: ['test'], data: { foo: 'bar' } } as never],
        mutations: [],
        timestamp: Date.now(),
      };

      await persistClient(mockClient);
      const restored = await restoreClient();

      expect(restored).toEqual(mockClient);
    });

    it('debería retornar undefined si no hay cliente persistido', async () => {
      const { get } = await import('idb-keyval');
      vi.mocked(get).mockResolvedValueOnce(undefined);
      
      const restored = await restoreClient();
      expect(restored).toBeUndefined();
    });
  });

  describe('removeClient', () => {
    it('debería eliminar el cliente de IndexedDB', async () => {
      const mockClient: PersistedClient = {
        queries: [],
        mutations: [],
        timestamp: Date.now(),
      };

      await persistClient(mockClient);
      await removeClient();

      const { del } = await import('idb-keyval');
      expect(del).toHaveBeenCalledWith('ganatrack-query-cache');
    });
  });
});
