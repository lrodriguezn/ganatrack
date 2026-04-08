import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'
import { DrizzleImagenRepository } from './infrastructure/persistence/drizzle-imagen.repository.js'
import { registerImagenesRoutes } from './infrastructure/http/routes/imagenes.routes.js'

export function registerImagenesModule(): void {}

export async function registerImagenesModuleRoutes(app: FastifyInstance): Promise<void> {
  const db: DbClient = createClient()
  const imagenRepo = new DrizzleImagenRepository(db)
  await registerImagenesRoutes(app, { imagenRepo })
}
