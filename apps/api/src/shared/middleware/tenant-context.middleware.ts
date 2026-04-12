import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/forbidden.error.js'

export async function tenantContextMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const predicatesHeader = request.headers['x-predio-id']
  console.log('[tenantContextMiddleware] X-Predio-Id header:', predicatesHeader)
  console.log('[tenantContextMiddleware] currentUser.predioIds:', (request as any).currentUser?.predioIds)

  if (!predicatesHeader) {
    // For endpoints that don't require a predicates (e.g., list user's predios)
    // the controller can handle the absence. For most endpoints, it's required.
    request.predioId = 0
    return
  }

  const predicates = Number(predicatesHeader)
  console.log('[tenantContextMiddleware] parsed predicates:', predicates)

  if (isNaN(predicates) || predicates <= 0) {
    throw new ForbiddenError('X-Predio-Id inválido')
  }

  // Validate user has access to this predicates
  const userPredioIds = (request as any).currentUser?.predioIds || []
  console.log('[tenantContextMiddleware] checking predicates:', predicates, 'in userPredioIds:', userPredioIds)
  
  if (!userPredioIds.includes(predicates)) {
    throw new ForbiddenError('No tienes acceso a este predicates')
  }

  request.predioId = predicates
}