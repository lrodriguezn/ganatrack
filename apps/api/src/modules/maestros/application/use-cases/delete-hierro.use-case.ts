import { injectable, inject } from 'tsyringe'
import { HIERRO_REPOSITORY } from '../../domain/repositories/hierro.repository.js'
import type { IHierroRepository } from '../../domain/repositories/hierro.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteHierroUseCase {
  constructor(@inject(HIERRO_REPOSITORY) private readonly repo: IHierroRepository) {}
  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) throw new NotFoundError('Hierro', id)
    await this.repo.softDelete(id, predioId)
  }
}
