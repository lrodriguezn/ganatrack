import { injectable, inject } from 'tsyringe'
import { CONFIG_COLOR_REPOSITORY } from '../../domain/repositories/config-color.repository.js'
import type { IConfigColorRepository } from '../../domain/repositories/config-color.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigColorUseCase {
  constructor(
    @inject(CONFIG_COLOR_REPOSITORY) private readonly repo: IConfigColorRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigColor', id)
    }

    await this.repo.softDelete(id)
  }
}
