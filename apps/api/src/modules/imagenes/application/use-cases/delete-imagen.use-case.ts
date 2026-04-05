import { injectable, inject } from 'tsyringe'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteImagenUseCase {
  constructor(
    @inject(IMAGEN_REPOSITORY) private readonly repo: IImagenRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Imagen', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
