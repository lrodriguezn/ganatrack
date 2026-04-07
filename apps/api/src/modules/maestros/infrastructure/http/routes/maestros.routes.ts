import type { FastifyInstance, FastifyRequest } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'

// Schemas
import {
  listQuerySchema,
  idParamsSchema,
  // Tenant-scoped
  createVeterinarioBodySchema,
  updateVeterinarioBodySchema,
  createPropietarioBodySchema,
  updatePropietarioBodySchema,
  createHierroBodySchema,
  updateHierroBodySchema,
  // Global
  createDiagnosticoVeterinarioBodySchema,
  updateDiagnosticoVeterinarioBodySchema,
  createMotivoVentaBodySchema,
  updateMotivoVentaBodySchema,
  createCausaMuerteBodySchema,
  updateCausaMuerteBodySchema,
  createLugarCompraBodySchema,
  updateLugarCompraBodySchema,
  createLugarVentaBodySchema,
  updateLugarVentaBodySchema,
} from '../schemas/maestros.schema.js'

// Tenant-scoped use cases
import { ListVeterinariosUseCase } from '../../../application/use-cases/list-veterinarios.use-case.js'
import { GetVeterinarioUseCase } from '../../../application/use-cases/get-veterinario.use-case.js'
import { CrearVeterinarioUseCase } from '../../../application/use-cases/crear-veterinario.use-case.js'
import { UpdateVeterinarioUseCase } from '../../../application/use-cases/update-veterinario.use-case.js'
import { DeleteVeterinarioUseCase } from '../../../application/use-cases/delete-veterinario.use-case.js'

import { ListPropietariosUseCase } from '../../../application/use-cases/list-propietarios.use-case.js'
import { GetPropietarioUseCase } from '../../../application/use-cases/get-propietario.use-case.js'
import { CrearPropietarioUseCase } from '../../../application/use-cases/crear-propietario.use-case.js'
import { UpdatePropietarioUseCase } from '../../../application/use-cases/update-propietario.use-case.js'
import { DeletePropietarioUseCase } from '../../../application/use-cases/delete-propietario.use-case.js'

import { ListHierrosUseCase } from '../../../application/use-cases/list-hierros.use-case.js'
import { GetHierroUseCase } from '../../../application/use-cases/get-hierro.use-case.js'
import { CrearHierroUseCase } from '../../../application/use-cases/crear-hierro.use-case.js'
import { UpdateHierroUseCase } from '../../../application/use-cases/update-hierro.use-case.js'
import { DeleteHierroUseCase } from '../../../application/use-cases/delete-hierro.use-case.js'

// Global use cases
import { ListDiagnosticosVeterinariosUseCase } from '../../../application/use-cases/list-diagnosticos-veterinarios.use-case.js'
import { GetDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/get-diagnostico-veterinario.use-case.js'
import { CrearDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/crear-diagnostico-veterinario.use-case.js'
import { UpdateDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/update-diagnostico-veterinario.use-case.js'
import { DeleteDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/delete-diagnostico-veterinario.use-case.js'

import { ListMotivosVentasUseCase } from '../../../application/use-cases/list-motivos-ventas.use-case.js'
import { GetMotivoVentaUseCase } from '../../../application/use-cases/get-motivo-venta.use-case.js'
import { CrearMotivoVentaUseCase } from '../../../application/use-cases/crear-motivo-venta.use-case.js'
import { UpdateMotivoVentaUseCase } from '../../../application/use-cases/update-motivo-venta.use-case.js'
import { DeleteMotivoVentaUseCase } from '../../../application/use-cases/delete-motivo-venta.use-case.js'

import { ListCausasMuerteUseCase } from '../../../application/use-cases/list-causas-muerte.use-case.js'
import { GetCausaMuerteUseCase } from '../../../application/use-cases/get-causa-muerte.use-case.js'
import { CrearCausaMuerteUseCase } from '../../../application/use-cases/crear-causa-muerte.use-case.js'
import { UpdateCausaMuerteUseCase } from '../../../application/use-cases/update-causa-muerte.use-case.js'
import { DeleteCausaMuerteUseCase } from '../../../application/use-cases/delete-causa-muerte.use-case.js'

import { ListLugaresComprasUseCase } from '../../../application/use-cases/list-lugares-compras.use-case.js'
import { GetLugarCompraUseCase } from '../../../application/use-cases/get-lugar-compra.use-case.js'
import { CrearLugarCompraUseCase } from '../../../application/use-cases/crear-lugar-compra.use-case.js'
import { UpdateLugarCompraUseCase } from '../../../application/use-cases/update-lugar-compra.use-case.js'
import { DeleteLugarCompraUseCase } from '../../../application/use-cases/delete-lugar-compra.use-case.js'

import { ListLugaresVentasUseCase } from '../../../application/use-cases/list-lugares-ventas.use-case.js'
import { GetLugarVentaUseCase } from '../../../application/use-cases/get-lugar-venta.use-case.js'
import { CrearLugarVentaUseCase } from '../../../application/use-cases/crear-lugar-venta.use-case.js'
import { UpdateLugarVentaUseCase } from '../../../application/use-cases/update-lugar-venta.use-case.js'
import { DeleteLugarVentaUseCase } from '../../../application/use-cases/delete-lugar-venta.use-case.js'

// Repository interfaces
import type { IVeterinarioRepository } from '../../../domain/repositories/veterinario.repository.js'
import type { IPropietarioRepository } from '../../../domain/repositories/propietario.repository.js'
import type { IHierroRepository } from '../../../domain/repositories/hierro.repository.js'
import type { IDiagnosticoVeterinarioRepository } from '../../../domain/repositories/diagnostico-veterinario.repository.js'
import type { IMotivoVentaRepository } from '../../../domain/repositories/motivo-venta.repository.js'
import type { ICausaMuerteRepository } from '../../../domain/repositories/causa-muerte.repository.js'
import type { ILugarCompraRepository } from '../../../domain/repositories/lugar-compra.repository.js'
import type { ILugarVentaRepository } from '../../../domain/repositories/lugar-venta.repository.js'

// Types
import type {
  CreateVeterinarioDto,
  UpdateVeterinarioDto,
  CreatePropietarioDto,
  UpdatePropietarioDto,
  CreateHierroDto,
  UpdateHierroDto,
  CreateDiagnosticoVeterinarioDto,
  UpdateDiagnosticoVeterinarioDto,
  CreateMotivoVentaDto,
  UpdateMotivoVentaDto,
  CreateCausaMuerteDto,
  UpdateCausaMuerteDto,
  CreateLugarCompraDto,
  UpdateLugarCompraDto,
  CreateLugarVentaDto,
  UpdateLugarVentaDto,
} from '../../../application/dtos/maestros.dto.js'

type MaestrosRepos = {
  veterinarioRepo: IVeterinarioRepository
  propietarioRepo: IPropietarioRepository
  hierroRepo: IHierroRepository
  diagnosticoRepo: IDiagnosticoVeterinarioRepository
  motivoVentaRepo: IMotivoVentaRepository
  causaMuerteRepo: ICausaMuerteRepository
  lugarCompraRepo: ILugarCompraRepository
  lugarVentaRepo: ILugarVentaRepository
}

type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

// Helper to get PredioId from request (tenant-scoped entities)
function getPredioId(request: FastifyRequest): number {
  return (request as any).predioId || 0
}

export async function registerMaestrosRoutes(app: FastifyInstance, repos: MaestrosRepos): Promise<void> {
  const {
    veterinarioRepo,
    propietarioRepo,
    hierroRepo,
    diagnosticoRepo,
    motivoVentaRepo,
    causaMuerteRepo,
    lugarCompraRepo,
    lugarVentaRepo,
  } = repos

  // Instantiate use cases
  // Tenant-scoped
  const listVeterinariosUseCase = new ListVeterinariosUseCase(veterinarioRepo)
  const getVeterinarioUseCase = new GetVeterinarioUseCase(veterinarioRepo)
  const crearVeterinarioUseCase = new CrearVeterinarioUseCase(veterinarioRepo)
  const updateVeterinarioUseCase = new UpdateVeterinarioUseCase(veterinarioRepo)
  const deleteVeterinarioUseCase = new DeleteVeterinarioUseCase(veterinarioRepo)

  const listPropietariosUseCase = new ListPropietariosUseCase(propietarioRepo)
  const getPropietarioUseCase = new GetPropietarioUseCase(propietarioRepo)
  const crearPropietarioUseCase = new CrearPropietarioUseCase(propietarioRepo)
  const updatePropietarioUseCase = new UpdatePropietarioUseCase(propietarioRepo)
  const deletePropietarioUseCase = new DeletePropietarioUseCase(propietarioRepo)

  const listHierrosUseCase = new ListHierrosUseCase(hierroRepo)
  const getHierroUseCase = new GetHierroUseCase(hierroRepo)
  const crearHierroUseCase = new CrearHierroUseCase(hierroRepo)
  const updateHierroUseCase = new UpdateHierroUseCase(hierroRepo)
  const deleteHierroUseCase = new DeleteHierroUseCase(hierroRepo)

  // Global
  const listDiagnosticosVeterinariosUseCase = new ListDiagnosticosVeterinariosUseCase(diagnosticoRepo)
  const getDiagnosticoVeterinarioUseCase = new GetDiagnosticoVeterinarioUseCase(diagnosticoRepo)
  const crearDiagnosticoVeterinarioUseCase = new CrearDiagnosticoVeterinarioUseCase(diagnosticoRepo)
  const updateDiagnosticoVeterinarioUseCase = new UpdateDiagnosticoVeterinarioUseCase(diagnosticoRepo)
  const deleteDiagnosticoVeterinarioUseCase = new DeleteDiagnosticoVeterinarioUseCase(diagnosticoRepo)

  const listMotivosVentasUseCase = new ListMotivosVentasUseCase(motivoVentaRepo)
  const getMotivoVentaUseCase = new GetMotivoVentaUseCase(motivoVentaRepo)
  const crearMotivoVentaUseCase = new CrearMotivoVentaUseCase(motivoVentaRepo)
  const updateMotivoVentaUseCase = new UpdateMotivoVentaUseCase(motivoVentaRepo)
  const deleteMotivoVentaUseCase = new DeleteMotivoVentaUseCase(motivoVentaRepo)

  const listCausasMuerteUseCase = new ListCausasMuerteUseCase(causaMuerteRepo)
  const getCausaMuerteUseCase = new GetCausaMuerteUseCase(causaMuerteRepo)
  const crearCausaMuerteUseCase = new CrearCausaMuerteUseCase(causaMuerteRepo)
  const updateCausaMuerteUseCase = new UpdateCausaMuerteUseCase(causaMuerteRepo)
  const deleteCausaMuerteUseCase = new DeleteCausaMuerteUseCase(causaMuerteRepo)

  const listLugaresComprasUseCase = new ListLugaresComprasUseCase(lugarCompraRepo)
  const getLugarCompraUseCase = new GetLugarCompraUseCase(lugarCompraRepo)
  const crearLugarCompraUseCase = new CrearLugarCompraUseCase(lugarCompraRepo)
  const updateLugarCompraUseCase = new UpdateLugarCompraUseCase(lugarCompraRepo)
  const deleteLugarCompraUseCase = new DeleteLugarCompraUseCase(lugarCompraRepo)

  const listLugaresVentasUseCase = new ListLugaresVentasUseCase(lugarVentaRepo)
  const getLugarVentaUseCase = new GetLugarVentaUseCase(lugarVentaRepo)
  const crearLugarVentaUseCase = new CrearLugarVentaUseCase(lugarVentaRepo)
  const updateLugarVentaUseCase = new UpdateLugarVentaUseCase(lugarVentaRepo)
  const deleteLugarVentaUseCase = new DeleteLugarVentaUseCase(lugarVentaRepo)

  // ============ VETERINARIOS (tenant-scoped) ============
  app.get<ListQuery>('/veterinarios', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listVeterinariosUseCase.execute(getPredioId(request), { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getVeterinarioUseCase.execute(request.params.id, getPredioId(request))
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreateVeterinarioDto }>('/veterinarios', {
    schema: { body: createVeterinarioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearVeterinarioUseCase.execute(request.body, getPredioId(request))
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdateVeterinarioDto }>('/veterinarios/:id', {
    schema: { params: idParamsSchema, body: updateVeterinarioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateVeterinarioUseCase.execute(request.params.id, request.body, getPredioId(request))
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteVeterinarioUseCase.execute(request.params.id, getPredioId(request))
    return reply.code(200).send({ success: true, data: { message: 'Veterinario eliminado' } })
  })

  // ============ PROPIETARIOS (tenant-scoped) ============
  app.get<ListQuery>('/propietarios', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listPropietariosUseCase.execute(getPredioId(request), { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/propietarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getPropietarioUseCase.execute(request.params.id, getPredioId(request))
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreatePropietarioDto }>('/propietarios', {
    schema: { body: createPropietarioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearPropietarioUseCase.execute(request.body, getPredioId(request))
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdatePropietarioDto }>('/propietarios/:id', {
    schema: { params: idParamsSchema, body: updatePropietarioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updatePropietarioUseCase.execute(request.params.id, request.body, getPredioId(request))
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/propietarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deletePropietarioUseCase.execute(request.params.id, getPredioId(request))
    return reply.code(200).send({ success: true, data: { message: 'Propietario eliminado' } })
  })

  // ============ HIERROS (tenant-scoped) ============
  app.get<ListQuery>('/hierros', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listHierrosUseCase.execute(getPredioId(request), { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/hierros/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getHierroUseCase.execute(request.params.id, getPredioId(request))
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreateHierroDto }>('/hierros', {
    schema: { body: createHierroBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearHierroUseCase.execute(request.body, getPredioId(request))
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdateHierroDto }>('/hierros/:id', {
    schema: { params: idParamsSchema, body: updateHierroBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateHierroUseCase.execute(request.params.id, request.body, getPredioId(request))
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/hierros/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteHierroUseCase.execute(request.params.id, getPredioId(request))
    return reply.code(200).send({ success: true, data: { message: 'Hierro eliminado' } })
  })

  // ============ DIAGNOSTICOS VETERINARIOS (global) ============
  app.get<ListQuery>('/diagnosticos', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listDiagnosticosVeterinariosUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/diagnosticos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getDiagnosticoVeterinarioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreateDiagnosticoVeterinarioDto }>('/diagnosticos', {
    schema: { body: createDiagnosticoVeterinarioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearDiagnosticoVeterinarioUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdateDiagnosticoVeterinarioDto }>('/diagnosticos/:id', {
    schema: { params: idParamsSchema, body: updateDiagnosticoVeterinarioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateDiagnosticoVeterinarioUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/diagnosticos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteDiagnosticoVeterinarioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Diagnóstico eliminado' } })
  })

  // ============ MOTIVOS VENTAS (global) ============
  app.get<ListQuery>('/motivos-ventas', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listMotivosVentasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/motivos-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getMotivoVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreateMotivoVentaDto }>('/motivos-ventas', {
    schema: { body: createMotivoVentaBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearMotivoVentaUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdateMotivoVentaDto }>('/motivos-ventas/:id', {
    schema: { params: idParamsSchema, body: updateMotivoVentaBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateMotivoVentaUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/motivos-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteMotivoVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Motivo de venta eliminado' } })
  })

  // ============ CAUSAS MUERTE (global) ============
  app.get<ListQuery>('/causas-muerte', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listCausasMuerteUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/causas-muerte/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getCausaMuerteUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreateCausaMuerteDto }>('/causas-muerte', {
    schema: { body: createCausaMuerteBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearCausaMuerteUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdateCausaMuerteDto }>('/causas-muerte/:id', {
    schema: { params: idParamsSchema, body: updateCausaMuerteBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateCausaMuerteUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/causas-muerte/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteCausaMuerteUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Causa de muerte eliminada' } })
  })

  // ============ LUGARES COMPRAS (global) ============
  app.get<ListQuery>('/lugares-compras', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listLugaresComprasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/lugares-compras/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getLugarCompraUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreateLugarCompraDto }>('/lugares-compras', {
    schema: { body: createLugarCompraBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearLugarCompraUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdateLugarCompraDto }>('/lugares-compras/:id', {
    schema: { params: idParamsSchema, body: updateLugarCompraBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateLugarCompraUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/lugares-compras/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteLugarCompraUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Lugar de compra eliminado' } })
  })

  // ============ LUGARES VENTAS (global) ============
  app.get<ListQuery>('/lugares-ventas', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listLugaresVentasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  app.get<IdParams>('/lugares-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getLugarVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  app.post<{ Body: CreateLugarVentaDto }>('/lugares-ventas', {
    schema: { body: createLugarVentaBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearLugarVentaUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: IdParams['Params']; Body: UpdateLugarVentaDto }>('/lugares-ventas/:id', {
    schema: { params: idParamsSchema, body: updateLugarVentaBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateLugarVentaUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/lugares-ventas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteLugarVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Lugar de venta eliminado' } })
  })
}
