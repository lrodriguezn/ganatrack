import type { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/index.js'
import { verifyToken } from '../utils/jwt.utils.js'

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token ausente')
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    request.currentUser = {
      id: payload.sub,
      roles: payload.roles,
      permisos: payload.permisos,
      predioIds: payload.predioIds,
    }
  } catch {
    throw new UnauthorizedError('Token inválido o expirado')
  }
}
