import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import { listPalpacionesQuerySchema, idParamsSchema } from '../schemas/palpaciones.schema.js'
import { listInseminacionesQuerySchema } from '../schemas/inseminaciones.schema.js'
import { listPartosQuerySchema } from '../schemas/partos.schema.js'
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
import { ListPalpacionesGrupalesUseCase } from '../../../application/use-cases/list-palpaciones-grupales.use-case.js'
import { GetPalpacionGrupalUseCase } from '../../../application/use-cases/get-palpacion-grupal.use-case.js'
import { ListInseminacionesGrupalesUseCase } from '../../../application/use-cases/list-inseminaciones-grupales.use-case.js'
import { GetInseminacionGrupalUseCase } from '../../../application/use-cases/get-inseminacion-grupal.use-case.js'
import { ListPartosUseCase } from '../../../application/use-cases/list-partos.use-case.js'
import { GetPartoUseCase } from '../../../application/use-cases/get-parto.use-case.js'
import { ListVeterinariosGrupalesUseCase } from '../../../application/use-cases/list-veterinarios-grupales.use-case.js'
import { GetVeterinarioGrupalUseCase } from '../../../application/use-cases/get-veterinario-grupal.use-case.js'

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
}

type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

export async function registerServiciosRoutes(app: FastifyInstance, repos: ServiciosRepos): Promise<void> {
  const {
    palpacionGrupalRepo,
    inseminacionGrupalRepo,
    partoAnimalRepo,
    veterinarioGrupalRepo,
  } = repos

  // Create use cases
  const listPalpacionesGrupalesUseCase = new ListPalpacionesGrupalesUseCase(palpacionGrupalRepo)
  const getPalpacionGrupalUseCase = new GetPalpacionGrupalUseCase(palpacionGrupalRepo)
  const listInseminacionesGrupalesUseCase = new ListInseminacionesGrupalesUseCase(inseminacionGrupalRepo)
  const getInseminacionGrupalUseCase = new GetInseminacionGrupalUseCase(inseminacionGrupalRepo)
  const listPartosUseCase = new ListPartosUseCase(partoAnimalRepo)
  const getPartoUseCase = new GetPartoUseCase(partoAnimalRepo)
  const listVeterinariosGrupalesUseCase = new ListVeterinariosGrupalesUseCase(veterinarioGrupalRepo)
  const getVeterinarioGrupalUseCase = new GetVeterinarioGrupalUseCase(veterinarioGrupalRepo)

  // ============ PALPACIONES ============
  app.get<ListQuery>('/servicios/palpaciones', {
    schema: { querystring: listPalpacionesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listPalpacionesGrupalesUseCase.execute(0, { page, limit, search })
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
    const { page = 1, limit = 20, search } = request.query
    const result = await listInseminacionesGrupalesUseCase.execute(0, { page, limit, search })
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
  app.get<ListQuery>('/servicios/partos', {
    schema: { querystring: listPartosQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listPartosUseCase.execute(0, { page, limit, search })
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
    const { page = 1, limit = 20, search } = request.query
    const result = await listVeterinariosGrupalesUseCase.execute(0, { page, limit, search })
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
