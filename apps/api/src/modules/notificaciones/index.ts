import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

import { DrizzleNotificacionRepository } from './infrastructure/persistence/drizzle-notificacion.repository.js'
import { DrizzlePreferenciaRepository } from './infrastructure/persistence/drizzle-preferencia.repository.js'
import { DrizzlePushTokenRepository } from './infrastructure/persistence/drizzle-push-token.repository.js'
import { registerNotificacionesRoutes } from './infrastructure/http/routes/notificaciones.routes.js'

export function registerNotificacionesModule(): void {}

export async function registerNotificacionesModuleRoutes(app: FastifyInstance): Promise<void> {
  const db: DbClient = createClient()
  const notificacionRepo = new DrizzleNotificacionRepository(db)
  const preferenciaRepo = new DrizzlePreferenciaRepository(db)
  const pushTokenRepo = new DrizzlePushTokenRepository(db)

  await registerNotificacionesRoutes(app, { notificacionRepo, preferenciaRepo, pushTokenRepo })
}
