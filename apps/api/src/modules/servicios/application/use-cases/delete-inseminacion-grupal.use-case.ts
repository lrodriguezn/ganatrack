import { injectable, inject } from 'tsyringe'
import { INSEMINACION_GRUPAL_REPOSITORY } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionGrupalRepository } from '../../domain/repositories/inseminacion-grupal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteInseminacionGrupalUseCase {
  constructor(
    @inject(INSEMINACION_GRUPAL_REPOSITORY) private readonly repo: IInseminacionGrupalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('InseminacionGrupal', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
