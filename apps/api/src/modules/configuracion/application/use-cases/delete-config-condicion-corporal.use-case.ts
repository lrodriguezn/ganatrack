import { injectable, inject } from 'tsyringe'
import { CONFIG_CONDICION_CORPORAL_REPOSITORY } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigCondicionCorporalRepository } from '../../domain/repositories/config-condicion-corporal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigCondicionCorporalUseCase {
  constructor(
    @inject(CONFIG_CONDICION_CORPORAL_REPOSITORY) private readonly repo: IConfigCondicionCorporalRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigCondicionCorporal', id)
    }

    await this.repo.softDelete(id)
  }
}
