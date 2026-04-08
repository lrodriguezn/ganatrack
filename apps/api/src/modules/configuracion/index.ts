import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Routes
import { registerConfiguracionRoutes } from './infrastructure/http/routes/configuracion.routes.js'

// Repository interfaces
import type { IConfigRazaRepository } from './domain/repositories/config-raza.repository.js'
import type { IConfigCondicionCorporalRepository } from './domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigTipoExplotacionRepository } from './domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigCalidadAnimalRepository } from './domain/repositories/config-calidad-animal.repository.js'
import type { IConfigColorRepository } from './domain/repositories/config-color.repository.js'
import type { IConfigRangoEdadRepository } from './domain/repositories/config-rango-edad.repository.js'
import type { IConfigKeyValueRepository } from './domain/repositories/config-key-value.repository.js'

// Drizzle repositories
import { DrizzleConfigRazaRepository } from './infrastructure/persistence/drizzle-config-raza.repository.js'
import { DrizzleConfigCondicionCorporalRepository } from './infrastructure/persistence/drizzle-config-condicion-corporal.repository.js'
import { DrizzleConfigTipoExplotacionRepository } from './infrastructure/persistence/drizzle-config-tipo-explotacion.repository.js'
import { DrizzleConfigCalidadAnimalRepository } from './infrastructure/persistence/drizzle-config-calidad-animal.repository.js'
import { DrizzleConfigColorRepository } from './infrastructure/persistence/drizzle-config-color.repository.js'
import { DrizzleConfigRangoEdadRepository } from './infrastructure/persistence/drizzle-config-rango-edad.repository.js'
import { DrizzleConfigKeyValueRepository } from './infrastructure/persistence/drizzle-config-key-value.repository.js'

export function registerConfiguracionModule(): void {
  // No DI - instances created on-demand in routes
}

export async function registerConfiguracionModuleRoutes(app: FastifyInstance): Promise<void> {
  // Create instances on-demand
  const db: DbClient = createClient()
  
  // Create repositories
  const razaRepo: IConfigRazaRepository = new DrizzleConfigRazaRepository(db)
  const condicionCorpRepo: IConfigCondicionCorporalRepository = new DrizzleConfigCondicionCorporalRepository(db)
  const tipoExpRepo: IConfigTipoExplotacionRepository = new DrizzleConfigTipoExplotacionRepository(db)
  const calidadAnimalRepo: IConfigCalidadAnimalRepository = new DrizzleConfigCalidadAnimalRepository(db)
  const colorRepo: IConfigColorRepository = new DrizzleConfigColorRepository(db)
  const rangoEdadRepo: IConfigRangoEdadRepository = new DrizzleConfigRangoEdadRepository(db)
  const keyValueRepo: IConfigKeyValueRepository = new DrizzleConfigKeyValueRepository(db)

  await registerConfiguracionRoutes(app, {
    razaRepo,
    condicionCorpRepo,
    tipoExpRepo,
    calidadAnimalRepo,
    colorRepo,
    rangoEdadRepo,
    keyValueRepo,
  })
}
