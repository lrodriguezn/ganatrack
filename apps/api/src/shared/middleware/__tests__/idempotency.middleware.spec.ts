import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createIdempotencyMiddleware, storeIdempotencyResult } from '../idempotency.middleware'
import { InMemoryIdempotencyStore } from '../../lib/idempotency-store'

describe('idempotency middleware', () => {
  let store: InMemoryIdempotencyStore
  let middleware: ReturnType<typeof createIdempotencyMiddleware>

  function makeRequest(headers: Record<string, string | string[]>) {
    return {
      headers,
    } as any
  }

  function makeReply() {
    const reply = {
      code: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    }
    return reply
  }

  beforeEach(() => {
    store = new InMemoryIdempotencyStore()
    middleware = createIdempotencyMiddleware(store)
  })

  describe('no idempotency key', () => {
    it('should proceed normally when no key is provided', async () => {
      const request = makeRequest({})
      const reply = makeReply()

      await middleware(request, reply)

      expect(reply.code).not.toHaveBeenCalled()
      expect(reply.send).not.toHaveBeenCalled()
    })

    it('should proceed normally when key is an array', async () => {
      const request = makeRequest({ 'x-idempotency-key': ['key1', 'key2'] })
      const reply = makeReply()

      await middleware(request, reply)

      expect(reply.code).not.toHaveBeenCalled()
      expect(reply.send).not.toHaveBeenCalled()
    })
  })

  describe('invalid key format', () => {
    it('should return 400 for malformed key', async () => {
      const request = makeRequest({ 'x-idempotency-key': 'not-a-valid-key' })
      const reply = makeReply()

      await middleware(request, reply)

      expect(reply.code).toHaveBeenCalledWith(400)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'INVALID_IDEMPOTENCY_KEY' }),
        }),
      )
    })

    it('should return 400 for key missing form type', async () => {
      const request = makeRequest({
        'x-idempotency-key': 'a1b2c3d4-e5f6-4890-abcd-ef1234567890-1716000000000',
      })
      const reply = makeReply()

      await middleware(request, reply)

      expect(reply.code).toHaveBeenCalledWith(400)
    })

    it('should return 400 for key with invalid form type', async () => {
      const request = makeRequest({
        'x-idempotency-key': 'a1b2c3d4-e5f6-4890-abcd-ef1234567890-1716000000000-invalid',
      })
      const reply = makeReply()

      await middleware(request, reply)

      expect(reply.code).toHaveBeenCalledWith(400)
    })
  })

  describe('duplicate key', () => {
    it('should return cached response with replay header', async () => {
      const key = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890-1716000000000-animal'
      await store.set(key, {
        key,
        resourceId: 42,
        response: { id: 42, codigo: 'A001' },
      })

      const request = makeRequest({ 'x-idempotency-key': key })
      const reply = makeReply()

      await middleware(request, reply)

      expect(reply.code).toHaveBeenCalledWith(200)
      expect(reply.header).toHaveBeenCalledWith('X-Idempotency-Replayed', 'true')
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { id: 42, codigo: 'A001' },
          idempotencyReplayed: true,
        }),
      )
    })
  })

  describe('new key', () => {
    it('should attach key and store to request for post-handler storage', async () => {
      const key = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890-1716000000000-animal'
      const request = makeRequest({ 'x-idempotency-key': key })
      const reply = makeReply()

      await middleware(request, reply)

      // Should NOT have sent a response — handler should proceed
      expect(reply.code).not.toHaveBeenCalled()
      expect(reply.send).not.toHaveBeenCalled()

      // Should have attached key and store to request
      expect(request.idempotencyKey).toBe(key)
      expect(request.idempotencyStore).toBe(store)
    })

    it('should accept valid keys for all form types', async () => {
      const formTypes = ['animal', 'palpacion', 'parto']

      for (const formType of formTypes) {
        store.clear()
        const key = `a1b2c3d4-e5f6-4890-abcd-ef1234567890-1716000000000-${formType}`
        const request = makeRequest({ 'x-idempotency-key': key })
        const reply = makeReply()

        await middleware(request, reply)

        expect(reply.code).not.toHaveBeenCalled(),
          expect(request.idempotencyKey).toBe(key)
      }
    })
  })

  describe('storeIdempotencyResult', () => {
    it('should store result when key and store are attached', async () => {
      const key = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890-1716000000000-animal'
      const request = makeRequest({ 'x-idempotency-key': key })
      request.idempotencyKey = key
      request.idempotencyStore = store

      await storeIdempotencyResult(request, 42, { id: 42, codigo: 'A001' })

      const stored = await store.get(key)
      expect(stored).not.toBeNull()
      expect(stored!.resourceId).toBe(42)
      expect(stored!.response).toEqual({ id: 42, codigo: 'A001' })
    })

    it('should do nothing when no key is attached', async () => {
      const request = makeRequest({})
      request.idempotencyStore = store

      await storeIdempotencyResult(request, 42, { id: 42 })

      expect(store.size()).toBe(0)
    })

    it('should do nothing when no store is attached', async () => {
      const key = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890-1716000000000-animal'
      const request = makeRequest({ 'x-idempotency-key': key })
      request.idempotencyKey = key

      await storeIdempotencyResult(request, 42, { id: 42 })

      expect(store.size()).toBe(0)
    })
  })
})
