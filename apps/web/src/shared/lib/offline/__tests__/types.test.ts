// apps/web/src/shared/lib/offline/__tests__/types.test.ts
/**
 * Tests for offline queue types — zod schemas, idempotency key generation.
 *
 * Coverage targets:
 * - FormQueueItem zod schema validates valid/invalid items
 * - generateIdempotencyKey produces correct format
 * - Constants are exported correctly
 */

import { describe, it, expect } from 'vitest';

describe('offline/types', () => {
  describe('generateIdempotencyKey', () => {
    it('debería generar una key con formato uuid-timestamp-formType', async () => {
      const { generateIdempotencyKey } = await import('../types');
      const key = generateIdempotencyKey('animal');

      const pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-\d{13}-(animal|palpacion|parto)$/;
      expect(key).toMatch(pattern);
      expect(key.endsWith('-animal')).toBe(true);
    });

    it('debería generar keys únicas para llamadas sucesivas', async () => {
      const { generateIdempotencyKey } = await import('../types');
      const key1 = generateIdempotencyKey('animal');
      const key2 = generateIdempotencyKey('animal');

      expect(key1).not.toBe(key2);
    });

    it('debería incluir el formType correcto en la key', async () => {
      const { generateIdempotencyKey } = await import('../types');
      const animalKey = generateIdempotencyKey('animal');
      const palpacionKey = generateIdempotencyKey('palpacion');
      const partoKey = generateIdempotencyKey('parto');

      expect(animalKey.endsWith('-animal')).toBe(true);
      expect(palpacionKey.endsWith('-palpacion')).toBe(true);
      expect(partoKey.endsWith('-parto')).toBe(true);
    });

    it('debería lanzar error para formType inválido', async () => {
      const { generateIdempotencyKey } = await import('../types');
      expect(() => generateIdempotencyKey('invalid' as never)).toThrow();
    });
  });

  describe('formQueueItemSchema', () => {
    it('debería validar un item válido', async () => {
      const { formQueueItemSchema } = await import('../types');
      const validItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        formType: 'animal',
        payload: { nombre: 'Vaca Test' },
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000-1716000000000-animal',
        endpoint: '/api/v1/animales',
        method: 'POST',
        predioId: 42,
        createdAt: Date.now(),
        attempts: 0,
        status: 'pending',
      };

      const result = formQueueItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('debería rechazar un item con formType inválido', async () => {
      const { formQueueItemSchema } = await import('../types');
      const invalidItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        formType: 'invalid',
        payload: { nombre: 'Vaca Test' },
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000-1716000000000-animal',
        endpoint: '/api/v1/animales',
        method: 'POST',
        predioId: 42,
        createdAt: Date.now(),
        attempts: 0,
        status: 'pending',
      };

      const result = formQueueItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('debería rechazar un item con method distinto de POST', async () => {
      const { formQueueItemSchema } = await import('../types');
      const invalidItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        formType: 'animal',
        payload: { nombre: 'Vaca Test' },
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000-1716000000000-animal',
        endpoint: '/api/v1/animales',
        method: 'GET',
        predioId: 42,
        createdAt: Date.now(),
        attempts: 0,
        status: 'pending',
      };

      const result = formQueueItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('debería rechazar un item con status inválido', async () => {
      const { formQueueItemSchema } = await import('../types');
      const invalidItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        formType: 'animal',
        payload: { nombre: 'Vaca Test' },
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000-1716000000000-animal',
        endpoint: '/api/v1/animales',
        method: 'POST',
        predioId: 42,
        createdAt: Date.now(),
        attempts: 0,
        status: 'unknown',
      };

      const result = formQueueItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('debería aceptar campos opcionales omitidos', async () => {
      const { formQueueItemSchema } = await import('../types');
      const itemWithoutOptional = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        formType: 'palpacion',
        payload: { fecha: '2024-01-01' },
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000-1716000000000-palpacion',
        endpoint: '/api/v1/servicios/palpaciones',
        method: 'POST',
        predioId: 7,
        createdAt: Date.now(),
        attempts: 0,
        status: 'pending',
      };

      const result = formQueueItemSchema.safeParse(itemWithoutOptional);
      expect(result.success).toBe(true);
    });
  });

  describe('constants', () => {
    it('debería exportar QUEUE_KEY con valor ganatrack-form-queue', async () => {
      const { QUEUE_KEY } = await import('../types');
      expect(QUEUE_KEY).toBe('ganatrack-form-queue');
    });

    it('debería exportar MAX_QUEUE_SIZE con valor 50', async () => {
      const { MAX_QUEUE_SIZE } = await import('../types');
      expect(MAX_QUEUE_SIZE).toBe(50);
    });
  });
});
