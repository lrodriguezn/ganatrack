import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/forbidden.error.js'

/**
 * Resolves the X-Predio-Id header against the authenticated user's
 * allowed predios and attaches it to `request.predioId` for downstream
 * use cases.
 *
 * Contract:
 * - When the header is missing, `request.predioId` is set to `0` and
 *   the request continues (the controller decides if the absence is a
 *   400 or 403).
 * - When the header is present but not a positive integer, throws
 *   `ForbiddenError` (403).
 * - When the header is present and the user has no `predioIds` claim
 *   or the value is not in that claim, throws `ForbiddenError` (403).
 *   This is the cross-tenant guard: a user with a valid token must not
 *   be able to query data of a predio they do not belong to by simply
 *   sending an arbitrary `X-Predio-Id` header.
 */
export async function tenantContextMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const predicatesHeader = request.headers['x-predio-id']

  if (!predicatesHeader) {
    request.predioId = 0
    return
  }

  const predicates = Number(predicatesHeader)

  if (isNaN(predicates) || predicates <= 0) {
    throw new ForbiddenError('X-Predio-Id inválido')
  }

  // Cross-tenant guard: the X-Predio-Id must be in the JWT's predioIds claim.
  // A user with no predioIds (empty array) is rejected here.
  const userPredioIds = request.currentUser.predioIds

  if (!userPredioIds.includes(predicates)) {
    throw new ForbiddenError('No tienes acceso a este predio')
  }

  request.predioId = predicates
}
