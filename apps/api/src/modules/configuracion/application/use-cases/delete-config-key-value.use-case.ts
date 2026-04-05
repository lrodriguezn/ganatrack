import { injectable, inject } from 'tsyringe'
import { CONFIG_KEY_VALUE_REPOSITORY } from '../../domain/repositories/config-key-value.repository.js'
import type { IConfigKeyValueRepository } from '../../domain/repositories/config-key-value.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigKeyValueUseCase {
  constructor(
    @inject(CONFIG_KEY_VALUE_REPOSITORY) private readonly repo: IConfigKeyValueRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigKeyValue', id)
    }

    await this.repo.softDelete(id)
  }
}
