import { injectable, inject } from 'tsyringe'
import { LOTE_REPOSITORY } from '../../domain/repositories/lote.repository.js'
import type { ILoteRepository } from '../../domain/repositories/lote.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteLoteUseCase {
  constructor(
    @inject(LOTE_REPOSITORY) private readonly repo: ILoteRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Lote', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
