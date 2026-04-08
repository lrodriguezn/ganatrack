import type { FastifyInstance, FastifyRequest } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import {
  createPredioBodySchema,
  idParamsSchema,
  listQuerySchema,
  updatePredioBodySchema,
  createPotreroBodySchema,
  updatePotreroBodySchema,
  createSectorBodySchema,
  updateSectorBodySchema,
  createLoteBodySchema,
  updateLoteBodySchema,
  createGrupoBodySchema,
  updateGrupoBodySchema,
  PredioIdParamsSchema,
  entityIdParamsSchema,
} from '../schemas/predios.schema.js'
import type {
  CreatePredioDto,
  UpdatePredioDto,
  CreatePotreroDto,
  UpdatePotreroDto,
  CreateSectorDto,
  UpdateSectorDto,
  CreateLoteDto,
  UpdateLoteDto,
  CreateGrupoDto,
  UpdateGrupoDto,
} from '../../../application/dtos/predios.dto.js'

// Repository interfaces
import type { IPredioRepository } from '../../../domain/repositories/predio.repository.js'
import type { IPotreroRepository } from '../../../domain/repositories/potrero.repository.js'
import type { ISectorRepository } from '../../../domain/repositories/sector.repository.js'
import type { ILoteRepository } from '../../../domain/repositories/lote.repository.js'
import type { IGrupoRepository } from '../../../domain/repositories/grupo.repository.js'
import type { IConfigParametroPredioRepository } from '../../../domain/repositories/config-parametro-predio.repository.js'

// Use cases - imported directly to instantiate manually
import { CrearPredioUseCase } from '../../../application/use-cases/crear-predio.use-case.js'
import { GetPredioUseCase } from '../../../application/use-cases/get-predio.use-case.js'
import { ListPrediosUseCase } from '../../../application/use-cases/list-predios.use-case.js'
import { UpdatePredioUseCase } from '../../../application/use-cases/update-predio.use-case.js'
import { DeletePredioUseCase } from '../../../application/use-cases/delete-predio.use-case.js'
import { ListPotrerosUseCase } from '../../../application/use-cases/list-potreros.use-case.js'
import { GetPotreroUseCase } from '../../../application/use-cases/get-potrero.use-case.js'
import { CrearPotreroUseCase } from '../../../application/use-cases/crear-potrero.use-case.js'
import { UpdatePotreroUseCase } from '../../../application/use-cases/update-potrero.use-case.js'
import { DeletePotreroUseCase } from '../../../application/use-cases/delete-potrero.use-case.js'
import { ListSectoresUseCase } from '../../../application/use-cases/list-sectores.use-case.js'
import { GetSectorUseCase } from '../../../application/use-cases/get-sector.use-case.js'
import { CrearSectorUseCase } from '../../../application/use-cases/crear-sector.use-case.js'
import { UpdateSectorUseCase } from '../../../application/use-cases/update-sector.use-case.js'
import { DeleteSectorUseCase } from '../../../application/use-cases/delete-sector.use-case.js'
import { ListLotesUseCase } from '../../../application/use-cases/list-lotes.use-case.js'
import { GetLoteUseCase } from '../../../application/use-cases/get-lote.use-case.js'
import { CrearLoteUseCase } from '../../../application/use-cases/crear-lote.use-case.js'
import { UpdateLoteUseCase } from '../../../application/use-cases/update-lote.use-case.js'
import { DeleteLoteUseCase } from '../../../application/use-cases/delete-lote.use-case.js'
import { ListGruposUseCase } from '../../../application/use-cases/list-grupos.use-case.js'
import { GetGrupoUseCase } from '../../../application/use-cases/get-grupo.use-case.js'
import { CrearGrupoUseCase } from '../../../application/use-cases/crear-grupo.use-case.js'
import { UpdateGrupoUseCase } from '../../../application/use-cases/update-grupo.use-case.js'
import { DeleteGrupoUseCase } from '../../../application/use-cases/delete-grupo.use-case.js'
import { ListConfigParametrosPredioUseCase } from '../../../application/use-cases/list-config-parametros-predio.use-case.js'
import { GetConfigParametroPredioUseCase } from '../../../application/use-cases/get-config-parametro-predio.use-case.js'
import { CrearConfigParametroPredioUseCase } from '../../../application/use-cases/crear-config-parametro-predio.use-case.js'
import { UpdateConfigParametroPredioUseCase } from '../../../application/use-cases/update-config-parametro-predio.use-case.js'
import { DeleteConfigParametroPredioUseCase } from '../../../application/use-cases/delete-config-parametro-predio.use-case.js'

type PrediosRepos = {
  propioRepo: IPredioRepository
  potreroRepo: IPotreroRepository
  sectorRepo: ISectorRepository
  loteRepo: ILoteRepository
  grupoRepo: IGrupoRepository
  configParamRepo: IConfigParametroPredioRepository
}

type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }
type PredioIdParams = { Params: { periodoId: number } }
type EntityIdParams = { Params: { periodoId: number; id: number } }

export async function registerPrediosRoutes(app: FastifyInstance, repos: PrediosRepos): Promise<void> {
  const { propioRepo, potreroRepo, sectorRepo, loteRepo, grupoRepo, configParamRepo } = repos

  // Create use cases manually
  const crearPredioUseCase = new CrearPredioUseCase(propioRepo)
  const getPredioUseCase = new GetPredioUseCase(propioRepo)
  const listPrediosUseCase = new ListPrediosUseCase(propioRepo)
  const updatePredioUseCase = new UpdatePredioUseCase(propioRepo)
  const deletePredioUseCase = new DeletePredioUseCase(propioRepo)
  const crearPotreroUseCase = new CrearPotreroUseCase(potreroRepo, propioRepo)
  const getPotreroUseCase = new GetPotreroUseCase(potreroRepo)
  const listPotrerosUseCase = new ListPotrerosUseCase(potreroRepo)
  const updatePotreroUseCase = new UpdatePotreroUseCase(potreroRepo)
  const deletePotreroUseCase = new DeletePotreroUseCase(potreroRepo)
  const crearSectorUseCase = new CrearSectorUseCase(sectorRepo, propioRepo)
  const getSectorUseCase = new GetSectorUseCase(sectorRepo)
  const listSectoresUseCase = new ListSectoresUseCase(sectorRepo)
  const updateSectorUseCase = new UpdateSectorUseCase(sectorRepo)
  const deleteSectorUseCase = new DeleteSectorUseCase(sectorRepo)
  const crearLoteUseCase = new CrearLoteUseCase(loteRepo, propioRepo)
  const getLoteUseCase = new GetLoteUseCase(loteRepo)
  const listLotesUseCase = new ListLotesUseCase(loteRepo)
  const updateLoteUseCase = new UpdateLoteUseCase(loteRepo)
  const deleteLoteUseCase = new DeleteLoteUseCase(loteRepo)
  const crearGrupoUseCase = new CrearGrupoUseCase(grupoRepo, propioRepo)
  const getGrupoUseCase = new GetGrupoUseCase(grupoRepo)
  const listGruposUseCase = new ListGruposUseCase(grupoRepo)
  const updateGrupoUseCase = new UpdateGrupoUseCase(grupoRepo)
  const deleteGrupoUseCase = new DeleteGrupoUseCase(grupoRepo)
  const crearConfigParamUseCase = new CrearConfigParametroPredioUseCase(configParamRepo, propioRepo)
  const getConfigParamUseCase = new GetConfigParametroPredioUseCase(configParamRepo)
  const listConfigParamsUseCase = new ListConfigParametrosPredioUseCase(configParamRepo)
  const updateConfigParamUseCase = new UpdateConfigParametroPredioUseCase(configParamRepo)
  const deleteConfigParamUseCase = new DeleteConfigParametroPredioUseCase(configParamRepo)

  // ============ PREDIOS ============
  // GET /api/v1/predios
  app.get<ListQuery>('/', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await listPrediosUseCase.execute(request.query)
    return reply.code(200).send({ success: true, ...result })
  })

  // GET /api/v1/predios/:id
  app.get<IdParams>('/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getPredioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  // POST /api/v1/predios
  app.post<{ Body: CreatePredioDto }>('/', {
    schema: { body: createPredioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearPredioUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  })

  // PUT /api/v1/predios/:id
  app.put<{ Params: { id: number }; Body: UpdatePredioDto }>('/:id', {
    schema: { params: idParamsSchema, body: updatePredioBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updatePredioUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  // DELETE /api/v1/predios/:id
  app.delete<IdParams>('/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deletePredioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Predio eliminado' } })
  })

  // ============ POTREROS (sub-recurso de Predio) ============
  // GET /api/v1/predios/:predioId/potreros
  app.get<PredioIdParams>('/:predioId/potreros', {
    schema: { params: PredioIdParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await listPotrerosUseCase.execute(request.params.predioId, request.query)
    return reply.code(200).send({ success: true, ...result })
  })

  // GET /api/v1/predios/:predioId/potreros/:id
  app.get<EntityIdParams>('/:predioId/potreros/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getPotreroUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  // POST /api/v1/predios/:predioId/potreros
  app.post<PredioIdParams>('/:predioId/potreros', {
    schema: { params: PredioIdParamsSchema, body: createPotreroBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearPotreroUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  })

  // PUT /api/v1/predios/:predioId/potreros/:id
  app.put<EntityIdParams>('/:predioId/potreros/:id', {
    schema: { params: entityIdParamsSchema, body: updatePotreroBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updatePotreroUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  // DELETE /api/v1/predios/:predioId/potreros/:id
  app.delete<EntityIdParams>('/:predioId/potreros/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deletePotreroUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Potrero eliminado' } })
  })

  // ============ SECTORES (sub-recurso de Predio) ============
  // GET /api/v1/predios/:predioId/sectores
  app.get<PredioIdParams>('/:predioId/sectores', {
    schema: { params: PredioIdParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await listSectoresUseCase.execute(request.params.predioId, request.query)
    return reply.code(200).send({ success: true, ...result })
  })

  // GET /api/v1/predios/:predioId/sectores/:id
  app.get<EntityIdParams>('/:predioId/sectores/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getSectorUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  // POST /api/v1/predios/:predioId/sectores
  app.post<PredioIdParams>('/:predioId/sectores', {
    schema: { params: PredioIdParamsSchema, body: createSectorBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearSectorUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  })

  // PUT /api/v1/predios/:predioId/sectores/:id
  app.put<EntityIdParams>('/:predioId/sectores/:id', {
    schema: { params: entityIdParamsSchema, body: updateSectorBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateSectorUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  // DELETE /api/v1/predios/:predioId/sectores/:id
  app.delete<EntityIdParams>('/:predioId/sectores/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteSectorUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Sector eliminado' } })
  })

  // ============ LOTES (sub-recurso de Predio) ============
  // GET /api/v1/predios/:predioId/lotes
  app.get<PredioIdParams>('/:predioId/lotes', {
    schema: { params: PredioIdParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await listLotesUseCase.execute(request.params.predioId, request.query)
    return reply.code(200).send({ success: true, ...result })
  })

  // GET /api/v1/predios/:predioId/lotes/:id
  app.get<EntityIdParams>('/:predioId/lotes/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getLoteUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  // POST /api/v1/predios/:predioId/lotes
  app.post<PredioIdParams>('/:predioId/lotes', {
    schema: { params: PredioIdParamsSchema, body: createLoteBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearLoteUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  })

  // PUT /api/v1/predios/:predioId/lotes/:id
  app.put<EntityIdParams>('/:predioId/lotes/:id', {
    schema: { params: entityIdParamsSchema, body: updateLoteBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateLoteUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  // DELETE /api/v1/predios/:predioId/lotes/:id
  app.delete<EntityIdParams>('/:predioId/lotes/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteLoteUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Lote eliminado' } })
  })

  // ============ GRUPOS (sub-recurso de Predio) ============
  // GET /api/v1/predios/:predioId/grupos
  app.get<PredioIdParams>('/:predioId/grupos', {
    schema: { params: PredioIdParamsSchema, querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await listGruposUseCase.execute(request.params.predioId, request.query)
    return reply.code(200).send({ success: true, ...result })
  })

  // GET /api/v1/predios/:predioId/grupos/:id
  app.get<EntityIdParams>('/:predioId/grupos/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getGrupoUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  // POST /api/v1/predios/:predioId/grupos
  app.post<PredioIdParams>('/:predioId/grupos', {
    schema: { params: PredioIdParamsSchema, body: createGrupoBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearGrupoUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  })

  // PUT /api/v1/predios/:predioId/grupos/:id
  app.put<EntityIdParams>('/:predioId/grupos/:id', {
    schema: { params: entityIdParamsSchema, body: updateGrupoBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateGrupoUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  // DELETE /api/v1/predios/:predioId/grupos/:id
  app.delete<EntityIdParams>('/:predioId/grupos/:id', {
    schema: { params: entityIdParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteGrupoUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Grupo eliminado' } })
  })
}
