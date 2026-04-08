import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import type { IPredioRepository } from './domain/repositories/predio.repository.js'
import type { IPotreroRepository } from './domain/repositories/potrero.repository.js'
import type { ISectorRepository } from './domain/repositories/sector.repository.js'
import type { ILoteRepository } from './domain/repositories/lote.repository.js'
import type { IGrupoRepository } from './domain/repositories/grupo.repository.js'
import type { IConfigParametroPredioRepository } from './domain/repositories/config-parametro-predio.repository.js'

// Drizzle repositories
import { DrizzlePredioRepository } from './infrastructure/persistence/drizzle-predio.repository.js'
import { DrizzlePotreroRepository } from './infrastructure/persistence/drizzle-potrero.repository.js'
import { DrizzleSectorRepository } from './infrastructure/persistence/drizzle-sector.repository.js'
import { DrizzleLoteRepository } from './infrastructure/persistence/drizzle-lote.repository.js'
import { DrizzleGrupoRepository } from './infrastructure/persistence/drizzle-grupo.repository.js'
import { DrizzleConfigParametroPredioRepository } from './infrastructure/persistence/drizzle-config-parametro-predio.repository.js'

// Routes
import { registerPrediosRoutes } from './infrastructure/http/routes/predios.routes.js'

export function registerPrediosModule(): void {
  // No DI - instances created on-demand in routes
}

export async function registerPrediosModuleRoutes(app: FastifyInstance): Promise<void> {
  // Create DB client
  const db: DbClient = createClient()
  
  // Create repositories
  const propioRepo: IPredioRepository = new DrizzlePredioRepository(db)
  const potreroRepo: IPotreroRepository = new DrizzlePotreroRepository(db)
  const sectorRepo: ISectorRepository = new DrizzleSectorRepository(db)
  const loteRepo: ILoteRepository = new DrizzleLoteRepository(db)
  const grupoRepo: IGrupoRepository = new DrizzleGrupoRepository(db)
  const configParamRepo: IConfigParametroPredioRepository = new DrizzleConfigParametroPredioRepository(db)

  await registerPrediosRoutes(app, {
    propioRepo,
    potreroRepo,
    sectorRepo,
    loteRepo,
    grupoRepo,
    configParamRepo,
  })
}
