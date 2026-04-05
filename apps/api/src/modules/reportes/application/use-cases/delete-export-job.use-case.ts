import { injectable, inject } from 'tsyringe'
import { NotFoundError } from '../../../../shared/errors/index.js'
import { EXPORT_JOB_REPOSITORY } from '../../domain/repositories/export-job.repository.js'
import type { IExportJobRepository } from '../../domain/repositories/export-job.repository.js'
import { FILE_STORAGE } from '../../domain/services/file-storage.service.js'
import type { IFileStorage } from '../../domain/services/file-storage.service.js'

@injectable()
export class DeleteExportJobUseCase {
  constructor(
    @inject(EXPORT_JOB_REPOSITORY) private readonly exportJobRepo: IExportJobRepository,
    @inject(FILE_STORAGE) private readonly fileStorage: IFileStorage,
  ) {}

  async execute(jobId: number, usuarioId: number): Promise<void> {
    // Get job to check ownership and get file path
    const job = await this.exportJobRepo.findByIdAndUsuario(jobId, usuarioId)
    if (!job) {
      throw new NotFoundError('ExportJob', jobId)
    }

    // Delete file if exists
    if (job.rutaArchivo) {
      await this.fileStorage.delete(job.rutaArchivo)
    }

    // Soft delete the job
    await this.exportJobRepo.softDelete(jobId, usuarioId)
  }
}
