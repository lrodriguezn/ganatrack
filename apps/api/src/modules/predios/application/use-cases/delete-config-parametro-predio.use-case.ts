import { inject, injectable } from 'tsyringe'
import { CONFIG_PARAMETRO_PREDIO_REPOSITORY } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { IConfigParametroPredioRepository } from '../../domain/repositories/config-parametro-predio.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigParametroPredioUseCase {
  constructor(
    @inject(CONFIG_PARAMETRO_PREDIO_REPOSITORY) private readonly repo: IConfigParametroPredioRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('ConfigParametroPredio', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
