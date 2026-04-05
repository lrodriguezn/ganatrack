import { inject, injectable } from 'tsyringe'
import { PREDIO_REPOSITORY } from '../../domain/repositories/predio.repository.js'
import type { IPredioRepository } from '../../domain/repositories/predio.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeletePredioUseCase {
  constructor(
    @inject(PREDIO_REPOSITORY) private readonly repo: IPredioRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('Predio', id)
    }

    await this.repo.softDelete(id)
  }
}
