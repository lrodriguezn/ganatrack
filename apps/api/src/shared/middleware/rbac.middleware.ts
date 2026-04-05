import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../errors/forbidden.error.js'

/**
 * Creates a preHandler that checks if the user has the required permission.
 * Permission format: "recurso:accion" (e.g., "animales:read")
 * Super-admin permission "*:admin" grants all access.
 *
 * Usage in routes:
 *   app.get('/animales', { preHandler: [authMiddleware, requirePermission('animales:read')] }, handler)
 */
export function requirePermission(requiredPermission: string) {
  return async function checkPermission(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const { roles } = request.currentUser

    // Super-admin check - grants all access
    if (roles.includes('*:admin') || roles.includes('ADMIN')) {
      return
    }

    // Check if user has the required permission
    if (!roles.includes(requiredPermission)) {
      throw new ForbiddenError(`Permiso requerido: ${requiredPermission}`)
    }
  }
}
