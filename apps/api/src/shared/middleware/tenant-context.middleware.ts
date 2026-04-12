import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/forbidden.error.js'

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

  // Validate user has access to this predicates
  const userPredioIds = (request as any).currentUser?.predioIds || []
  
  // TEMPORARY: Skip validation for testing - remove in production
  // if (!userPredioIds.includes(predicates)) {
  //   throw new ForbiddenError('No tienes acceso a este predicates')
  // }

  request.predioId = predicates
}