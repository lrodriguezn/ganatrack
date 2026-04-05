import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import { PREDIO_REPOSITORY } from './domain/repositories/predio.repository.js'
import type { IPredioRepository } from './domain/repositories/predio.repository.js'
import { POTRERO_REPOSITORY } from './domain/repositories/potrero.repository.js'
import type { IPotreroRepository } from './domain/repositories/potrero.repository.js'
import { SECTOR_REPOSITORY } from './domain/repositories/sector.repository.js'
import type { ISectorRepository } from './domain/repositories/sector.repository.js'
import { LOTE_REPOSITORY } from './domain/repositories/lote.repository.js'
import type { ILoteRepository } from './domain/repositories/lote.repository.js'
import { GRUPO_REPOSITORY } from './domain/repositories/grupo.repository.js'
import type { IGrupoRepository } from './domain/repositories/grupo.repository.js'
import { CONFIG_PARAMETRO_PREDIO_REPOSITORY } from './domain/repositories/config-parametro-predio.repository.js'
import type { IConfigParametroPredioRepository } from './domain/repositories/config-parametro-predio.repository.js'

// Drizzle repositories
import { DrizzlePredioRepository } from './infrastructure/persistence/drizzle-predio.repository.js'
import { DrizzlePotreroRepository } from './infrastructure/persistence/drizzle-potrero.repository.js'
import { DrizzleSectorRepository } from './infrastructure/persistence/drizzle-sector.repository.js'
import { DrizzleLoteRepository } from './infrastructure/persistence/drizzle-lote.repository.js'
import { DrizzleGrupoRepository } from './infrastructure/persistence/drizzle-grupo.repository.js'
import { DrizzleConfigParametroPredioRepository } from './infrastructure/persistence/drizzle-config-parametro-predio.repository.js'

// Use cases
import { CrearPredioUseCase } from './application/use-cases/crear-predio.use-case.js'
import { GetPredioUseCase } from './application/use-cases/get-predio.use-case.js'
import { ListPrediosUseCase } from './application/use-cases/list-predios.use-case.js'
import { UpdatePredioUseCase } from './application/use-cases/update-predio.use-case.js'
import { DeletePredioUseCase } from './application/use-cases/delete-predio.use-case.js'
import { CrearPotreroUseCase } from './application/use-cases/crear-potrero.use-case.js'
import { GetPotreroUseCase } from './application/use-cases/get-potrero.use-case.js'
import { ListPotrerosUseCase } from './application/use-cases/list-potreros.use-case.js'
import { UpdatePotreroUseCase } from './application/use-cases/update-potrero.use-case.js'
import { DeletePotreroUseCase } from './application/use-cases/delete-potrero.use-case.js'
import { CrearSectorUseCase } from './application/use-cases/crear-sector.use-case.js'
import { GetSectorUseCase } from './application/use-cases/get-sector.use-case.js'
import { ListSectoresUseCase } from './application/use-cases/list-sectores.use-case.js'
import { UpdateSectorUseCase } from './application/use-cases/update-sector.use-case.js'
import { DeleteSectorUseCase } from './application/use-cases/delete-sector.use-case.js'
import { CrearLoteUseCase } from './application/use-cases/crear-lote.use-case.js'
import { GetLoteUseCase } from './application/use-cases/get-lote.use-case.js'
import { ListLotesUseCase } from './application/use-cases/list-lotes.use-case.js'
import { UpdateLoteUseCase } from './application/use-cases/update-lote.use-case.js'
import { DeleteLoteUseCase } from './application/use-cases/delete-lote.use-case.js'
import { CrearGrupoUseCase } from './application/use-cases/crear-grupo.use-case.js'
import { GetGrupoUseCase } from './application/use-cases/get-grupo.use-case.js'
import { ListGruposUseCase } from './application/use-cases/list-grupos.use-case.js'
import { UpdateGrupoUseCase } from './application/use-cases/update-grupo.use-case.js'
import { DeleteGrupoUseCase } from './application/use-cases/delete-grupo.use-case.js'
import { CrearConfigParametroPredioUseCase } from './application/use-cases/crear-config-parametro-predio.use-case.js'
import { GetConfigParametroPredioUseCase } from './application/use-cases/get-config-parametro-predio.use-case.js'
import { ListConfigParametrosPredioUseCase } from './application/use-cases/list-config-parametros-predio.use-case.js'
import { UpdateConfigParametroPredioUseCase } from './application/use-cases/update-config-parametro-predio.use-case.js'
import { DeleteConfigParametroPredioUseCase } from './application/use-cases/delete-config-parametro-predio.use-case.js'

// Routes
import { registerPrediosRoutes } from './infrastructure/http/routes/predios.routes.js'

// Export tokens
export {
  PREDIO_REPOSITORY,
  POTRERO_REPOSITORY,
  SECTOR_REPOSITORY,
  LOTE_REPOSITORY,
  GRUPO_REPOSITORY,
  CONFIG_PARAMETRO_PREDIO_REPOSITORY,
}

// DI token
const PREDIOS_DB_CLIENT = Symbol('PrediosDbClient')

export function registerPrediosModule(): void {
  const db = createClient()
  container.registerInstance<DbClient>(PREDIOS_DB_CLIENT, db)

  // Register repositories
  container.registerSingleton<IPredioRepository>(PREDIO_REPOSITORY, DrizzlePredioRepository)
  container.registerSingleton<IPotreroRepository>(POTRERO_REPOSITORY, DrizzlePotreroRepository)
  container.registerSingleton<ISectorRepository>(SECTOR_REPOSITORY, DrizzleSectorRepository)
  container.registerSingleton<ILoteRepository>(LOTE_REPOSITORY, DrizzleLoteRepository)
  container.registerSingleton<IGrupoRepository>(GRUPO_REPOSITORY, DrizzleGrupoRepository)
  container.registerSingleton<IConfigParametroPredioRepository>(CONFIG_PARAMETRO_PREDIO_REPOSITORY, DrizzleConfigParametroPredioRepository)

  // Register use cases - Predio
  container.registerSingleton(CrearPredioUseCase)
  container.registerSingleton(GetPredioUseCase)
  container.registerSingleton(ListPrediosUseCase)
  container.registerSingleton(UpdatePredioUseCase)
  container.registerSingleton(DeletePredioUseCase)

  // Register use cases - Potrero
  container.registerSingleton(CrearPotreroUseCase)
  container.registerSingleton(GetPotreroUseCase)
  container.registerSingleton(ListPotrerosUseCase)
  container.registerSingleton(UpdatePotreroUseCase)
  container.registerSingleton(DeletePotreroUseCase)

  // Register use cases - Sector
  container.registerSingleton(CrearSectorUseCase)
  container.registerSingleton(GetSectorUseCase)
  container.registerSingleton(ListSectoresUseCase)
  container.registerSingleton(UpdateSectorUseCase)
  container.registerSingleton(DeleteSectorUseCase)

  // Register use cases - Lote
  container.registerSingleton(CrearLoteUseCase)
  container.registerSingleton(GetLoteUseCase)
  container.registerSingleton(ListLotesUseCase)
  container.registerSingleton(UpdateLoteUseCase)
  container.registerSingleton(DeleteLoteUseCase)

  // Register use cases - Grupo
  container.registerSingleton(CrearGrupoUseCase)
  container.registerSingleton(GetGrupoUseCase)
  container.registerSingleton(ListGruposUseCase)
  container.registerSingleton(UpdateGrupoUseCase)
  container.registerSingleton(DeleteGrupoUseCase)

  // Register use cases - ConfigParametro
  container.registerSingleton(CrearConfigParametroPredioUseCase)
  container.registerSingleton(GetConfigParametroPredioUseCase)
  container.registerSingleton(ListConfigParametrosPredioUseCase)
  container.registerSingleton(UpdateConfigParametroPredioUseCase)
  container.registerSingleton(DeleteConfigParametroPredioUseCase)
}

export async function registerPrediosModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerPrediosRoutes(app)
}
