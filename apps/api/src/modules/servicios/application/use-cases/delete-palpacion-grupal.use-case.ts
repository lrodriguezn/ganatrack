import { inject, injectable } from 'tsyringe'
import { PALPACION_GRUPAL_REPOSITORY } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionGrupalRepository } from '../../domain/repositories/palpacion-grupal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeletePalpacionGrupalUseCase {
  constructor(
    @inject(PALPACION_GRUPAL_REPOSITORY) private readonly repo: IPalpacionGrupalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('PalpacionGrupal', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
