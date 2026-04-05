import type { FastifyInstance, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { ConfiguracionController } from '../controllers/configuracion.controller.js'
import { authMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'
import {
  createConfigCalidadAnimalBodySchema,
  createConfigColorBodySchema,
  createConfigCondicionCorporalBodySchema,
  createConfigKeyValueBodySchema,
  createConfigRangoEdadBodySchema,
  createConfigRazaBodySchema,
  createConfigTipoExplotacionBodySchema,
  idParamsSchema,
  listQuerySchema,
  updateConfigCalidadAnimalBodySchema,
  updateConfigColorBodySchema,
  updateConfigCondicionCorporalBodySchema,
  updateConfigKeyValueBodySchema,
  updateConfigRangoEdadBodySchema,
  updateConfigRazaBodySchema,
  updateConfigTipoExplotacionBodySchema,
} from '../schemas/configuracion.schema.js'
import type { CreateConfigCalidadAnimalDto, CreateConfigColorDto, CreateConfigCondicionCorporalDto, CreateConfigKeyValueDto, CreateConfigRangoEdadDto, CreateConfigRazaDto, CreateConfigTipoExplotacionDto, UpdateConfigCalidadAnimalDto, UpdateConfigColorDto, UpdateConfigCondicionCorporalDto, UpdateConfigKeyValueDto, UpdateConfigRangoEdadDto, UpdateConfigRazaDto, UpdateConfigTipoExplotacionDto } from '../../../application/dtos/configuracion.dto.js'

// Common type for list queries
type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

export async function registerConfiguracionRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(ConfiguracionController)

  // ============ RAZAS ============
  // GET /api/v1/config/razas
  app.get<ListQuery>('/razas', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listRazas(request as FastifyRequest<ListQuery>, reply))

  // GET /api/v1/config/razas/:id
  app.get<IdParams>('/razas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getRaza(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/config/razas
  app.post<{ Body: CreateConfigRazaDto }>('/razas', {
    schema: { body: createConfigRazaBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.crearRaza(request, reply))

  // PUT /api/v1/config/razas/:id
  app.put<{ Params: { id: number }; Body: UpdateConfigRazaDto }>('/razas/:id', {
    schema: { params: idParamsSchema, body: updateConfigRazaBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.updateRaza(request, reply))

  // DELETE /api/v1/config/razas/:id
  app.delete<IdParams>('/razas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.deleteRaza(request as FastifyRequest<IdParams>, reply))

  // ============ CONDICIONES CORPORALES ============
  // GET /api/v1/config/condiciones-corporales
  app.get<ListQuery>('/condiciones-corporales', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listCondicionesCorporales(request as FastifyRequest<ListQuery>, reply))

  // GET /api/v1/config/condiciones-corporales/:id
  app.get<IdParams>('/condiciones-corporales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getCondicionCorporal(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/config/condiciones-corporales
  app.post<{ Body: CreateConfigCondicionCorporalDto }>('/condiciones-corporales', {
    schema: { body: createConfigCondicionCorporalBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.crearCondicionCorporal(request, reply))

  // PUT /api/v1/config/condiciones-corporales/:id
  app.put<{ Params: { id: number }; Body: UpdateConfigCondicionCorporalDto }>('/condiciones-corporales/:id', {
    schema: { params: idParamsSchema, body: updateConfigCondicionCorporalBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.updateCondicionCorporal(request, reply))

  // DELETE /api/v1/config/condiciones-corporales/:id
  app.delete<IdParams>('/condiciones-corporales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.deleteCondicionCorporal(request as FastifyRequest<IdParams>, reply))

  // ============ TIPOS EXPLOTACION ============
  // GET /api/v1/config/tipos-explotacion
  app.get<ListQuery>('/tipos-explotacion', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listTiposExplotacion(request as FastifyRequest<ListQuery>, reply))

  // GET /api/v1/config/tipos-explotacion/:id
  app.get<IdParams>('/tipos-explotacion/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getTipoExplotacion(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/config/tipos-explotacion
  app.post<{ Body: CreateConfigTipoExplotacionDto }>('/tipos-explotacion', {
    schema: { body: createConfigTipoExplotacionBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.crearTipoExplotacion(request, reply))

  // PUT /api/v1/config/tipos-explotacion/:id
  app.put<{ Params: { id: number }; Body: UpdateConfigTipoExplotacionDto }>('/tipos-explotacion/:id', {
    schema: { params: idParamsSchema, body: updateConfigTipoExplotacionBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.updateTipoExplotacion(request, reply))

  // DELETE /api/v1/config/tipos-explotacion/:id
  app.delete<IdParams>('/tipos-explotacion/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.deleteTipoExplotacion(request as FastifyRequest<IdParams>, reply))

  // ============ CALIDADES ANIMALES ============
  // GET /api/v1/config/calidades-animales
  app.get<ListQuery>('/calidades-animales', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listCalidadesAnimales(request as FastifyRequest<ListQuery>, reply))

  // GET /api/v1/config/calidades-animales/:id
  app.get<IdParams>('/calidades-animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getCalidadAnimal(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/config/calidades-animales
  app.post<{ Body: CreateConfigCalidadAnimalDto }>('/calidades-animales', {
    schema: { body: createConfigCalidadAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.crearCalidadAnimal(request, reply))

  // PUT /api/v1/config/calidades-animales/:id
  app.put<{ Params: { id: number }; Body: UpdateConfigCalidadAnimalDto }>('/calidades-animales/:id', {
    schema: { params: idParamsSchema, body: updateConfigCalidadAnimalBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.updateCalidadAnimal(request, reply))

  // DELETE /api/v1/config/calidades-animales/:id
  app.delete<IdParams>('/calidades-animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.deleteCalidadAnimal(request as FastifyRequest<IdParams>, reply))

  // ============ COLORES ============
  // GET /api/v1/config/colores
  app.get<ListQuery>('/colores', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listColores(request as FastifyRequest<ListQuery>, reply))

  // GET /api/v1/config/colores/:id
  app.get<IdParams>('/colores/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getColor(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/config/colores
  app.post<{ Body: CreateConfigColorDto }>('/colores', {
    schema: { body: createConfigColorBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.crearColor(request, reply))

  // PUT /api/v1/config/colores/:id
  app.put<{ Params: { id: number }; Body: UpdateConfigColorDto }>('/colores/:id', {
    schema: { params: idParamsSchema, body: updateConfigColorBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.updateColor(request, reply))

  // DELETE /api/v1/config/colores/:id
  app.delete<IdParams>('/colores/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.deleteColor(request as FastifyRequest<IdParams>, reply))

  // ============ RANGOS EDADES ============
  // GET /api/v1/config/rangos-edades
  app.get<ListQuery>('/rangos-edades', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listRangosEdades(request as FastifyRequest<ListQuery>, reply))

  // GET /api/v1/config/rangos-edades/:id
  app.get<IdParams>('/rangos-edades/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getRangoEdad(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/config/rangos-edades
  app.post<{ Body: CreateConfigRangoEdadDto }>('/rangos-edades', {
    schema: { body: createConfigRangoEdadBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.crearRangoEdad(request, reply))

  // PUT /api/v1/config/rangos-edades/:id
  app.put<{ Params: { id: number }; Body: UpdateConfigRangoEdadDto }>('/rangos-edades/:id', {
    schema: { params: idParamsSchema, body: updateConfigRangoEdadBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.updateRangoEdad(request, reply))

  // DELETE /api/v1/config/rangos-edades/:id
  app.delete<IdParams>('/rangos-edades/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.deleteRangoEdad(request as FastifyRequest<IdParams>, reply))

  // ============ KEY VALUES ============
  // GET /api/v1/config/key-values
  app.get<{ Querystring: { page?: number; limit?: number; opcion?: string } }>('/key-values', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listKeyValues(request, reply))

  // GET /api/v1/config/key-values/:id
  app.get<IdParams>('/key-values/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getKeyValue(request as FastifyRequest<IdParams>, reply))

  // POST /api/v1/config/key-values
  app.post<{ Body: CreateConfigKeyValueDto }>('/key-values', {
    schema: { body: createConfigKeyValueBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.crearKeyValue(request, reply))

  // PUT /api/v1/config/key-values/:id
  app.put<{ Params: { id: number }; Body: UpdateConfigKeyValueDto }>('/key-values/:id', {
    schema: { params: idParamsSchema, body: updateConfigKeyValueBodySchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.updateKeyValue(request, reply))

  // DELETE /api/v1/config/key-values/:id
  app.delete<IdParams>('/key-values/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('config:write')],
  }, async (request, reply) => controller.deleteKeyValue(request as FastifyRequest<IdParams>, reply))
}
