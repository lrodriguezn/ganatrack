import { inject, injectable } from 'tsyringe'
import { GRUPO_REPOSITORY } from '../../domain/repositories/grupo.repository.js'
import type { IGrupoRepository } from '../../domain/repositories/grupo.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteGrupoUseCase {
  constructor(
    @inject(GRUPO_REPOSITORY) private readonly repo: IGrupoRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Grupo', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
