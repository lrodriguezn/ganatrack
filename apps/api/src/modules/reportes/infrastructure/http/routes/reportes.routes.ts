import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { ReportesController } from '../controllers/reportes.controller.js'
import { authMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'
import {
  exportJobsQuerySchema,
  exportRequestBodySchema,
  idParamsSchema,
  jobIdParamsSchema,
  reportTipoParamsSchema,
  reportesQuerySchema,
} from '../schemas/reportes.schema.js'

export async function registerReportesRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(ReportesController)

  // ============ REPORT ENDPOINTS ============
  // All report endpoints require reportes:read permission

  // GET /api/v1/reportes/inventario
  app.get('/reportes/inventario', {
    schema: { querystring: reportesQuerySchema },
    preHandler: [authMiddleware, requirePermission('reportes:read')],
  }, async (request, reply) => controller.getInventario(request, reply))

  // GET /api/v1/reportes/reproductivo
  app.get('/reportes/reproductivo', {
    schema: { querystring: reportesQuerySchema },
    preHandler: [authMiddleware, requirePermission('reportes:read')],
  }, async (request, reply) => controller.getReproductivo(request, reply))

  // GET /api/v1/reportes/mortalidad
  app.get('/reportes/mortalidad', {
    schema: { querystring: reportesQuerySchema },
    preHandler: [authMiddleware, requirePermission('reportes:read')],
  }, async (request, reply) => controller.getMortalidad(request, reply))

  // GET /api/v1/reportes/movimiento
  app.get('/reportes/movimiento', {
    schema: { querystring: reportesQuerySchema },
    preHandler: [authMiddleware, requirePermission('reportes:read')],
  }, async (request, reply) => controller.getMovimiento(request, reply))

  // GET /api/v1/reportes/sanitario
  app.get('/reportes/sanitario', {
    schema: { querystring: reportesQuerySchema },
    preHandler: [authMiddleware, requirePermission('reportes:read')],
  }, async (request, reply) => controller.getSanitario(request, reply))

  // ============ COUNT ENDPOINT ============
  // GET /api/v1/reportes/:tipo/count
  app.get('/reportes/:tipo/count', {
    schema: {
      params: reportTipoParamsSchema,
      querystring: reportesQuerySchema,
    },
    preHandler: [authMiddleware, requirePermission('reportes:read')],
  }, async (request, reply) => controller.countReportDataHandler(request, reply))

  // ============ EXPORT ENDPOINTS ============
  // POST /api/v1/reportes/export
  app.post('/reportes/export', {
    schema: { body: exportRequestBodySchema },
    preHandler: [authMiddleware, requirePermission('reportes:export')],
  }, async (request, reply) => controller.exportReportHandler(request, reply))

  // GET /api/v1/reportes/export/:jobId/status
  app.get('/reportes/export/:jobId/status', {
    schema: { params: jobIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getExportStatusHandler(request, reply))

  // GET /api/v1/reportes/export-jobs
  app.get('/reportes/export-jobs', {
    schema: { querystring: exportJobsQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listExportJobsHandler(request, reply))

  // DELETE /api/v1/reportes/export/:jobId
  app.delete('/reportes/export/:jobId', {
    schema: { params: jobIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.deleteExportJobHandler(request, reply))

  // GET /api/v1/reportes/export/:jobId/download
  app.get('/reportes/export/:jobId/download', {
    schema: { params: jobIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.downloadExportHandler(request, reply))
}
