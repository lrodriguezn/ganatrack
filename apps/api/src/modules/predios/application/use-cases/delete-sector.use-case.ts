import { inject, injectable } from 'tsyringe'
import { SECTOR_REPOSITORY } from '../../domain/repositories/sector.repository.js'
import type { ISectorRepository } from '../../domain/repositories/sector.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteSectorUseCase {
  constructor(
    @inject(SECTOR_REPOSITORY) private readonly repo: ISectorRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Sector', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
