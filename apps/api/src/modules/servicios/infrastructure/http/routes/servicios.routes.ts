import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { ServiciosController } from '../controllers/servicios.controller.js'
import { authMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'

// Palpaciones schemas
import {
  createPalpacionGrupalBodySchema,
  updatePalpacionGrupalBodySchema,
  listPalpacionesQuerySchema,
  createPalpacionAnimalBodySchema,
  updatePalpacionAnimalBodySchema,
  idParamsSchema,
  grupalIdParamsSchema,
} from '../schemas/palpaciones.schema.js'

// Inseminaciones schemas
import {
  createInseminacionGrupalBodySchema,
  updateInseminacionGrupalBodySchema,
  listInseminacionesQuerySchema,
  createInseminacionAnimalBodySchema,
  updateInseminacionAnimalBodySchema,
} from '../schemas/inseminaciones.schema.js'

// Partos schemas
import {
  createPartoAnimalBodySchema,
  updatePartoAnimalBodySchema,
  listPartosQuerySchema,
} from '../schemas/partos.schema.js'

// Veterinarios schemas
import {
  createVeterinarioGrupalBodySchema,
  updateVeterinarioGrupalBodySchema,
  listVeterinariosQuerySchema,
  createVeterinarioAnimalBodySchema,
  updateVeterinarioAnimalBodySchema,
} from '../schemas/veterinarios.schema.js'

export async function registerServiciosRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(ServiciosController)

  // ============ PALPACIONES ============
  // GET /api/v1/servicios/palpaciones
  app.get('/servicios/palpaciones', {
    schema: { querystring: listPalpacionesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listPalpaciones(request, reply))

  // GET /api/v1/servicios/palpaciones/:id
  app.get('/servicios/palpaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getPalpacion(request, reply))

  // POST /api/v1/servicios/palpaciones
  app.post('/servicios/palpaciones', {
    schema: { body: createPalpacionGrupalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.crearPalpacion(request, reply))

  // PUT /api/v1/servicios/palpaciones/:id
  app.put('/servicios/palpaciones/:id', {
    schema: { params: idParamsSchema, body: updatePalpacionGrupalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.updatePalpacion(request, reply))

  // DELETE /api/v1/servicios/palpaciones/:id
  app.delete('/servicios/palpaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.deletePalpacion(request, reply))

  // POST /api/v1/servicios/palpaciones/:grupalId/animales
  app.post('/servicios/palpaciones/:grupalId/animales', {
    schema: { params: grupalIdParamsSchema, body: createPalpacionAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.addPalpacionAnimal(request, reply))

  // PUT /api/v1/servicios/palpaciones/animales/:id
  app.put('/servicios/palpaciones/animales/:id', {
    schema: { params: idParamsSchema, body: updatePalpacionAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.updatePalpacionAnimal(request, reply))

  // DELETE /api/v1/servicios/palpaciones/animales/:id
  app.delete('/servicios/palpaciones/animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.removePalpacionAnimal(request, reply))

  // ============ INSEMINACIONES ============
  // GET /api/v1/servicios/inseminaciones
  app.get('/servicios/inseminaciones', {
    schema: { querystring: listInseminacionesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listInseminaciones(request, reply))

  // GET /api/v1/servicios/inseminaciones/:id
  app.get('/servicios/inseminaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getInseminacion(request, reply))

  // POST /api/v1/servicios/inseminaciones
  app.post('/servicios/inseminaciones', {
    schema: { body: createInseminacionGrupalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.crearInseminacion(request, reply))

  // PUT /api/v1/servicios/inseminaciones/:id
  app.put('/servicios/inseminaciones/:id', {
    schema: { params: idParamsSchema, body: updateInseminacionGrupalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.updateInseminacion(request, reply))

  // DELETE /api/v1/servicios/inseminaciones/:id
  app.delete('/servicios/inseminaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.deleteInseminacion(request, reply))

  // POST /api/v1/servicios/inseminaciones/:grupalId/animales
  app.post('/servicios/inseminaciones/:grupalId/animales', {
    schema: { params: grupalIdParamsSchema, body: createInseminacionAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.addInseminacionAnimal(request, reply))

  // PUT /api/v1/servicios/inseminaciones/animales/:id
  app.put('/servicios/inseminaciones/animales/:id', {
    schema: { params: idParamsSchema, body: updateInseminacionAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.updateInseminacionAnimal(request, reply))

  // DELETE /api/v1/servicios/inseminaciones/animales/:id
  app.delete('/servicios/inseminaciones/animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.removeInseminacionAnimal(request, reply))

  // ============ PARTOS ============
  // GET /api/v1/servicios/partos
  app.get('/servicios/partos', {
    schema: { querystring: listPartosQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listPartos(request, reply))

  // GET /api/v1/servicios/partos/:id
  app.get('/servicios/partos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getParto(request, reply))

  // POST /api/v1/servicios/partos
  app.post('/servicios/partos', {
    schema: { body: createPartoAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.crearParto(request, reply))

  // PUT /api/v1/servicios/partos/:id
  app.put('/servicios/partos/:id', {
    schema: { params: idParamsSchema, body: updatePartoAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.updateParto(request, reply))

  // DELETE /api/v1/servicios/partos/:id
  app.delete('/servicios/partos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.deleteParto(request, reply))

  // ============ VETERINARIOS ============
  // GET /api/v1/servicios/veterinarios
  app.get('/servicios/veterinarios', {
    schema: { querystring: listVeterinariosQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listVeterinarios(request, reply))

  // GET /api/v1/servicios/veterinarios/:id
  app.get('/servicios/veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getVeterinario(request, reply))

  // POST /api/v1/servicios/veterinarios
  app.post('/servicios/veterinarios', {
    schema: { body: createVeterinarioGrupalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.crearVeterinario(request, reply))

  // PUT /api/v1/servicios/veterinarios/:id
  app.put('/servicios/veterinarios/:id', {
    schema: { params: idParamsSchema, body: updateVeterinarioGrupalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.updateVeterinario(request, reply))

  // DELETE /api/v1/servicios/veterinarios/:id
  app.delete('/servicios/veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.deleteVeterinario(request, reply))

  // POST /api/v1/servicios/veterinarios/:grupalId/animales
  app.post('/servicios/veterinarios/:grupalId/animales', {
    schema: { params: grupalIdParamsSchema, body: createVeterinarioAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.addVeterinarioAnimal(request, reply))

  // PUT /api/v1/servicios/veterinarios/animales/:id
  app.put('/servicios/veterinarios/animales/:id', {
    schema: { params: idParamsSchema, body: updateVeterinarioAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.updateVeterinarioAnimal(request, reply))

  // DELETE /api/v1/servicios/veterinarios/animales/:id
  app.delete('/servicios/veterinarios/animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('servicios:write')],
  }, async (request, reply) => controller.removeVeterinarioAnimal(request, reply))
}
