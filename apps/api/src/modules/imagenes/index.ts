import { type DbClient, createClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'
import { DrizzleImagenRepository } from './infrastructure/persistence/drizzle-imagen.repository.js'
import { registerImagenesRoutes } from './infrastructure/http/routes/imagenes.routes.js'

export function registerImagenesModule(): void {}

export async function registerImagenesModuleRoutes(app: FastifyInstance): Promise<void> {
  const db = createClient() as unknown as DbClient
  const imagenRepo = new DrizzleImagenRepository(db)
  await registerImagenesRoutes(app, { imagenRepo })
}
