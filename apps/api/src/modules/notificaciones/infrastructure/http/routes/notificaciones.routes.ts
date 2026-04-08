import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import { listNotificacionesQuerySchema, idParamsSchema } from '../schemas/notificaciones.schema.js'
import { ListarNotificacionesUseCase } from '../../../application/use-cases/listar-notificaciones.use-case.js'
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

export async function registerNotificacionesRoutes(app: FastifyInstance, repos: NotificacionesRepos): Promise<void> {
  const { notificacionRepo } = repos
  const listarNotificacionesUseCase = new ListarNotificacionesUseCase(notificacionRepo)

  app.get<ListQuery>('/notificaciones', {
    schema: { querystring: listNotificacionesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, leida } = request.query
    const result = await listarNotificacionesUseCase.execute(0, { page, limit, leida })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/notificaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    return reply.code(200).send({ success: true, data: {} })
  })
}
