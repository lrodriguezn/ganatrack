import { injectable, inject } from 'tsyringe'
import { VETERINARIO_REPOSITORY } from '../../domain/repositories/veterinario.repository.js'
import type { IVeterinarioRepository } from '../../domain/repositories/veterinario.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteVeterinarioUseCase {
  constructor(@inject(VETERINARIO_REPOSITORY) private readonly repo: IVeterinarioRepository) {}
  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) throw new NotFoundError('Veterinario', id)
    await this.repo.softDelete(id, predioId)
  }
}
