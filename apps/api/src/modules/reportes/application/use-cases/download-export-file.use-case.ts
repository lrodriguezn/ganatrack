import { injectable, inject } from 'tsyringe'
import { NotFoundError } from '../../../../shared/errors/index.js'
import { EXPORT_JOB_REPOSITORY } from '../../domain/repositories/export-job.repository.js'
import type { IExportJobRepository } from '../../domain/repositories/export-job.repository.js'
import { FILE_STORAGE } from '../../domain/services/file-storage.service.js'
import type { IFileStorage } from '../../domain/services/file-storage.service.js'
import { EXPORT_GENERATOR } from '../../domain/services/export-generator.service.js'
import type { IExportGenerator } from '../../domain/services/export-generator.service.js'

export interface DownloadExportResult {
  buffer: Buffer
  fileName: string
  mimeType: string
}

@injectable()
export class DownloadExportFileUseCase {
  constructor(
    @inject(EXPORT_JOB_REPOSITORY) private readonly exportJobRepo: IExportJobRepository,
    @inject(FILE_STORAGE) private readonly fileStorage: IFileStorage,
    @inject(EXPORT_GENERATOR) private readonly exportGenerator: IExportGenerator,
  ) {}

  async execute(jobId: number, usuarioId: number): Promise<DownloadExportResult> {
    // Get job
    const job = await this.exportJobRepo.findByIdAndUsuario(jobId, usuarioId)
    if (!job) {
      throw new NotFoundError('ExportJob', jobId)
    }

    if (job.estado !== 'completado' || !job.rutaArchivo) {
      throw new NotFoundError('ExportFile', jobId)
    }

    // Get file from storage
    const exists = await this.fileStorage.exists(job.rutaArchivo)
    if (!exists) {
      throw new NotFoundError('ExportFile', jobId)
    }

    const buffer = await this.fileStorage.getBuffer(job.rutaArchivo)
    const extension = this.exportGenerator.getFileExtension(job.formato as any)
    const mimeType = this.exportGenerator.getMimeType(job.formato as any)
    const fileName = `reporte-${job.tipo}-${job.id}.${extension}`

    return { buffer, fileName, mimeType }
  }
}
