import { injectable, inject } from 'tsyringe'
import { EXPORT_JOB_REPOSITORY } from '../../domain/repositories/export-job.repository.js'
import type { IExportJobRepository } from '../../domain/repositories/export-job.repository.js'
import type { ExportJobListDto } from '../dtos/reportes.dto.js'

@injectable()
export class ListExportJobsUseCase {
  constructor(
    @inject(EXPORT_JOB_REPOSITORY) private readonly exportJobRepo: IExportJobRepository,
  ) {}

  async execute(
    usuarioId: number,
    opts: { page: number; limit: number }
  ): Promise<ExportJobListDto> {
    const result = await this.exportJobRepo.findByUsuarioId(usuarioId, opts)

    return {
      jobs: result.data.map(job => ({
        jobId: job.id,
        tipo: job.tipo as any,
        formato: job.formato as any,
        estado: job.estado as any,
        progreso: job.estado === 'completado' ? 100 : job.estado === 'procesando' ? 50 : 0,
        rutaArchivo: job.rutaArchivo,
        createdAt: job.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
