import type { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { GetInventarioReportUseCase } from '../../../application/use-cases/get-inventario-report.use-case.js'
import { GetReproductivoReportUseCase } from '../../../application/use-cases/get-reproductivo-report.use-case.js'
import { GetMortalidadReportUseCase } from '../../../application/use-cases/get-mortalidad-report.use-case.js'
import { GetMovimientoReportUseCase } from '../../../application/use-cases/get-movimiento-report.use-case.js'
import { GetSanitarioReportUseCase } from '../../../application/use-cases/get-sanitario-report.use-case.js'
import { CountReportDataUseCase } from '../../../application/use-cases/count-report-data.use-case.js'
import { GenerateSyncExportUseCase } from '../../../application/use-cases/generate-sync-export.use-case.js'
import { EnqueueExportJobUseCase } from '../../../application/use-cases/enqueue-export-job.use-case.js'
import { GetExportStatusUseCase } from '../../../application/use-cases/get-export-status.use-case.js'
import { ListExportJobsUseCase } from '../../../application/use-cases/list-export-jobs.use-case.js'
import { DeleteExportJobUseCase } from '../../../application/use-cases/delete-export-job.use-case.js'
import { DownloadExportFileUseCase } from '../../../application/use-cases/download-export-file.use-case.js'
import type { ReporteFiltrosDto, ExportRequestDto } from '../../../application/dtos/reportes.dto.js'
import { ValidationError } from '../../../../../shared/errors/index.js'
import { FILE_STORAGE } from '../../../domain/services/file-storage.service.js'
import type { IFileStorage } from '../../../domain/services/file-storage.service.js'
import { EXPORT_JOB_REPOSITORY } from '../../../domain/repositories/export-job.repository.js'
import type { IExportJobRepository } from '../../../domain/repositories/export-job.repository.js'

@injectable()
export class ReportesController {
  constructor(
    // Report use cases
    private readonly getInventarioReport: GetInventarioReportUseCase,
    private readonly getReproductivoReport: GetReproductivoReportUseCase,
    private readonly getMortalidadReport: GetMortalidadReportUseCase,
    private readonly getMovimientoReport: GetMovimientoReportUseCase,
    private readonly getSanitarioReport: GetSanitarioReportUseCase,
    // Export use cases
    private readonly countReportDataUseCase: CountReportDataUseCase,
    private readonly generateSyncExportUseCase: GenerateSyncExportUseCase,
    private readonly enqueueExportJobUseCase: EnqueueExportJobUseCase,
    private readonly getExportStatusUseCase: GetExportStatusUseCase,
    private readonly listExportJobsUseCase: ListExportJobsUseCase,
    private readonly deleteExportJobUseCase: DeleteExportJobUseCase,
    private readonly downloadExportFileUseCase: DownloadExportFileUseCase,
    // Services
    @inject(FILE_STORAGE) private readonly fileStorage: IFileStorage,
    @inject(EXPORT_JOB_REPOSITORY) private readonly exportJobRepo: IExportJobRepository,
  ) {}

  // ============================================================================
  // Report endpoints
  // ============================================================================

  async getInventario(request: FastifyRequest, reply: FastifyReply) {
    const predicates = (request as any).predioId || 0
    const { fechaInicio, fechaFin, potreroId, categoriaId, razaId } = request.query as ReporteFiltrosDto
    const filtros: ReporteFiltrosDto = { fechaInicio, fechaFin, potreroId, categoriaId, razaId }
    
    const result = await this.getInventarioReport.execute(predicates, filtros)
    return reply.code(200).send({
      success: true,
      data: {
        resumen: result.resumen,
        detalle: result.detalle,
      },
    })
  }

  async getReproductivo(request: FastifyRequest, reply: FastifyReply) {
    const predicates = (request as any).predioId || 0
    const { fechaInicio, fechaFin, potreroId } = request.query as ReporteFiltrosDto
    const filtros: ReporteFiltrosDto = { fechaInicio, fechaFin, potreroId }
    
    const result = await this.getReproductivoReport.execute(predicates, filtros)
    return reply.code(200).send({ success: true, data: result })
  }

  async getMortalidad(request: FastifyRequest, reply: FastifyReply) {
    const predicates = (request as any).predioId || 0
    const { fechaInicio, fechaFin } = request.query as ReporteFiltrosDto
    const filtros: ReporteFiltrosDto = { fechaInicio, fechaFin }
    
    const result = await this.getMortalidadReport.execute(predicates, filtros)
    return reply.code(200).send({ success: true, data: result })
  }

  async getMovimiento(request: FastifyRequest, reply: FastifyReply) {
    const predicates = (request as any).predioId || 0
    const { fechaInicio, fechaFin } = request.query as ReporteFiltrosDto
    const filtros: ReporteFiltrosDto = { fechaInicio, fechaFin }
    
    const result = await this.getMovimientoReport.execute(predicates, filtros)
    return reply.code(200).send({ success: true, data: result })
  }

  async getSanitario(request: FastifyRequest, reply: FastifyReply) {
    const predicates = (request as any).predioId || 0
    const { fechaInicio, fechaFin } = request.query as ReporteFiltrosDto
    const filtros: ReporteFiltrosDto = { fechaInicio, fechaFin }
    
    const result = await this.getSanitarioReport.execute(predicates, filtros)
    return reply.code(200).send({ success: true, data: result })
  }

  // ============================================================================
  // Export endpoints
  // ============================================================================

  async countReportDataHandler(request: FastifyRequest, reply: FastifyReply) {
    const { tipo } = request.params as { tipo: string }
    const predicates = (request as any).predioId || 0
    const { fechaInicio, fechaFin, potreroId, categoriaId, razaId } = request.query as ReporteFiltrosDto
    
    if (!tipo || !['inventario', 'reproductivo', 'mortalidad', 'movimiento', 'sanitario'].includes(tipo)) {
      throw new ValidationError({ tipo: ['Tipo de reporte inválido'] })
    }
    
    const filtros: ReporteFiltrosDto = { fechaInicio, fechaFin, potreroId, categoriaId, razaId }
    const result = await this.countReportDataUseCase.execute(tipo as any, predicates, filtros)
    
    return reply.code(200).send({ success: true, data: result })
  }

  async exportReportHandler(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ExportRequestDto
    const { tipo, formato, filtros } = body
    const predicates = (request as any).predioId || 0
    const usuarioId = (request as any).currentUser?.id ?? 0

    if (!tipo || !formato) {
      throw new ValidationError({ tipo: ['Tipo y formato son requeridos'] })
    }

    // Count records to determine sync vs async
    const countResult = await this.countReportDataUseCase.execute(tipo, predicates, filtros ?? {})

    if (countResult.requiresAsync) {
      // Async export for large datasets
      const result = await this.enqueueExportJobUseCase.execute(
        tipo,
        formato,
        filtros ?? {},
        usuarioId,
        predicates
      )
      return reply.code(202).send({
        success: true,
        data: {
          message: 'Exportación iniciada. Verifica el estado con GET /reportes/export/:jobId',
          jobId: result.jobId,
          status: 'pendiente',
        },
      })
    } else {
      // Sync export for small datasets - generate file directly
      const timestamp = Date.now()
      const extension = formato === 'xlsx' ? 'xlsx' : formato === 'pdf' ? 'pdf' : 'csv'
      const filename = `reporte-${tipo}-${timestamp}.${extension}`
      const filepath = `exports/${filename}`

      await this.generateSyncExportUseCase.execute(
        tipo,
        formato,
        { ...filtros, predioId: predicates },
        usuarioId,
        filepath
      )

      // Create export job record
      const job = await this.exportJobRepo.create({
        tipo,
        formato,
        parametros: JSON.stringify(filtros ?? {}),
        predioId: predicates,
        usuarioId,
      })

      // Update job as completed
      await this.exportJobRepo.updateStatus(job.id, 'completado', filepath)

      // Return file directly
      const exists = await this.fileStorage.exists(filepath)
      if (!exists) {
        throw new ValidationError({ file: ['Error al generar el archivo'] })
      }

      const buffer = await this.fileStorage.getBuffer(filepath)
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
      }

      return reply
        .code(200)
        .header('Content-Type', mimeTypes[extension] ?? 'application/octet-stream')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(buffer)
    }
  }

  async getExportStatusHandler(request: FastifyRequest, reply: FastifyReply) {
    const { jobId } = request.params as { jobId: number }
    const usuarioId = (request as any).currentUser?.id ?? 0

    const result = await this.getExportStatusUseCase.execute(jobId, usuarioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async listExportJobsHandler(request: FastifyRequest, reply: FastifyReply) {
    const usuarioId = (request as any).currentUser?.id ?? 0
    const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number }

    const result = await this.listExportJobsUseCase.execute(usuarioId, { page, limit })
    return reply.code(200).send({
      success: true,
      data: result.jobs,
      meta: { page: result.page, limit: result.limit, total: result.total },
    })
  }

  async deleteExportJobHandler(request: FastifyRequest, reply: FastifyReply) {
    const { jobId } = request.params as { jobId: number }
    const usuarioId = (request as any).currentUser?.id ?? 0

    await this.deleteExportJobUseCase.execute(jobId, usuarioId)
    return reply.code(200).send({ success: true, data: { message: 'Exportación eliminada' } })
  }

  async downloadExportHandler(request: FastifyRequest, reply: FastifyReply) {
    const { jobId } = request.params as { jobId: number }
    const usuarioId = (request as any).currentUser?.id ?? 0

    const result = await this.downloadExportFileUseCase.execute(jobId, usuarioId)

    return reply
      .code(200)
      .header('Content-Type', result.mimeType)
      .header('Content-Disposition', `attachment; filename="${result.fileName}"`)
      .send(result.buffer)
  }
}
