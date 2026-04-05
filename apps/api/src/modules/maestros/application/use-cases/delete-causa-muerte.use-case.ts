import { inject, injectable } from 'tsyringe'
import { CAUSA_MUERTE_REPOSITORY } from '../../domain/repositories/causa-muerte.repository.js'
import type { ICausaMuerteRepository } from '../../domain/repositories/causa-muerte.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteCausaMuerteUseCase {
  constructor(@inject(CAUSA_MUERTE_REPOSITORY) private readonly repo: ICausaMuerteRepository) {}
  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('CausaMuerte', id)
    await this.repo.softDelete(id)
  }
}
