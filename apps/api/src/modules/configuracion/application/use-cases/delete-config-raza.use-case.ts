import { inject, injectable } from 'tsyringe'
import { CONFIG_RAZA_REPOSITORY } from '../../domain/repositories/config-raza.repository.js'
import type { IConfigRazaRepository } from '../../domain/repositories/config-raza.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigRazaUseCase {
  constructor(
    @inject(CONFIG_RAZA_REPOSITORY) private readonly repo: IConfigRazaRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigRaza', id)
    }

    await this.repo.softDelete(id)
  }
}
