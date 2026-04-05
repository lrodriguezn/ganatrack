import { injectable, inject } from 'tsyringe'
import { POTRERO_REPOSITORY } from '../../domain/repositories/potrero.repository.js'
import type { IPotreroRepository } from '../../domain/repositories/potrero.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeletePotreroUseCase {
  constructor(
    @inject(POTRERO_REPOSITORY) private readonly repo: IPotreroRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Potrero', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
