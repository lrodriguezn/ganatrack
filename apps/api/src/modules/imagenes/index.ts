import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import { IMAGEN_REPOSITORY } from './domain/repositories/imagen.repository.js'

// Drizzle repositories
import { DrizzleImagenRepository } from './infrastructure/persistence/drizzle-imagen.repository.js'

// Use cases
import { ListImagenesUseCase } from './application/use-cases/list-imagenes.use-case.js'
import { GetImagenUseCase } from './application/use-cases/get-imagen.use-case.js'
import { UploadImagenUseCase } from './application/use-cases/upload-imagen.use-case.js'
import { DeleteImagenUseCase } from './application/use-cases/delete-imagen.use-case.js'

// Routes
import { registerImagenesRoutes } from './infrastructure/http/routes/imagenes.routes.js'

const IMAGENES_DB_CLIENT = Symbol('ImagenesDbClient')

export function registerImagenesModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance<DbClient>(IMAGENES_DB_CLIENT, db)

  // Register repositories
  container.registerSingleton(IMAGEN_REPOSITORY, DrizzleImagenRepository)

  // Register use cases
  container.registerSingleton(ListImagenesUseCase)
  container.registerSingleton(GetImagenUseCase)
  container.registerSingleton(UploadImagenUseCase)
  container.registerSingleton(DeleteImagenUseCase)
}

export async function registerImagenesModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerImagenesRoutes(app)
}
