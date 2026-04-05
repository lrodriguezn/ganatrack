import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import { PRODUCTO_REPOSITORY } from './domain/repositories/producto.repository.js'
import { PRODUCTO_IMAGEN_REPOSITORY } from './domain/repositories/producto-imagen.repository.js'

// Drizzle repositories
import { DrizzleProductoRepository } from './infrastructure/persistence/drizzle-producto.repository.js'
import { DrizzleProductoImagenRepository } from './infrastructure/persistence/drizzle-producto-imagen.repository.js'

// Use cases
import { ListProductosUseCase } from './application/use-cases/list-productos.use-case.js'
import { GetProductoUseCase } from './application/use-cases/get-producto.use-case.js'
import { CrearProductoUseCase } from './application/use-cases/crear-producto.use-case.js'
import { UpdateProductoUseCase } from './application/use-cases/update-producto.use-case.js'
import { DeleteProductoUseCase } from './application/use-cases/delete-producto.use-case.js'

// Routes
import { registerProductosRoutes } from './infrastructure/http/routes/productos.routes.js'

const PRODUCTOS_DB_CLIENT = Symbol('ProductosDbClient')

export function registerProductosModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance<DbClient>(PRODUCTOS_DB_CLIENT, db)

  // Register repositories
  container.registerSingleton(PRODUCTO_REPOSITORY, DrizzleProductoRepository)
  container.registerSingleton(PRODUCTO_IMAGEN_REPOSITORY, DrizzleProductoImagenRepository)

  // Register use cases
  container.registerSingleton(ListProductosUseCase)
  container.registerSingleton(GetProductoUseCase)
  container.registerSingleton(CrearProductoUseCase)
  container.registerSingleton(UpdateProductoUseCase)
  container.registerSingleton(DeleteProductoUseCase)
}

export async function registerProductosModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerProductosRoutes(app)
}
