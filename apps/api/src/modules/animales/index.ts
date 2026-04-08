import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import type { IAnimalRepository } from './domain/repositories/animal.repository.js'
import type { IImagenRepository } from './domain/repositories/imagen.repository.js'
import type { IAnimalImagenRepository } from './domain/repositories/animal-imagen.repository.js'

// Drizzle repositories
import { DrizzleAnimalRepository } from './infrastructure/persistence/drizzle-animal.repository.js'
import { DrizzleImagenRepository } from './infrastructure/persistence/drizzle-imagen.repository.js'
import { DrizzleAnimalImagenRepository } from './infrastructure/persistence/drizzle-animal-imagen.repository.js'

// Routes
import { registerAnimalesRoutes } from './infrastructure/http/routes/animales.routes.js'

export function registerAnimalesModule(): void {
  // No DI - instances created on-demand in routes
}

export async function registerAnimalesModuleRoutes(app: FastifyInstance): Promise<void> {
  // Create DB client
  const db: DbClient = createClient()
  
  // Create repositories
  const animalRepo: IAnimalRepository = new DrizzleAnimalRepository(db)
  const imagenRepo: IImagenRepository = new DrizzleImagenRepository(db)
  const animalImagenRepo: IAnimalImagenRepository = new DrizzleAnimalImagenRepository(db)

  await registerAnimalesRoutes(app, {
    animalRepo,
    imagenRepo,
    animalImagenRepo,
  })
}
