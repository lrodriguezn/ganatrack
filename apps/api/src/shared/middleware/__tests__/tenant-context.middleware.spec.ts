/**
 * Unit tests for tenantContextMiddleware.
 *
 * Verifies:
 * - Missing X-Predio-Id header leaves request.predioId at 0 (caller decides).
 * - Invalid (non-numeric or <= 0) X-Predio-Id throws ForbiddenError.
 * - Valid X-Predio-Id that belongs to the currentUser.predioIds is accepted.
 * - Valid X-Predio-Id that does NOT belong to the currentUser.predioIds
 *   throws ForbiddenError (cross-tenant guard — R1.C1 fix).
 * - Empty currentUser.predioIds throws ForbiddenError (no tenancy claim).
 */

import { beforeEach, describe, expect, it } from 'vitest'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { tenantContextMiddleware } from '../tenant-context.middleware'
import { ForbiddenError } from '../../errors/forbidden.error.js'

type CurrentUser = {
  id: number
  roles: string[]
  permisos?: string[]
  predioIds: number[]
}

function makeRequest(headers: Record<string, string | string[]>, currentUser?: CurrentUser) {
  return {
    headers,
    currentUser: currentUser as FastifyRequest['currentUser'],
    // Will be set by the middleware when it accepts the header.
    predioId: undefined as number | undefined,
  } as unknown as FastifyRequest
}

function makeReply(): FastifyReply {
  // The middleware never calls reply on the happy path; the throw tests
  // bypass reply entirely via ForbiddenError.
  return {} as FastifyReply
}

describe('tenantContextMiddleware', () => {
  let reply: FastifyReply

  beforeEach(() => {
    reply = makeReply()
  })

  describe('no X-Predio-Id header', () => {
    it('sets request.predioId to 0 and does not throw', async () => {
      const request = makeRequest({}, { id: 1, roles: ['ADMIN'], predioIds: [1] })

      await tenantContextMiddleware(request, reply)

      expect(request.predioId).toBe(0)
    })
  })

  describe('invalid X-Predio-Id header', () => {
    it('throws ForbiddenError when the header is not numeric', async () => {
      const request = makeRequest(
        { 'x-predio-id': 'abc' },
        { id: 1, roles: ['ADMIN'], predioIds: [1] },
      )

      await expect(tenantContextMiddleware(request, reply)).rejects.toBeInstanceOf(ForbiddenError)
    })

    it('throws ForbiddenError when the header is <= 0', async () => {
      const request = makeRequest(
        { 'x-predio-id': '0' },
        { id: 1, roles: ['ADMIN'], predioIds: [1] },
      )

      await expect(tenantContextMiddleware(request, reply)).rejects.toBeInstanceOf(ForbiddenError)
    })
  })

  describe('membership check (R1.C1)', () => {
    it('accepts the header when it matches one of currentUser.predioIds', async () => {
      const request = makeRequest(
        { 'x-predio-id': '1' },
        { id: 1, roles: ['ADMIN'], predioIds: [1, 2, 3] },
      )

      await tenantContextMiddleware(request, reply)

      expect(request.predioId).toBe(1)
    })

    it('throws ForbiddenError when the header is outside currentUser.predioIds (cross-tenant)', async () => {
      const request = makeRequest(
        { 'x-predio-id': '2' },
        { id: 1, roles: ['ADMIN'], predioIds: [1] },
      )

      await expect(tenantContextMiddleware(request, reply)).rejects.toBeInstanceOf(ForbiddenError)
    })

    it('throws ForbiddenError when currentUser.predioIds is empty', async () => {
      const request = makeRequest(
        { 'x-predio-id': '1' },
        { id: 1, roles: ['ADMIN'], predioIds: [] },
      )

      await expect(tenantContextMiddleware(request, reply)).rejects.toBeInstanceOf(ForbiddenError)
    })
  })
})
