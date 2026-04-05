import type { FastifyInstance, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { PrediosController } from '../controllers/predios.controller.js'
import { authMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'
import {
  createConfigParametroPredioBodySchema, createGrupoBodySchema,
  createLoteBodySchema, createPotreroBodySchema,
  createPredioBodySchema, createSectorBodySchema,
  entityIdParamsSchema, idParamsSchema,
  listQuerySchema, updateConfigParametroPredioBodySchema,
  updateGrupoBodySchema, updateLoteBodySchema,
  updatePotreroBodySchema, updatePredioBodySchema, updateSectorBodySchema,
} from '../schemas/predios.schema.js'
import type {
  CreateConfigParametroPredioDto, CreateGrupoDto,
  CreateLoteDto, CreatePotreroDto,
  CreatePredioDto, CreateSectorDto,
  UpdateConfigParametroPredioDto, UpdateGrupoDto,
  UpdateLoteDto, UpdatePotreroDto,
  UpdatePredioDto, UpdateSectorDto,
} from '../../../application/dtos/predios.dto.js'

// Common types
type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

export async function registerPrediosRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(PrediosController)

  // ============ PREDIOS ============
  // GET /api/v1/predios
  app.get<ListQuery>('/', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.list(request as FastifyRequest<ListQuery>, reply))

  // GET /api/v1/predios/:id
  app.get<IdParams>('/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getById(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/predios
  app.post<{ Body: CreatePredioDto }>('/', {
    schema: { body: createPredioBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.crear(request, reply))

  // PUT /api/v1/predios/:id
  app.put<{ Params: { id: number }; Body: UpdatePredioDto }>('/:id', {
    schema: { params: idParamsSchema, body: updatePredioBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.update(request, reply))

  // DELETE /api/v1/predios/:id
  app.delete<IdParams>('/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.delete(request as FastifyRequest<IdParams>, reply))

  // ============ POTREROS ============
  // GET /api/v1/predios/:predioId/potreros
  app.get<{ Params: { predioId: number } } & ListQuery>('/:predioId/potreros', {
    schema: { params: idParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listPotreros(request as FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply))

  // GET /api/v1/predios/:predioId/potreros/:id
  app.get<{ Params: { predioId: number; id: number } }>('/:predioId/potreros/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getPotrero(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // POST /api/v1/predios/:predioId/potreros
  app.post<{ Params: { predioId: number }; Body: CreatePotreroDto }>('/:predioId/potreros', {
    schema: { params: idParamsSchema, body: createPotreroBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.crearPotrero(request, reply))

  // PUT /api/v1/predios/:predioId/potreros/:id
  app.put<{ Params: { predioId: number; id: number }; Body: UpdatePotreroDto }>('/:predioId/potreros/:id', {
    schema: { params: entityIdParamsSchema, body: updatePotreroBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.updatePotrero(request, reply))

  // DELETE /api/v1/predios/:predioId/potreros/:id
  app.delete<{ Params: { predioId: number; id: number } }>('/:predioId/potreros/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.deletePotrero(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // ============ SECTORES ============
  // GET /api/v1/predios/:predioId/sectores
  app.get<{ Params: { predioId: number } } & ListQuery>('/:predioId/sectores', {
    schema: { params: idParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listSectores(request as FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply))

  // GET /api/v1/predios/:predioId/sectores/:id
  app.get<{ Params: { predioId: number; id: number } }>('/:predioId/sectores/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getSector(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // POST /api/v1/predios/:predioId/sectores
  app.post<{ Params: { predioId: number }; Body: CreateSectorDto }>('/:predioId/sectores', {
    schema: { params: idParamsSchema, body: createSectorBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.crearSector(request, reply))

  // PUT /api/v1/predios/:predioId/sectores/:id
  app.put<{ Params: { predioId: number; id: number }; Body: UpdateSectorDto }>('/:predioId/sectores/:id', {
    schema: { params: entityIdParamsSchema, body: updateSectorBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.updateSector(request, reply))

  // DELETE /api/v1/predios/:predioId/sectores/:id
  app.delete<{ Params: { predioId: number; id: number } }>('/:predioId/sectores/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.deleteSector(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // ============ LOTES ============
  // GET /api/v1/predios/:predioId/lotes
  app.get<{ Params: { predioId: number } } & ListQuery>('/:predioId/lotes', {
    schema: { params: idParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listLotes(request as FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply))

  // GET /api/v1/predios/:predioId/lotes/:id
  app.get<{ Params: { predioId: number; id: number } }>('/:predioId/lotes/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getLote(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // POST /api/v1/predios/:predioId/lotes
  app.post<{ Params: { predioId: number }; Body: CreateLoteDto }>('/:predioId/lotes', {
    schema: { params: idParamsSchema, body: createLoteBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.crearLote(request, reply))

  // PUT /api/v1/predios/:predioId/lotes/:id
  app.put<{ Params: { predioId: number; id: number }; Body: UpdateLoteDto }>('/:predioId/lotes/:id', {
    schema: { params: entityIdParamsSchema, body: updateLoteBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.updateLote(request, reply))

  // DELETE /api/v1/predios/:predioId/lotes/:id
  app.delete<{ Params: { predioId: number; id: number } }>('/:predioId/lotes/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.deleteLote(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // ============ GRUPOS ============
  // GET /api/v1/predios/:predioId/grupos
  app.get<{ Params: { predioId: number } } & ListQuery>('/:predioId/grupos', {
    schema: { params: idParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listGrupos(request as FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply))

  // GET /api/v1/predios/:predioId/grupos/:id
  app.get<{ Params: { predioId: number; id: number } }>('/:predioId/grupos/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getGrupo(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // POST /api/v1/predios/:predioId/grupos
  app.post<{ Params: { predioId: number }; Body: CreateGrupoDto }>('/:predioId/grupos', {
    schema: { params: idParamsSchema, body: createGrupoBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.crearGrupo(request, reply))

  // PUT /api/v1/predios/:predioId/grupos/:id
  app.put<{ Params: { predioId: number; id: number }; Body: UpdateGrupoDto }>('/:predioId/grupos/:id', {
    schema: { params: entityIdParamsSchema, body: updateGrupoBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.updateGrupo(request, reply))

  // DELETE /api/v1/predios/:predioId/grupos/:id
  app.delete<{ Params: { predioId: number; id: number } }>('/:predioId/grupos/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.deleteGrupo(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // ============ CONFIG PARAMETROS ============
  // GET /api/v1/predios/:predioId/config-parametros
  app.get<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number } }>('/:predioId/config-parametros', {
    schema: { params: idParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listConfigParametros(request, reply))

  // GET /api/v1/predios/:predioId/config-parametros/:id
  app.get<{ Params: { predioId: number; id: number } }>('/:predioId/config-parametros/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getConfigParametro(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))

  // POST /api/v1/predios/:predioId/config-parametros
  app.post<{ Params: { predioId: number }; Body: CreateConfigParametroPredioDto }>('/:predioId/config-parametros', {
    schema: { params: idParamsSchema, body: createConfigParametroPredioBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.crearConfigParametro(request, reply))

  // PUT /api/v1/predios/:predioId/config-parametros/:id
  app.put<{ Params: { predioId: number; id: number }; Body: UpdateConfigParametroPredioDto }>('/:predioId/config-parametros/:id', {
    schema: { params: entityIdParamsSchema, body: updateConfigParametroPredioBodySchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.updateConfigParametro(request, reply))

  // DELETE /api/v1/predios/:predioId/config-parametros/:id
  app.delete<{ Params: { predioId: number; id: number } }>('/:predioId/config-parametros/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware, requirePermission('predios:write')],
  }, async (request, reply) => controller.deleteConfigParametro(request as FastifyRequest<{ Params: { predioId: number; id: number } }>, reply))
}
