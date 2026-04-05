import { inject, injectable } from 'tsyringe'
import { JOB_QUEUE } from '../../domain/services/job-queue.service.js'
import type { IJobQueue } from '../../domain/services/job-queue.service.js'
import { EXPORT_JOB_REPOSITORY } from '../../domain/repositories/export-job.repository.js'
import type { IExportJobRepository } from '../../domain/repositories/export-job.repository.js'
import type { ExportFormato, ReporteFiltros, ReporteTipo } from '../../domain/entities/reporte-exportacion.entity.js'
import type { ExportJobResponseDto } from '../dtos/reportes.dto.js'

@injectable()
export class EnqueueExportJobUseCase {
  constructor(
    @inject(JOB_QUEUE) private readonly jobQueue: IJobQueue,
    @inject(EXPORT_JOB_REPOSITORY) private readonly exportJobRepo: IExportJobRepository,
  ) {}

  async execute(
    tipo: ReporteTipo,
    formato: ExportFormato,
    filtros: ReporteFiltros,
    usuarioId: number,
    predioId: number
  ): Promise<ExportJobResponseDto> {
    // Create job in database
    const job = await this.exportJobRepo.create({
      tipo,
      formato,
      parametros: JSON.stringify(filtros),
      predioId,
      usuarioId,
    })

    // Enqueue in job queue
    const jobId = this.jobQueue.enqueue({
      tipo,
      formato,
      filtros,
      usuarioId,
      predioId,
    })

    return {
      jobId: job.id,
      tipo: job.tipo as ReporteTipo,
      formato: job.formato as ExportFormato,
      estado: 'pendiente',
      progreso: 0,
      rutaArchivo: null,
      createdAt: job.createdAt?.toISOString() ?? new Date().toISOString(),
    }
  }
}
