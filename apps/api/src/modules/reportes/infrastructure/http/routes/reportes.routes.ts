import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import { idParamsSchema } from '../schemas/reportes.schema.js'
import type { IExportJobRepository } from '../../../domain/repositories/export-job.repository.js'

type ReportesRepos = { exportJobRepo: IExportJobRepository }
type IdParams = { Params: { id: number } }

export async function registerReportesRoutes(app: FastifyInstance, repos: ReportesRepos): Promise<void> {
  // GET /api/v1/reportes/inventario
  app.get('/reportes/inventario', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    return reply.code(200).send({ success: true, data: [], message: 'Reportes endpoint - to be implemented' })
  })

  // GET /api/v1/reportes/exportaciones
  app.get('/reportes/exportaciones', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    return reply.code(200).send({ success: true, data: [] })
  })

  // GET /api/v1/reportes/exportaciones/:id
  app.get<IdParams>('/reportes/exportaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    return reply.code(200).send({ success: true, data: {} })
  })
}
