import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryIdempotencyStore } from '../idempotency-store'

describe('InMemoryIdempotencyStore', () => {
  let store: InMemoryIdempotencyStore

  beforeEach(() => {
    store = new InMemoryIdempotencyStore()
  })

  describe('get', () => {
    it('should return null for unknown key', async () => {
      const result = await store.get('unknown-key')
      expect(result).toBeNull()
    })

    it('should return stored record for valid key', async () => {
      const record = {
        key: 'test-key-123',
        resourceId: 42,
        response: { id: 42, name: 'Test' },
      }
      await store.set(record.key, record)

      const result = await store.get('test-key-123')

      expect(result).not.toBeNull()
      expect(result!.resourceId).toBe(42)
      expect(result!.response).toEqual({ id: 42, name: 'Test' })
    })

    it('should return null for expired record', async () => {
      const record = {
        key: 'expired-key',
        resourceId: 1,
        response: { id: 1 },
      }
      // Set with 1ms TTL
      await store.set(record.key, record, 1)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10))

      const result = await store.get('expired-key')
      expect(result).toBeNull()
    })
  })

  describe('set', () => {
    it('should store record with default TTL (24h)', async () => {
      const record = {
        key: 'default-ttl-key',
        resourceId: 1,
        response: { data: 'test' },
      }
      await store.set(record.key, record)

      const result = await store.get('default-ttl-key')
      expect(result).not.toBeNull()
      expect(result!.key).toBe('default-ttl-key')
      // Should still be present (not expired)
      expect(result!.expiresAt.getTime()).toBeGreaterThan(Date.now() - 1000)
    })

    it('should store record with custom TTL', async () => {
      const record = {
        key: 'custom-ttl-key',
        resourceId: 2,
        response: { data: 'custom' },
      }
      await store.set(record.key, record, 100) // 100ms

      const result = await store.get('custom-ttl-key')
      expect(result).not.toBeNull()
    })

    it('should overwrite existing key with new values', async () => {
      const record1 = {
        key: 'overwrite-key',
        resourceId: 1,
        response: { version: 1 },
      }
      await store.set(record1.key, record1)

      const record2 = {
        key: 'overwrite-key',
        resourceId: 2,
        response: { version: 2 },
      }
      await store.set(record2.key, record2)

      const result = await store.get('overwrite-key')
      expect(result!.resourceId).toBe(2)
      expect(result!.response).toEqual({ version: 2 })
    })
  })

  describe('cleanup', () => {
    it('should remove expired entries and return count', async () => {
      // Add expired entries
      await store.set('expired-1', { key: 'expired-1', resourceId: 1, response: {} }, 1)
      await store.set('expired-2', { key: 'expired-2', resourceId: 2, response: {} }, 1)
      // Add non-expired entry
      await store.set('valid', { key: 'valid', resourceId: 3, response: {} }, 60000)

      await new Promise((resolve) => setTimeout(resolve, 10))

      const removed = await store.cleanup()
      expect(removed).toBe(2)
      expect(store.size()).toBe(1)
    })

    it('should return 0 when no expired entries exist', async () => {
      await store.set('valid-1', { key: 'valid-1', resourceId: 1, response: {} }, 60000)
      await store.set('valid-2', { key: 'valid-2', resourceId: 2, response: {} }, 60000)

      const removed = await store.cleanup()
      expect(removed).toBe(0)
      expect(store.size()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return correct number of entries', async () => {
      expect(store.size()).toBe(0)

      await store.set('key-1', { key: 'key-1', resourceId: 1, response: {} })
      await store.set('key-2', { key: 'key-2', resourceId: 2, response: {} })

      expect(store.size()).toBe(2)
    })
  })

  describe('clear', () => {
    it('should remove all entries', async () => {
      await store.set('key-1', { key: 'key-1', resourceId: 1, response: {} })
      await store.set('key-2', { key: 'key-2', resourceId: 2, response: {} })

      store.clear()

      expect(store.size()).toBe(0)
      expect(await store.get('key-1')).toBeNull()
    })
  })
})
