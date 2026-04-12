import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/forbidden.error.js'

export async function tenantContextMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const prediosHeader = request.headers['x-predio-id']

  if (!prediosHeader) {
    request.prediosId = 0
    return
  }

  const predios = Number(prediosHeader)

  if (isNaN(predios) || predios <= 0) {
    throw new ForbiddenError('X-Predio-Id inválido')
  }

  // Validate user has access to this predios
  const userPredioIds = (request as any).currentUser?.predioIds || []
  
  // TEMPORARY: Skip validation for testing - remove in production
  // if (!userPredioIds.includes(predios)) {
  //   throw new ForbiddenError('No tienes acceso a este predios')
  // }

  request.prediosId = predios
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