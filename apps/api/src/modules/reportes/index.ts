import 'reflect-metadata'
import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import { EXPORT_JOB_REPOSITORY } from './domain/repositories/export-job.repository.js'
import type { IExportJobRepository } from './domain/repositories/export-job.repository.js'

// Domain services
import { JOB_QUEUE } from './domain/services/job-queue.service.js'
import type { IJobQueue } from './domain/services/job-queue.service.js'
import { FILE_STORAGE } from './domain/services/file-storage.service.js'
import type { IFileStorage } from './domain/services/file-storage.service.js'
import {
  CSV_GENERATOR,
  EXCEL_GENERATOR,
  EXPORT_GENERATOR,
  PDF_GENERATOR,
} from './domain/services/export-generator.service.js'
import type {
  ICsvGenerator,
  IExcelGenerator,
  IExportGenerator,
  IPdfGenerator,
} from './domain/services/export-generator.service.js'

// Drizzle repositories
import { DrizzleExportJobRepository } from './infrastructure/persistence/drizzle-export-job.repository.js'

// Infrastructure services
import { InMemoryJobQueueService } from './infrastructure/services/in-memory-job-queue.service.js'
import { LocalFileStorageService } from './infrastructure/services/local-file-storage.service.js'
import { CsvGeneratorService } from './infrastructure/services/csv-generator.service.js'
import { ExcelGeneratorService } from './infrastructure/services/excel-generator.service.js'
import { PdfGeneratorService } from './infrastructure/services/pdf-generator.service.js'
import { ExportGeneratorService } from './infrastructure/services/export-generator.service.js'

// Use cases
import { GetInventarioReportUseCase } from './application/use-cases/get-inventario-report.use-case.js'
import { GetReproductivoReportUseCase } from './application/use-cases/get-reproductivo-report.use-case.js'
import { GetMortalidadReportUseCase } from './application/use-cases/get-mortalidad-report.use-case.js'
import { GetMovimientoReportUseCase } from './application/use-cases/get-movimiento-report.use-case.js'
import { GetSanitarioReportUseCase } from './application/use-cases/get-sanitario-report.use-case.js'
import { CountReportDataUseCase } from './application/use-cases/count-report-data.use-case.js'
import { GenerateSyncExportUseCase } from './application/use-cases/generate-sync-export.use-case.js'
import { EnqueueExportJobUseCase } from './application/use-cases/enqueue-export-job.use-case.js'
import { GetExportStatusUseCase } from './application/use-cases/get-export-status.use-case.js'
import { ListExportJobsUseCase } from './application/use-cases/list-export-jobs.use-case.js'
import { DeleteExportJobUseCase } from './application/use-cases/delete-export-job.use-case.js'
import { DownloadExportFileUseCase } from './application/use-cases/download-export-file.use-case.js'

// Routes
import { registerReportesRoutes } from './infrastructure/http/routes/reportes.routes.js'

// Export tokens
export {
  EXPORT_JOB_REPOSITORY,
  JOB_QUEUE,
  FILE_STORAGE,
  EXPORT_GENERATOR,
  PDF_GENERATOR,
  EXCEL_GENERATOR,
  CSV_GENERATOR,
}

// DI token for database client
const REPORTES_DB_CLIENT = Symbol('ReportesDbClient')

export function registerReportesModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance<DbClient>(REPORTES_DB_CLIENT, db)

  // Register repositories
  container.registerSingleton<IExportJobRepository>(EXPORT_JOB_REPOSITORY, DrizzleExportJobRepository)

  // Register domain services
  container.registerSingleton<IJobQueue>(JOB_QUEUE, InMemoryJobQueueService)
  container.registerSingleton<IFileStorage>(FILE_STORAGE, LocalFileStorageService)

  // Register format generators
  container.registerSingleton<IPdfGenerator>(PDF_GENERATOR, PdfGeneratorService)
  container.registerSingleton<IExcelGenerator>(EXCEL_GENERATOR, ExcelGeneratorService)
  container.registerSingleton<ICsvGenerator>(CSV_GENERATOR, CsvGeneratorService)

  // Register export generator (combines all formats)
  container.registerSingleton<IExportGenerator>(EXPORT_GENERATOR, ExportGeneratorService)

  // Register use cases - Reports
  container.registerSingleton(GetInventarioReportUseCase)
  container.registerSingleton(GetReproductivoReportUseCase)
  container.registerSingleton(GetMortalidadReportUseCase)
  container.registerSingleton(GetMovimientoReportUseCase)
  container.registerSingleton(GetSanitarioReportUseCase)

  // Register use cases - Export
  container.registerSingleton(CountReportDataUseCase)
  container.registerSingleton(GenerateSyncExportUseCase)
  container.registerSingleton(EnqueueExportJobUseCase)
  container.registerSingleton(GetExportStatusUseCase)
  container.registerSingleton(ListExportJobsUseCase)
  container.registerSingleton(DeleteExportJobUseCase)
  container.registerSingleton(DownloadExportFileUseCase)
}

export async function registerReportesModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerReportesRoutes(app)
}
