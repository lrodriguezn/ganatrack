import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import type { IPalpacionGrupalRepository } from './domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionAnimalRepository } from './domain/repositories/palpacion-animal.repository.js'
import type { IInseminacionGrupalRepository } from './domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionAnimalRepository } from './domain/repositories/inseminacion-animal.repository.js'
import type { IPartoAnimalRepository } from './domain/repositories/parto-animal.repository.js'
import type { IPartoCriaRepository } from './domain/repositories/parto-cria.repository.js'
import type { IVeterinarioGrupalRepository } from './domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioAnimalRepository } from './domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioProductoRepository } from './domain/repositories/veterinario-producto.repository.js'

// Drizzle repositories
import { DrizzlePalpacionGrupalRepository } from './infrastructure/persistence/drizzle-palpacion-grupal.repository.js'
import { DrizzlePalpacionAnimalRepository } from './infrastructure/persistence/drizzle-palpacion-animal.repository.js'
import { DrizzleInseminacionGrupalRepository } from './infrastructure/persistence/drizzle-inseminacion-grupal.repository.js'
import { DrizzleInseminacionAnimalRepository } from './infrastructure/persistence/drizzle-inseminacion-animal.repository.js'
import { DrizzlePartoAnimalRepository } from './infrastructure/persistence/drizzle-parto-animal.repository.js'
import { DrizzlePartoCriaRepository } from './infrastructure/persistence/drizzle-parto-cria.repository.js'
import { DrizzleVeterinarioGrupalRepository } from './infrastructure/persistence/drizzle-veterinario-grupal.repository.js'
import { DrizzleVeterinarioAnimalRepository } from './infrastructure/persistence/drizzle-veterinario-animal.repository.js'
import { DrizzleVeterinarioProductoRepository } from './infrastructure/persistence/drizzle-veterinario-producto.repository.js'

// Routes
import { registerServiciosRoutes } from './infrastructure/http/routes/servicios.routes.js'

export function registerServiciosModule(): void {
  // No DI
}

export async function registerServiciosModuleRoutes(app: FastifyInstance): Promise<void> {
  const db: DbClient = createClient()
  
  const palpacionGrupalRepo: IPalpacionGrupalRepository = new DrizzlePalpacionGrupalRepository(db)
  const palpacionAnimalRepo: IPalpacionAnimalRepository = new DrizzlePalpacionAnimalRepository(db)
  const inseminacionGrupalRepo: IInseminacionGrupalRepository = new DrizzleInseminacionGrupalRepository(db)
  const inseminacionAnimalRepo: IInseminacionAnimalRepository = new DrizzleInseminacionAnimalRepository(db)
  const partoAnimalRepo: IPartoAnimalRepository = new DrizzlePartoAnimalRepository(db)
  const partoCriaRepo: IPartoCriaRepository = new DrizzlePartoCriaRepository(db)
  const veterinarioGrupalRepo: IVeterinarioGrupalRepository = new DrizzleVeterinarioGrupalRepository(db)
  const veterinarioAnimalRepo: IVeterinarioAnimalRepository = new DrizzleVeterinarioAnimalRepository(db)
  const veterinarioProductoRepo: IVeterinarioProductoRepository = new DrizzleVeterinarioProductoRepository(db)

  await registerServiciosRoutes(app, {
    palpacionGrupalRepo,
    palpacionAnimalRepo,
    inseminacionGrupalRepo,
    inseminacionAnimalRepo,
    partoAnimalRepo,
    partoCriaRepo,
    veterinarioGrupalRepo,
    veterinarioAnimalRepo,
    veterinarioProductoRepo,
  })
}
