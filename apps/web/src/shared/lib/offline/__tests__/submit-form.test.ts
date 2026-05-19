import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitFormWithOfflineSupport } from '../submit-form'
import * as formQueue from '../form-queue'

vi.mock('../form-queue', () => ({
  enqueue: vi.fn(),
}))

describe('submitFormWithOfflineSupport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('online mode', () => {
    it('should call submitFn with idempotency key header', async () => {
      const submitFn = vi.fn().mockResolvedValue({ id: 1, codigo: 'A001' })

      const result = await submitFormWithOfflineSupport({
        formType: 'animal',
        payload: { codigo: 'A001' },
        endpoint: '/api/v1/animales',
        predioId: 1,
        submitFn,
        isOnline: true,
      })

      expect(result.mode).toBe('online')
      expect(result.data).toEqual({ id: 1, codigo: 'A001' })
      expect(result.idempotencyKey).toMatch(/-animal$/)
      expect(submitFn).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-Idempotency-Key': expect.stringMatching(/-animal$/),
        }),
      )
    })

    it('should not enqueue when online', async () => {
      const submitFn = vi.fn().mockResolvedValue({ id: 1 })

      await submitFormWithOfflineSupport({
        formType: 'animal',
        payload: { codigo: 'A001' },
        endpoint: '/api/v1/animales',
        predioId: 1,
        submitFn,
        isOnline: true,
      })

      expect(formQueue.enqueue).not.toHaveBeenCalled()
    })
  })

  describe('offline mode', () => {
    it('should enqueue item when offline', async () => {
      const submitFn = vi.fn()

      const result = await submitFormWithOfflineSupport({
        formType: 'palpacion',
        payload: { codigo: 'PAL-001' },
        endpoint: '/api/v1/servicios/palpaciones',
        predioId: 1,
        submitFn,
        isOnline: false,
      })

      expect(result.mode).toBe('offline')
      expect(result.queueItem).toBeDefined()
      expect(result.queueItem!.formType).toBe('palpacion')
      expect(result.queueItem!.endpoint).toBe('/api/v1/servicios/palpaciones')
      expect(result.queueItem!.status).toBe('pending')
      expect(formQueue.enqueue).toHaveBeenCalledWith(result.queueItem)
    })

    it('should not call submitFn when offline', async () => {
      const submitFn = vi.fn()

      await submitFormWithOfflineSupport({
        formType: 'parto',
        payload: { animalId: 1 },
        endpoint: '/api/v1/servicios/partos',
        predioId: 1,
        submitFn,
        isOnline: false,
      })

      expect(submitFn).not.toHaveBeenCalled()
    })

    it('should generate unique idempotency key for each call', async () => {
      const submitFn = vi.fn().mockResolvedValue({ id: 1 })

      const result1 = await submitFormWithOfflineSupport({
        formType: 'animal',
        payload: { codigo: 'A001' },
        endpoint: '/api/v1/animales',
        predioId: 1,
        submitFn,
        isOnline: true,
      })

      const result2 = await submitFormWithOfflineSupport({
        formType: 'animal',
        payload: { codigo: 'A002' },
        endpoint: '/api/v1/animales',
        predioId: 1,
        submitFn,
        isOnline: true,
      })

      expect(result1.idempotencyKey).not.toBe(result2.idempotencyKey)
    })
  })
})
