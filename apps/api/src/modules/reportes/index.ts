import { type DbClient, createClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

import { DrizzleExportJobRepository } from './infrastructure/persistence/drizzle-export-job.repository.js'
import { registerReportesRoutes } from './infrastructure/http/routes/reportes.routes.js'

export function registerReportesModule(): void {}

export async function registerReportesModuleRoutes(app: FastifyInstance): Promise<void> {
  const db = createClient() as unknown as DbClient
  const exportJobRepo = new DrizzleExportJobRepository(db)

  await registerReportesRoutes(app, { exportJobRepo })
}
