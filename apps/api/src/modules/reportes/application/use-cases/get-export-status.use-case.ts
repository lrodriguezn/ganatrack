import { injectable, inject } from 'tsyringe'
import { NotFoundError } from '../../../../shared/errors/index.js'
import { EXPORT_JOB_REPOSITORY } from '../../domain/repositories/export-job.repository.js'
import type { IExportJobRepository } from '../../domain/repositories/export-job.repository.js'
import { JOB_QUEUE } from '../../domain/services/job-queue.service.js'
import type { IJobQueue } from '../../domain/services/job-queue.service.js'
import type { ExportStatusDto } from '../dtos/reportes.dto.js'

@injectable()
export class GetExportStatusUseCase {
  constructor(
    @inject(EXPORT_JOB_REPOSITORY) private readonly exportJobRepo: IExportJobRepository,
    @inject(JOB_QUEUE) private readonly jobQueue: IJobQueue,
  ) {}

  async execute(jobId: number, usuarioId: number): Promise<ExportStatusDto> {
    // Get job from database
    const job = await this.exportJobRepo.findByIdAndUsuario(jobId, usuarioId)
    if (!job) {
      throw new NotFoundError('ExportJob', jobId)
    }

    // Check queue for real-time status
    const queueJob = this.jobQueue.getJob(String(jobId))

    const status = queueJob?.status ?? job.estado
    const progress = queueJob?.progress ?? (status === 'completado' ? 100 : status === 'fallido' ? 0 : 0)

    const response: ExportStatusDto = {
      jobId: job.id,
      status: status as ExportStatusDto['status'],
      progress,
      error: queueJob?.error ?? undefined,
    }

    if (status === 'completado' && job.rutaArchivo) {
      response.downloadUrl = `/api/v1/reportes/export/${job.id}/download`
    }

    return response
  }
}
