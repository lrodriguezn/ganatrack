// apps/api/src/shared/middleware/idempotency.middleware.ts
/**
 * Idempotency Middleware — Fastify preHandler for POST endpoints.
 *
 * Validates X-Idempotency-Key header, checks for duplicates,
 * and returns cached responses for retried requests.
 *
 * Usage:
 *   app.post('/animales', {
 *     preHandler: [authMiddleware, idempotencyMiddleware],
 *   }, handler)
 */

import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import { DuplicateIdempotencyError } from '../errors/duplicate-idempotency.error.js'
import type { IIdempotencyStore } from '../lib/idempotency-store.js'

/**
 * Regex pattern for valid idempotency keys.
 * Format: {uuid-v4}-{timestamp-ms}-{form-type}
 * Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890-1716000000000-animal
 */
const IDEMPOTENCY_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-\d{13}-(animal|palpacion|parto)$/i

/**
 * Creates a Fastify preHandler middleware for idempotency.
 *
 * @param store - The idempotency key store implementation
 * @returns Fastify preHandler function
 */
export function createIdempotencyMiddleware(store: IIdempotencyStore) {
  return async function idempotencyMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const idempotencyKey = request.headers['x-idempotency-key']

    // No key provided — proceed normally (backward compatible)
    if (!idempotencyKey || Array.isArray(idempotencyKey)) {
      return
    }

    // Validate key format
    if (!IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
      void reply.code(400).send({
        success: false,
        error: {
          code: 'INVALID_IDEMPOTENCY_KEY',
          message: 'Invalid X-Idempotency-Key format. Expected: {uuid}-{timestamp}-{formType}',
        },
      })
      return
    }

    // Check for existing key
    const existing = await store.get(idempotencyKey)
    if (existing) {
      // Return cached response with replay header
      void reply
        .code(200)
        .header('X-Idempotency-Replayed', 'true')
        .send({
          success: true,
          data: existing.response,
          idempotencyReplayed: true,
        })
      return
    }

    // New key — attach store to request for post-handler storage
    // The route handler will call storeIdempotencyResult() after success
    ;(request as any).idempotencyKey = idempotencyKey
    ;(request as any).idempotencyStore = store
  }
}

/**
 * Helper to store the idempotency result after a successful request.
 * Call this from the route handler after the use case succeeds.
 *
 * @param request - The Fastify request object
 * @param resourceId - The created/updated resource ID
 * @param response - The response body to cache
 */
export async function storeIdempotencyResult(
  request: FastifyRequest,
  resourceId: number,
  response: unknown,
): Promise<void> {
  const key = (request as any).idempotencyKey as string | undefined
  const store = (request as any).idempotencyStore as IIdempotencyStore | undefined

  if (key && store) {
    await store.set(key, { key, resourceId, response })
  }
}
