import type { FastifyInstance, FastifyRequest } from 'fastify'
import { authMiddleware, tenantContextMiddleware } from '../../../../../shared/middleware/index.js'
import { ForbiddenError } from '../../../../../shared/errors/index.js'
import { idParamsSchema, listNotificacionesQuerySchema } from '../schemas/notificaciones.schema.js'
import { ListarNotificacionesUseCase } from '../../../application/use-cases/listar-notificaciones.use-case.js'
import { ObtenerResumenUseCase } from '../../../application/use-cases/obtener-resumen.use-case.js'
import type { INotificacionRepository } from '../../../domain/repositories/notificacion.repository.js'
import type { IPreferenciaRepository } from '../../../domain/repositories/preferencia.repository.js'
import type { IPushTokenRepository } from '../../../domain/repositories/push-token.repository.js'


type NotificacionesRepos = {
  notificacionRepo: INotificacionRepository
  preferenciaRepo: IPreferenciaRepository
  pushTokenRepo: IPushTokenRepository
}

type ListQuery = { Querystring: { page?: number; limit?: number; leida?: number } }
type IdParams = { Params: { id: number } }

// Helper to get PredioId from request (tenant-scoped entities).
// Mirrors `getPredioId` in `maestros.routes.ts` to keep tenant reads
// consistent across modules. Regression B.W1.
function getPredioId(request: FastifyRequest): number {
  return (request as unknown as { predioId?: number }).predioId ?? 0
}

export async function registerNotificacionesRoutes(app: FastifyInstance, repos: NotificacionesRepos): Promise<void> {
  const { notificacionRepo } = repos
  const listarNotificacionesUseCase = new ListarNotificacionesUseCase(notificacionRepo)
  const obtenerResumenUseCase = new ObtenerResumenUseCase(notificacionRepo)

  app.get<ListQuery>('/notificaciones', {
    schema: { querystring: listNotificacionesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, leida } = request.query
    const result = await listarNotificacionesUseCase.execute(0, { page, limit, leida })
    return reply.code(200).send({ success: true, ...result })
  })

  // IMPORTANT: register /notificaciones/resumen BEFORE /notificaciones/:id
  // so the static segment wins over the :id parameter capture.
  app.get('/notificaciones/resumen', {
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => {
    const predioId = getPredioId(request)
    if (predioId <= 0) {
      throw new ForbiddenError('X-Predio-Id es requerido')
    }
    const data = await obtenerResumenUseCase.execute(predioId)
    return reply.code(200).send({ success: true, data })
  })

  app.get<IdParams>('/notificaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    return reply.code(200).send({ success: true, data: {} })
  })
}
