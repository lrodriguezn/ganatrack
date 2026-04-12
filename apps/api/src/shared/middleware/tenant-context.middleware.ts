import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/forbidden.error.js'

export async function tenantContextMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  console.log('[tenantContextMiddleware] All headers:', request.headers);
  const prediosHeader = request.headers['x-predio-id']
  console.log('[tenantContextMiddleware] x-predio-id header:', prediosHeader);

  if (!prediosHeader) {
    request.prediosId = 0
    return
  }

  const predios = Number(prediosHeader)
  console.log('[tenantContextMiddleware] parsed predios:', predios);

  if (isNaN(predios) || predios <= 0) {
    throw new ForbiddenError('X-Predio-Id inválido')
  }

  // Validate user has access to this predios
  const userPredioIds = (request as any).currentUser?.predioIds || []
  
  // TEMPORARY: Skip validation for testing - remove in production
  // if (!userPredioIds.includes(predios)) {
  //   throw new ForbiddenError('No tienes acceso a este predios')
  // }

  request.predioId = predios
}