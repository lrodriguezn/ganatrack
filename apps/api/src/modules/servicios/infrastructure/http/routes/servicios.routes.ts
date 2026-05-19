import type { FastifyInstance } from 'fastify'
import { authMiddleware, createIdempotencyMiddleware, storeIdempotencyResult } from '../../../../../shared/middleware/index.js'
import { InMemoryIdempotencyStore } from '../../../../../shared/lib/idempotency-store.js'
import { idParamsSchema, listPalpacionesQuerySchema, createPalpacionGrupalBodySchema } from '../schemas/palpaciones.schema.js'
import { listInseminacionesQuerySchema } from '../schemas/inseminaciones.schema.js'
import { listPartosQuerySchema, createPartoAnimalBodySchema } from '../schemas/partos.schema.js'
import { listVeterinariosQuerySchema } from '../schemas/veterinarios.schema.js'

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
import { CrearPartoUseCase } from '../../../application/use-cases/crear-parto.use-case.js'
import { ListInseminacionesGrupalesUseCase } from '../../../application/use-cases/list-inseminaciones-grupales.use-case.js'
import { GetInseminacionGrupalUseCase } from '../../../application/use-cases/get-inseminacion-grupal.use-case.js'
import { ListPartosUseCase } from '../../../application/use-cases/list-partos.use-case.js'
import { GetPartoUseCase } from '../../../application/use-cases/get-parto.use-case.js'
import { ListVeterinariosGrupalesUseCase } from '../../../application/use-cases/list-veterinarios-grupales.use-case.js'
import { GetVeterinarioGrupalUseCase } from '../../../application/use-cases/get-veterinario-grupal.use-case.js'

// DTOs
import type { CreatePalpacionGrupalDto } from '../../../application/dtos/palpacion.dto.js'
import type { CreatePartoAnimalDto } from '../../../application/dtos/parto.dto.js'

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
  const crearPartoUseCase = new CrearPartoUseCase(partoAnimalRepo, partoCriaRepo, txManager)
  const listInseminacionesGrupalesUseCase = new ListInseminacionesGrupalesUseCase(inseminacionGrupalRepo)
  const getInseminacionGrupalUseCase = new GetInseminacionGrupalUseCase(inseminacionGrupalRepo, inseminacionAnimalRepo)
  const listPartosUseCase = new ListPartosUseCase(partoAnimalRepo)
  const getPartoUseCase = new GetPartoUseCase(partoAnimalRepo, partoCriaRepo)
  const listVeterinariosGrupalesUseCase = new ListVeterinariosGrupalesUseCase(veterinarioGrupalRepo)
  const getVeterinarioGrupalUseCase = new GetVeterinarioGrupalUseCase(veterinarioGrupalRepo, veterinarioAnimalRepo, veterinarioProductoRepo)

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
    return reply.code(200).send({ success: true, data: result })
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
    return reply.code(200).send({ success: true, data: result })
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
    return reply.code(200).send({ success: true, data: result })
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
    return reply.code(200).send({ success: true, data: result })
  })
}
