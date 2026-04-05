import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/forbidden.error.js'

export async function tenantContextMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const predioIdHeader = request.headers['x-predio-id']

  if (!predioIdHeader) {
    // For endpoints that don't require a predio (e.g., list user's predios)
    // the controller can handle the absence. For most endpoints, it's required.
    request.predioId = 0
    return
  }

  const predioId = Number(predioIdHeader)

  if (isNaN(predioId) || predioId <= 0) {
    throw new ForbiddenError('X-Predio-Id inválido')
  }

  // Validate user has access to this predio
  if (!request.currentUser.predioIds.includes(predioId)) {
    throw new ForbiddenError('No tienes acceso a este predio')
  }

  request.predioId = predioId
}
