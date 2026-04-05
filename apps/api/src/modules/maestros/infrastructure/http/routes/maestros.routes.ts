import type { FastifyInstance, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { MaestrosController } from '../controllers/maestros.controller.js'
import { authMiddleware, tenantContextMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'
import {
  createVeterinarioBodySchema, updateVeterinarioBodySchema,
  createPropietarioBodySchema, updatePropietarioBodySchema,
  createHierroBodySchema, updateHierroBodySchema,
  createDiagnosticoVeterinarioBodySchema, updateDiagnosticoVeterinarioBodySchema,
  createMotivoVentaBodySchema, updateMotivoVentaBodySchema,
  createCausaMuerteBodySchema, updateCausaMuerteBodySchema,
  createLugarCompraBodySchema, updateLugarCompraBodySchema,
  createLugarVentaBodySchema, updateLugarVentaBodySchema,
  listQuerySchema, idParamsSchema,
} from '../schemas/maestros.schema.js'
import type {
  CreateVeterinarioDto, UpdateVeterinarioDto,
  CreatePropietarioDto, UpdatePropietarioDto,
  CreateHierroDto, UpdateHierroDto,
  CreateDiagnosticoVeterinarioDto, UpdateDiagnosticoVeterinarioDto,
  CreateMotivoVentaDto, UpdateMotivoVentaDto,
  CreateCausaMuerteDto, UpdateCausaMuerteDto,
  CreateLugarCompraDto, UpdateLugarCompraDto,
  CreateLugarVentaDto, UpdateLugarVentaDto,
} from '../../../application/dtos/maestros.dto.js'

// Tenant-scoped: predioId from X-Predio-Id header via tenantContextMiddleware
type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

// Global query (no tenant)
type GlobalListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type GlobalIdParams = { Params: { id: number } }

export async function registerMaestrosRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(MaestrosController)

  // ============ VETERINARIOS (tenant-scoped) ============
  app.get<ListQuery>('/veterinarios', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.listVeterinarios(request, reply))

  app.get<IdParams>('/veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.getVeterinario(request, reply))

  app.post<{ Body: CreateVeterinarioDto }>('/veterinarios', {
    schema: { body: createVeterinarioBodySchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearVeterinario(request, reply))

  app.put<IdParams & { Body: UpdateVeterinarioDto }>('/veterinarios/:id', {
    schema: { params: idParamsSchema, body: updateVeterinarioBodySchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updateVeterinario(request, reply))

  app.delete<IdParams>('/veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deleteVeterinario(request, reply))

  // ============ PROPIETARIOS (tenant-scoped) ============
  app.get<ListQuery>('/propietarios', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.listPropietarios(request, reply))

  app.get<IdParams>('/propietarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.getPropietario(request, reply))

  app.post<{ Body: CreatePropietarioDto }>('/propietarios', {
    schema: { body: createPropietarioBodySchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearPropietario(request, reply))

  app.put<IdParams & { Body: UpdatePropietarioDto }>('/propietarios/:id', {
    schema: { params: idParamsSchema, body: updatePropietarioBodySchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updatePropietario(request, reply))

  app.delete<IdParams>('/propietarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deletePropietario(request, reply))

  // ============ HIERROS (tenant-scoped) ============
  app.get<ListQuery>('/hierros', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.listHierros(request, reply))

  app.get<IdParams>('/hierros/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.getHierro(request, reply))

  app.post<{ Body: CreateHierroDto }>('/hierros', {
    schema: { body: createHierroBodySchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearHierro(request, reply))

  app.put<IdParams & { Body: UpdateHierroDto }>('/hierros/:id', {
    schema: { params: idParamsSchema, body: updateHierroBodySchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updateHierro(request, reply))

  app.delete<IdParams>('/hierros/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deleteHierro(request, reply))

  // ============ DIAGNOSTICOS VETERINARIOS (global) ============
  app.get<GlobalListQuery>('/diagnosticos-veterinarios', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listDiagnosticosVeterinarios(request, reply))

  app.get<GlobalIdParams>('/diagnosticos-veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getDiagnosticoVeterinario(request, reply))

  app.post<{ Body: CreateDiagnosticoVeterinarioDto }>('/diagnosticos-veterinarios', {
    schema: { body: createDiagnosticoVeterinarioBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearDiagnosticoVeterinario(request, reply))

  app.put<{ Params: { id: number }; Body: UpdateDiagnosticoVeterinarioDto }>('/diagnosticos-veterinarios/:id', {
    schema: { params: idParamsSchema, body: updateDiagnosticoVeterinarioBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updateDiagnosticoVeterinario(request, reply))

  app.delete<GlobalIdParams>('/diagnosticos-veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deleteDiagnosticoVeterinario(request, reply))

  // ============ MOTIVOS VENTAS (global) ============
  app.get<GlobalListQuery>('/motivos-ventas', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listMotivosVentas(request, reply))

  app.get<GlobalIdParams>('/motivos-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getMotivoVenta(request, reply))

  app.post<{ Body: CreateMotivoVentaDto }>('/motivos-ventas', {
    schema: { body: createMotivoVentaBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearMotivoVenta(request, reply))

  app.put<{ Params: { id: number }; Body: UpdateMotivoVentaDto }>('/motivos-ventas/:id', {
    schema: { params: idParamsSchema, body: updateMotivoVentaBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updateMotivoVenta(request, reply))

  app.delete<GlobalIdParams>('/motivos-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deleteMotivoVenta(request, reply))

  // ============ CAUSAS MUERTE (global) ============
  app.get<GlobalListQuery>('/causas-muerte', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listCausasMuerte(request, reply))

  app.get<GlobalIdParams>('/causas-muerte/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getCausaMuerte(request, reply))

  app.post<{ Body: CreateCausaMuerteDto }>('/causas-muerte', {
    schema: { body: createCausaMuerteBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearCausaMuerte(request, reply))

  app.put<{ Params: { id: number }; Body: UpdateCausaMuerteDto }>('/causas-muerte/:id', {
    schema: { params: idParamsSchema, body: updateCausaMuerteBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updateCausaMuerte(request, reply))

  app.delete<GlobalIdParams>('/causas-muerte/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deleteCausaMuerte(request, reply))

  // ============ LUGARES COMPRAS (global) ============
  app.get<GlobalListQuery>('/lugares-compras', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listLugaresCompras(request, reply))

  app.get<GlobalIdParams>('/lugares-compras/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getLugarCompra(request, reply))

  app.post<{ Body: CreateLugarCompraDto }>('/lugares-compras', {
    schema: { body: createLugarCompraBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearLugarCompra(request, reply))

  app.put<{ Params: { id: number }; Body: UpdateLugarCompraDto }>('/lugares-compras/:id', {
    schema: { params: idParamsSchema, body: updateLugarCompraBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updateLugarCompra(request, reply))

  app.delete<GlobalIdParams>('/lugares-compras/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deleteLugarCompra(request, reply))

  // ============ LUGARES VENTAS (global) ============
  app.get<GlobalListQuery>('/lugares-ventas', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listLugaresVentas(request, reply))

  app.get<GlobalIdParams>('/lugares-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getLugarVenta(request, reply))

  app.post<{ Body: CreateLugarVentaDto }>('/lugares-ventas', {
    schema: { body: createLugarVentaBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.crearLugarVenta(request, reply))

  app.put<{ Params: { id: number }; Body: UpdateLugarVentaDto }>('/lugares-ventas/:id', {
    schema: { params: idParamsSchema, body: updateLugarVentaBodySchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.updateLugarVenta(request, reply))

  app.delete<GlobalIdParams>('/lugares-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('maestros:write')],
  }, async (request, reply) => controller.deleteLugarVenta(request, reply))
}
