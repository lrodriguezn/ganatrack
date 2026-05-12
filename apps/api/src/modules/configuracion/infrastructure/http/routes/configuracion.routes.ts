import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import { listQuerySchema, idParamsSchema } from '../schemas/configuracion.schema.js'

import type { IConfigRazaRepository } from '../../../domain/repositories/config-raza.repository.js'
import type { IConfigCondicionCorporalRepository } from '../../../domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigTipoExplotacionRepository } from '../../../domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigCalidadAnimalRepository } from '../../../domain/repositories/config-calidad-animal.repository.js'
import type { IConfigColorRepository } from '../../../domain/repositories/config-color.repository.js'
import type { IConfigRangoEdadRepository } from '../../../domain/repositories/config-rango-edad.repository.js'
import type { IConfigKeyValueRepository } from '../../../domain/repositories/config-key-value.repository.js'

import { ListConfigRazasUseCase } from '../../../application/use-cases/list-config-razas.use-case.js'
import { GetConfigRazaUseCase } from '../../../application/use-cases/get-config-raza.use-case.js'
import { ListConfigTiposExplotacionUseCase } from '../../../application/use-cases/list-config-tipos-explotacion.use-case.js'
import { GetConfigTipoExplotacionUseCase } from '../../../application/use-cases/get-config-tipo-explotacion.use-case.js'
import { ListConfigCondicionesCorporalesUseCase } from '../../../application/use-cases/list-config-condiciones-corporales.use-case.js'
import { GetConfigCondicionCorporalUseCase } from '../../../application/use-cases/get-config-condicion-corporal.use-case.js'

type ConfigRepos = {
  razaRepo: IConfigRazaRepository
  condicionCorpRepo: IConfigCondicionCorporalRepository
  tipoExpRepo: IConfigTipoExplotacionRepository
  calidadAnimalRepo: IConfigCalidadAnimalRepository
  colorRepo: IConfigColorRepository
  rangoEdadRepo: IConfigRangoEdadRepository
  keyValueRepo: IConfigKeyValueRepository
}

type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

export async function registerConfiguracionRoutes(app: FastifyInstance, repos: ConfigRepos): Promise<void> {
  const { razaRepo, condicionCorpRepo, tipoExpRepo } = repos

  const listRazasUseCase = new ListConfigRazasUseCase(razaRepo)
  const getRazaUseCase = new GetConfigRazaUseCase(razaRepo)
  const listTiposExpUseCase = new ListConfigTiposExplotacionUseCase(tipoExpRepo)
  const getTipoExpUseCase = new GetConfigTipoExplotacionUseCase(tipoExpRepo)
  const listCondicionesCorpUseCase = new ListConfigCondicionesCorporalesUseCase(condicionCorpRepo)
  const getCondicionCorpUseCase = new GetConfigCondicionCorporalUseCase(condicionCorpRepo)

  // RAZAS
  app.get<ListQuery>('/razas', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listRazasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/razas/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getRazaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  // TIPOS EXPLOTACION
  app.get<ListQuery>('/tipos-explotacion', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listTiposExpUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/tipos-explotacion/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getTipoExpUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  // CONDICIONES CORPORALES
  app.get<ListQuery>('/condiciones-corporales', {
    schema: { querystring: listQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listCondicionesCorpUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/condiciones-corporales/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getCondicionCorpUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })
}
