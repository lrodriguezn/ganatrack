import { inject, injectable } from 'tsyringe'
import { VETERINARIO_GRUPAL_REPOSITORY } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioGrupalRepository } from '../../domain/repositories/veterinario-grupal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteVeterinarioGrupalUseCase {
  constructor(
    @inject(VETERINARIO_GRUPAL_REPOSITORY) private readonly repo: IVeterinarioGrupalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('VeterinarioGrupal', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
