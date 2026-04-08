import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

import { DrizzleExportJobRepository } from './infrastructure/persistence/drizzle-export-job.repository.js'
import { registerReportesRoutes } from './infrastructure/http/routes/reportes.routes.js'

export function registerReportesModule(): void {}

export async function registerReportesModuleRoutes(app: FastifyInstance): Promise<void> {
  const db: DbClient = createClient()
  const exportJobRepo = new DrizzleExportJobRepository(db)

  await registerReportesRoutes(app, { exportJobRepo })
}
