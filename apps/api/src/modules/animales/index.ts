import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import { ANIMAL_REPOSITORY } from './domain/repositories/animal.repository.js'
import type { IAnimalRepository } from './domain/repositories/animal.repository.js'
import { IMAGEN_REPOSITORY } from './domain/repositories/imagen.repository.js'
import type { IImagenRepository } from './domain/repositories/imagen.repository.js'
import { ANIMAL_IMAGEN_REPOSITORY } from './domain/repositories/animal-imagen.repository.js'
import type { IAnimalImagenRepository } from './domain/repositories/animal-imagen.repository.js'

// Drizzle repositories
import { DrizzleAnimalRepository } from './infrastructure/persistence/drizzle-animal.repository.js'
import { DrizzleImagenRepository } from './infrastructure/persistence/drizzle-imagen.repository.js'
import { DrizzleAnimalImagenRepository } from './infrastructure/persistence/drizzle-animal-imagen.repository.js'

// Use cases - Animal
import { CrearAnimalUseCase } from './application/use-cases/crear-animal.use-case.js'
import { GetAnimalUseCase } from './application/use-cases/get-animal.use-case.js'
import { ListAnimalesUseCase } from './application/use-cases/list-animales.use-case.js'
import { UpdateAnimalUseCase } from './application/use-cases/update-animal.use-case.js'
import { DeleteAnimalUseCase } from './application/use-cases/delete-animal.use-case.js'
import { GetGenealogiaAnimalUseCase } from './application/use-cases/get-genealogia-animal.use-case.js'

// Use cases - Imagen
import { CrearImagenUseCase } from './application/use-cases/crear-imagen.use-case.js'
import { GetImagenUseCase } from './application/use-cases/get-imagen.use-case.js'
import { ListImagenesUseCase } from './application/use-cases/list-imagenes.use-case.js'
import { UpdateImagenUseCase } from './application/use-cases/update-imagen.use-case.js'
import { DeleteImagenUseCase } from './application/use-cases/delete-imagen.use-case.js'

// Use cases - Animal-Imagen junction
import { AssignImagenToAnimalUseCase } from './application/use-cases/assign-imagen-to-animal.use-case.js'
import { ListAnimalImagenesUseCase } from './application/use-cases/list-animal-imagenes.use-case.js'
import { ListImagenAnimalesUseCase } from './application/use-cases/list-imagen-animales.use-case.js'
import { RemoveImagenFromAnimalUseCase } from './application/use-cases/remove-imagen-from-animal.use-case.js'

// Routes
import { registerAnimalesRoutes } from './infrastructure/http/routes/animales.routes.js'

// Export tokens
export {
  ANIMAL_REPOSITORY,
  IMAGEN_REPOSITORY,
  ANIMAL_IMAGEN_REPOSITORY,
}

// DI tokens
const ANIMALES_DB_CLIENT = Symbol('AnimalesDbClient')

export function registerAnimalesModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance<DbClient>(ANIMALES_DB_CLIENT, db)

  // Register repositories
  container.registerSingleton<IAnimalRepository>(ANIMAL_REPOSITORY, DrizzleAnimalRepository)
  container.registerSingleton<IImagenRepository>(IMAGEN_REPOSITORY, DrizzleImagenRepository)
  container.registerSingleton<IAnimalImagenRepository>(ANIMAL_IMAGEN_REPOSITORY, DrizzleAnimalImagenRepository)

  // Register use cases - Animal
  container.registerSingleton(CrearAnimalUseCase)
  container.registerSingleton(GetAnimalUseCase)
  container.registerSingleton(ListAnimalesUseCase)
  container.registerSingleton(UpdateAnimalUseCase)
  container.registerSingleton(DeleteAnimalUseCase)
  container.registerSingleton(GetGenealogiaAnimalUseCase)

  // Register use cases - Imagen
  container.registerSingleton(CrearImagenUseCase)
  container.registerSingleton(GetImagenUseCase)
  container.registerSingleton(ListImagenesUseCase)
  container.registerSingleton(UpdateImagenUseCase)
  container.registerSingleton(DeleteImagenUseCase)

  // Register use cases - Animal-Imagen junction
  container.registerSingleton(AssignImagenToAnimalUseCase)
  container.registerSingleton(ListAnimalImagenesUseCase)
  container.registerSingleton(ListImagenAnimalesUseCase)
  container.registerSingleton(RemoveImagenFromAnimalUseCase)
}

export async function registerAnimalesModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerAnimalesRoutes(app)
}
