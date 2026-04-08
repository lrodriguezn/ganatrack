import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

import { DrizzleProductoRepository } from './infrastructure/persistence/drizzle-producto.repository.js'
import { DrizzleProductoImagenRepository } from './infrastructure/persistence/drizzle-producto-imagen.repository.js'
import { registerProductosRoutes } from './infrastructure/http/routes/productos.routes.js'

export function registerProductosModule(): void {}

export async function registerProductosModuleRoutes(app: FastifyInstance): Promise<void> {
  const db: DbClient = createClient()
  const productoRepo = new DrizzleProductoRepository(db)
  const productoImagenRepo = new DrizzleProductoImagenRepository(db)

  await registerProductosRoutes(app, { productoRepo, productoImagenRepo })
}
