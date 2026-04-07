import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import { listAnimalesQuerySchema, createAnimalBodySchema, idParamsSchema, updateAnimalBodySchema } from '../schemas/animales.schema.js'
import type { CreateAnimalDto, UpdateAnimalDto } from '../../../application/dtos/animal.dto.js'

// Repository interfaces
import type { IAnimalRepository } from '../../../domain/repositories/animal.repository.js'
import type { IImagenRepository } from '../../../domain/repositories/imagen.repository.js'
import type { IAnimalImagenRepository } from '../../../domain/repositories/animal-imagen.repository.js'

// Use cases
import { CrearAnimalUseCase } from '../../../application/use-cases/crear-animal.use-case.js'
import { GetAnimalUseCase } from '../../../application/use-cases/get-animal.use-case.js'
import { ListAnimalesUseCase } from '../../../application/use-cases/list-animales.use-case.js'
import { UpdateAnimalUseCase } from '../../../application/use-cases/update-animal.use-case.js'
import { DeleteAnimalUseCase } from '../../../application/use-cases/delete-animal.use-case.js'

type AnimalesRepos = {
  animalRepo: IAnimalRepository
  imagenRepo: IImagenRepository
  animalImagenRepo: IAnimalImagenRepository
}

type ListQuery = { Querystring: { page?: number; limit?: number; search?: string; estado?: string; potreroId?: number } }
type IdParams = { Params: { id: number } }

export async function registerAnimalesRoutes(app: FastifyInstance, repos: AnimalesRepos): Promise<void> {
  const { animalRepo } = repos

  // Create use cases manually (no tsyringe DI - pass deps directly)
  const crearAnimalUseCase = new CrearAnimalUseCase(animalRepo)
  const getAnimalUseCase = new GetAnimalUseCase(animalRepo)
  const listAnimalesUseCase = new ListAnimalesUseCase(animalRepo)
  const updateAnimalUseCase = new UpdateAnimalUseCase(animalRepo)
  const deleteAnimalUseCase = new DeleteAnimalUseCase(animalRepo)

  // ============ ANIMALES ============
  // GET /api/v1/animales
  app.get<ListQuery>('/animales', {
    schema: { querystring: listAnimalesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search, potreroId, estado } = request.query
    // Get activo user from auth middleware
    const currentUser = (request as any).currentUser
    const activoPredioId = currentUser?.predioIds?.[0] ?? 0
    const result = await listAnimalesUseCase.execute(activoPredioId, { page, limit, search, potreroId, estado })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  })

  // GET /api/v1/animales/:id
  app.get<IdParams>('/animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const currentUser = (request as any).currentUser
    const activoPredioId = currentUser?.predioIds?.[0] ?? 0
    const result = await getAnimalUseCase.execute(request.params.id, activoPredioId)
    return reply.code(200).send({ success: true, data: result })
  })

  // POST /api/v1/animales
  app.post<{ Body: CreateAnimalDto }>('/animales', {
    schema: { body: createAnimalBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const currentUser = (request as any).currentUser
    const activoPredioId = currentUser?.predioIds?.[0] ?? 0
    const result = await crearAnimalUseCase.execute(request.body, activoPredioId)
    return reply.code(201).send({ success: true, data: result })
  })

  // PUT /api/v1/animales/:id
  app.put<{ Params: { id: number }; Body: UpdateAnimalDto }>('/animales/:id', {
    schema: { params: idParamsSchema, body: updateAnimalBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const currentUser = (request as any).currentUser
    const activoPredioId = currentUser?.predioIds?.[0] ?? 0
    const result = await updateAnimalUseCase.execute(request.params.id, activoPredioId, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  // DELETE /api/v1/animales/:id
  app.delete<IdParams>('/animales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const currentUser = (request as any).currentUser
    const activoPredioId = currentUser?.predioIds?.[0] ?? 0
    await deleteAnimalUseCase.execute(request.params.id, activoPredioId)
    return reply.code(200).send({ success: true, data: { message: 'Animal eliminado' } })
  })
}
