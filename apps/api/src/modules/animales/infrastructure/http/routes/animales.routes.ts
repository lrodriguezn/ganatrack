import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { AnimalesController } from '../controllers/animales.controller.js'
import { authMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'
import {
  assignImagenBodySchema,
  createAnimalBodySchema,
  createImagenBodySchema,
  genealogiaParamsSchema,
  idParamsSchema,
  listAnimalesQuerySchema,
  listImagenesQuerySchema,
  updateAnimalBodySchema,
  updateImagenBodySchema,
} from '../schemas/animales.schema.js'

export async function registerAnimalesRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(AnimalesController)

  // ============ ANIMALES ============
  // GET /api/v1/animales
  app.get('/animales', {
    schema: {
      querystring: listAnimalesQuerySchema,
    },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listAnimales(request, reply))

  // GET /api/v1/animales/:id
  app.get('/animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getAnimal(request, reply))

  // POST /api/v1/animales
  app.post('/animales', {
    schema: { body: createAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.crearAnimal(request, reply))

  // PUT /api/v1/animales/:id
  app.put('/animales/:id', {
    schema: { params: idParamsSchema, body: updateAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.updateAnimal(request, reply))

  // DELETE /api/v1/animales/:id
  app.delete('/animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.deleteAnimal(request, reply))

  // GET /api/v1/animales/:id/genealogia
  app.get('/animales/:id/genealogia', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getGenealogia(request, reply))

  // GET /api/v1/animales/:id/imagenes
  app.get('/animales/:id/imagenes', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listAnimalImagenes(request, reply))

  // POST /api/v1/animales/:id/imagenes
  app.post('/animales/:id/imagenes', {
    schema: { params: idParamsSchema, body: assignImagenBodySchema },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.assignImagenToAnimal(request, reply))

  // DELETE /api/v1/animales/:id/imagenes/:imagenId
  app.delete('/animales/:id/imagenes/:imagenId', {
    schema: {
      params: {
        type: 'object',
        required: ['id', 'imagenId'],
        properties: {
          id: { type: 'integer' },
          imagenId: { type: 'integer' },
        },
      },
    },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.removeImagenFromAnimal(request, reply))

  // ============ IMAGENES ============
  // GET /api/v1/imagenes
  app.get('/imagenes', {
    schema: {
      querystring: listImagenesQuerySchema,
    },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listImagenes(request, reply))

  // GET /api/v1/imagenes/:id
  app.get('/imagenes/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getImagen(request, reply))

  // POST /api/v1/imagenes
  app.post('/imagenes', {
    schema: { body: createImagenBodySchema },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.crearImagen(request, reply))

  // PUT /api/v1/imagenes/:id
  app.put('/imagenes/:id', {
    schema: { params: idParamsSchema, body: updateImagenBodySchema },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.updateImagen(request, reply))

  // DELETE /api/v1/imagenes/:id
  app.delete('/imagenes/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('animales:write')],
  }, async (request, reply) => controller.deleteImagen(request, reply))

  // GET /api/v1/imagenes/:id/animales
  app.get('/imagenes/:id/animales', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listImagenAnimales(request, reply))
}
