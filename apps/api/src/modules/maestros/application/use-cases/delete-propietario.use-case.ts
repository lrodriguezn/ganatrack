import { injectable, inject } from 'tsyringe'
import { PROPIETARIO_REPOSITORY } from '../../domain/repositories/propietario.repository.js'
import type { IPropietarioRepository } from '../../domain/repositories/propietario.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeletePropietarioUseCase {
  constructor(@inject(PROPIETARIO_REPOSITORY) private readonly repo: IPropietarioRepository) {}
  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) throw new NotFoundError('Propietario', id)
    await this.repo.softDelete(id, predioId)
  }
}
