import type { FastifyInstance } from 'fastify'
import { authMiddleware, createIdempotencyMiddleware, storeIdempotencyResult } from '../../../../../shared/middleware/index.js'
import { InMemoryIdempotencyStore } from '../../../../../shared/lib/idempotency-store.js'
import { idParamsSchema, listPalpacionesQuerySchema, createPalpacionGrupalBodySchema, updatePalpacionGrupalBodySchema } from '../schemas/palpaciones.schema.js'
import { listInseminacionesQuerySchema, updateInseminacionGrupalBodySchema } from '../schemas/inseminaciones.schema.js'
import { listPartosQuerySchema, createPartoAnimalBodySchema, updatePartoAnimalBodySchema } from '../schemas/partos.schema.js'
import { listVeterinariosQuerySchema, updateVeterinarioGrupalBodySchema } from '../schemas/veterinarios.schema.js'

// Repository interfaces
import type { IPalpacionGrupalRepository } from '../../../domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionAnimalRepository } from '../../../domain/repositories/palpacion-animal.repository.js'
import type { IInseminacionGrupalRepository } from '../../../domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionAnimalRepository } from '../../../domain/repositories/inseminacion-animal.repository.js'
import type { IPartoAnimalRepository } from '../../../domain/repositories/parto-animal.repository.js'
import type { IPartoCriaRepository } from '../../../domain/repositories/parto-cria.repository.js'
import type { IVeterinarioGrupalRepository } from '../../../domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioAnimalRepository } from '../../../domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioProductoRepository } from '../../../domain/repositories/veterinario-producto.repository.js'

// Use cases
import { CrearPalpacionGrupalUseCase } from '../../../application/use-cases/crear-palpacion-grupal.use-case.js'
import { ListPalpacionesGrupalesUseCase } from '../../../application/use-cases/list-palpaciones-grupales.use-case.js'
import { GetPalpacionGrupalUseCase } from '../../../application/use-cases/get-palpacion-grupal.use-case.js'
import { UpdatePalpacionGrupalUseCase } from '../../../application/use-cases/update-palpacion-grupal.use-case.js'
import { CrearPartoUseCase } from '../../../application/use-cases/crear-parto.use-case.js'
import { UpdatePartoUseCase } from '../../../application/use-cases/update-parto.use-case.js'
import { ListInseminacionesGrupalesUseCase } from '../../../application/use-cases/list-inseminaciones-grupales.use-case.js'
import { GetInseminacionGrupalUseCase } from '../../../application/use-cases/get-inseminacion-grupal.use-case.js'
import { UpdateInseminacionGrupalUseCase } from '../../../application/use-cases/update-inseminacion-grupal.use-case.js'
import { ListPartosUseCase } from '../../../application/use-cases/list-partos.use-case.js'
import { GetPartoUseCase } from '../../../application/use-cases/get-parto.use-case.js'
import { ListVeterinariosGrupalesUseCase } from '../../../application/use-cases/list-veterinarios-grupales.use-case.js'
import { GetVeterinarioGrupalUseCase } from '../../../application/use-cases/get-veterinario-grupal.use-case.js'
import { UpdateVeterinarioGrupalUseCase } from '../../../application/use-cases/update-veterinario-grupal.use-case.js'

// DTOs
import type { CreatePalpacionGrupalDto, UpdatePalpacionGrupalDto } from '../../../application/dtos/palpacion.dto.js'
import type { CreatePartoAnimalDto, UpdatePartoAnimalDto } from '../../../application/dtos/parto.dto.js'
import type { UpdateInseminacionGrupalDto } from '../../../application/dtos/inseminacion.dto.js'
import type { UpdateVeterinarioGrupalDto } from '../../../application/dtos/veterinario.dto.js'

// Errors
import { VersionConflictError } from '../../../../../shared/errors/index.js'

// Transaction manager (needed for create use cases)
import type { ITransactionManager } from '../../../../../shared/types/transaction.js'

type ServiciosRepos = {
  palpacionGrupalRepo: IPalpacionGrupalRepository
  palpacionAnimalRepo: IPalpacionAnimalRepository
  inseminacionGrupalRepo: IInseminacionGrupalRepository
  inseminacionAnimalRepo: IInseminacionAnimalRepository
  partoAnimalRepo: IPartoAnimalRepository
  partoCriaRepo: IPartoCriaRepository
  veterinarioGrupalRepo: IVeterinarioGrupalRepository
  veterinarioAnimalRepo: IVeterinarioAnimalRepository
  veterinarioProductoRepo: IVeterinarioProductoRepository
  txManager: ITransactionManager
}

type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

// Shared idempotency store (single instance for all routes)
const idempotencyStore = new InMemoryIdempotencyStore()
const idempotencyMiddleware = createIdempotencyMiddleware(idempotencyStore)

export async function registerServiciosRoutes(app: FastifyInstance, repos: ServiciosRepos): Promise<void> {
  const {
    palpacionGrupalRepo,
    palpacionAnimalRepo,
    inseminacionGrupalRepo,
    inseminacionAnimalRepo,
    partoAnimalRepo,
    partoCriaRepo,
    veterinarioGrupalRepo,
    veterinarioAnimalRepo,
    veterinarioProductoRepo,
    txManager,
  } = repos

  // Create use cases
  const crearPalpacionGrupalUseCase = new CrearPalpacionGrupalUseCase(palpacionGrupalRepo, palpacionAnimalRepo, txManager)
  const listPalpacionesGrupalesUseCase = new ListPalpacionesGrupalesUseCase(palpacionGrupalRepo)
  const getPalpacionGrupalUseCase = new GetPalpacionGrupalUseCase(palpacionGrupalRepo, palpacionAnimalRepo)
  const updatePalpacionGrupalUseCase = new UpdatePalpacionGrupalUseCase(palpacionGrupalRepo)
  const crearPartoUseCase = new CrearPartoUseCase(partoAnimalRepo, partoCriaRepo, txManager)
  const updatePartoUseCase = new UpdatePartoUseCase(partoAnimalRepo)
  const listInseminacionesGrupalesUseCase = new ListInseminacionesGrupalesUseCase(inseminacionGrupalRepo)
  const getInseminacionGrupalUseCase = new GetInseminacionGrupalUseCase(inseminacionGrupalRepo, inseminacionAnimalRepo)
  const updateInseminacionGrupalUseCase = new UpdateInseminacionGrupalUseCase(inseminacionGrupalRepo)
  const listPartosUseCase = new ListPartosUseCase(partoAnimalRepo)
  const getPartoUseCase = new GetPartoUseCase(partoAnimalRepo, partoCriaRepo)
  const listVeterinariosGrupalesUseCase = new ListVeterinariosGrupalesUseCase(veterinarioGrupalRepo)
  const getVeterinarioGrupalUseCase = new GetVeterinarioGrupalUseCase(veterinarioGrupalRepo, veterinarioAnimalRepo, veterinarioProductoRepo)
  const updateVeterinarioGrupalUseCase = new UpdateVeterinarioGrupalUseCase(veterinarioGrupalRepo)

  // ============ PALPACIONES ============
  // POST /api/v1/servicios/palpaciones
  app.post<{ Body: CreatePalpacionGrupalDto }>('/servicios/palpaciones', {
    schema: { body: createPalpacionGrupalBodySchema },
    preHandler: [authMiddleware, idempotencyMiddleware],
  }, async (request, reply) => {
    const currentUser = (request as any).currentUser
    const activoPredioId = currentUser?.predioIds?.[0] ?? 0
    const result = await crearPalpacionGrupalUseCase.execute(request.body, activoPredioId)

    await storeIdempotencyResult(request, result.id, result)

    return reply.code(201).send({ success: true, data: result })
  })

  app.get<ListQuery>('/servicios/palpaciones', {
    schema: { querystring: listPalpacionesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20 } = request.query
    const result = await listPalpacionesGrupalesUseCase.execute(0, { page, limit })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/servicios/palpaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getPalpacionGrupalUseCase.execute(request.params.id, 0)
    return reply
      .header('X-Resource-Version', result.version)
      .code(200)
      .send({ success: true, data: result })
  })

  // PUT /api/v1/servicios/palpaciones/:id
  app.put<{ Params: { id: number }; Body: UpdatePalpacionGrupalDto }>('/servicios/palpaciones/:id', {
    schema: { params: idParamsSchema, body: updatePalpacionGrupalBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) {
      return reply.code(400).send({
        success: false,
        error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } },
      })
    }

    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } },
      })
    }

    try {
      const result = await updatePalpacionGrupalUseCase.execute(request.params.id, request.body, 0, expectedVersion)
      return reply
        .header('X-Resource-Version', result.version)
        .code(200)
        .send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) {
        return reply.code(409).send({
          success: false,
          error: { code: error.code, message: error.message, details: error.details },
        })
      }
      throw error
    }
  })

  // ============ INSEMINACIONES ============
  app.get<ListQuery>('/servicios/inseminaciones', {
    schema: { querystring: listInseminacionesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20 } = request.query
    const result = await listInseminacionesGrupalesUseCase.execute(0, { page, limit })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/servicios/inseminaciones/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getInseminacionGrupalUseCase.execute(request.params.id, 0)
    return reply
      .header('X-Resource-Version', result.version)
      .code(200)
      .send({ success: true, data: result })
  })

  // PUT /api/v1/servicios/inseminaciones/:id
  app.put<{ Params: { id: number }; Body: UpdateInseminacionGrupalDto }>('/servicios/inseminaciones/:id', {
    schema: { params: idParamsSchema, body: updateInseminacionGrupalBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) {
      return reply.code(400).send({
        success: false,
        error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } },
      })
    }

    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } },
      })
    }

    try {
      const result = await updateInseminacionGrupalUseCase.execute(request.params.id, request.body, 0, expectedVersion)
      return reply
        .header('X-Resource-Version', result.version)
        .code(200)
        .send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) {
        return reply.code(409).send({
          success: false,
          error: { code: error.code, message: error.message, details: error.details },
        })
      }
      throw error
    }
  })

  // ============ PARTOS ============
  // POST /api/v1/servicios/partos
  app.post<{ Body: CreatePartoAnimalDto }>('/servicios/partos', {
    schema: { body: createPartoAnimalBodySchema },
    preHandler: [authMiddleware, idempotencyMiddleware],
  }, async (request, reply) => {
    const currentUser = (request as any).currentUser
    const activoPredioId = currentUser?.predioIds?.[0] ?? 0
    const result = await crearPartoUseCase.execute(request.body, activoPredioId)

    await storeIdempotencyResult(request, result.id, result)

    return reply.code(201).send({ success: true, data: result })
  })

  app.get<ListQuery>('/servicios/partos', {
    schema: { querystring: listPartosQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20 } = request.query
    const result = await listPartosUseCase.execute(0, { page, limit })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/servicios/partos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getPartoUseCase.execute(request.params.id, 0)
    return reply
      .header('X-Resource-Version', result.version)
      .code(200)
      .send({ success: true, data: result })
  })

  // PUT /api/v1/servicios/partos/:id
  app.put<{ Params: { id: number }; Body: UpdatePartoAnimalDto }>('/servicios/partos/:id', {
    schema: { params: idParamsSchema, body: updatePartoAnimalBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) {
      return reply.code(400).send({
        success: false,
        error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } },
      })
    }

    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } },
      })
    }

    try {
      const result = await updatePartoUseCase.execute(request.params.id, request.body, 0, expectedVersion)
      return reply
        .header('X-Resource-Version', result.version)
        .code(200)
        .send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) {
        return reply.code(409).send({
          success: false,
          error: { code: error.code, message: error.message, details: error.details },
        })
      }
      throw error
    }
  })

  // ============ VETERINARIOS ============
  app.get<ListQuery>('/servicios/veterinarios', {
    schema: { querystring: listVeterinariosQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20 } = request.query
    const result = await listVeterinariosGrupalesUseCase.execute(0, { page, limit })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/servicios/veterinarios/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getVeterinarioGrupalUseCase.execute(request.params.id, 0)
    return reply
      .header('X-Resource-Version', result.version)
      .code(200)
      .send({ success: true, data: result })
  })

  // PUT /api/v1/servicios/veterinarios/:id
  app.put<{ Params: { id: number }; Body: UpdateVeterinarioGrupalDto }>('/servicios/veterinarios/:id', {
    schema: { params: idParamsSchema, body: updateVeterinarioGrupalBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) {
      return reply.code(400).send({
        success: false,
        error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } },
      })
    }

    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } },
      })
    }

    try {
      const result = await updateVeterinarioGrupalUseCase.execute(request.params.id, request.body, 0, expectedVersion)
      return reply
        .header('X-Resource-Version', result.version)
        .code(200)
        .send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) {
        return reply.code(409).send({
          success: false,
          error: { code: error.code, message: error.message, details: error.details },
        })
      }
      throw error
    }
  })
}
