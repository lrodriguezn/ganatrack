import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { ImagenesController } from '../controllers/imagenes.controller.js'
import { authMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'
import {
  idParamsSchema,
  listImagenesQuerySchema,
  uploadImagenBodySchema,
} from '../schemas/imagenes.schema.js'

export async function registerImagenesRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(ImagenesController)

  // GET /api/v1/imagenes
  app.get('/imagenes', {
    schema: { querystring: listImagenesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listImagenes(request, reply))

  // GET /api/v1/imagenes/:id
  app.get('/imagenes/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getImagen(request, reply))

  // POST /api/v1/imagenes/upload
  app.post('/imagenes/upload', {
    schema: { body: uploadImagenBodySchema },
    preHandler: [authMiddleware, requirePermission('imagenes:write')],
  }, async (request, reply) => controller.uploadImagen(request, reply))

  // DELETE /api/v1/imagenes/:id
  app.delete('/imagenes/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('imagenes:write')],
  }, async (request, reply) => controller.deleteImagen(request, reply))
}
