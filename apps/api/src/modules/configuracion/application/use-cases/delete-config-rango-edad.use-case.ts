import { injectable, inject } from 'tsyringe'
import { CONFIG_RANGO_EDAD_REPOSITORY } from '../../domain/repositories/config-rango-edad.repository.js'
import type { IConfigRangoEdadRepository } from '../../domain/repositories/config-rango-edad.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigRangoEdadUseCase {
  constructor(
    @inject(CONFIG_RANGO_EDAD_REPOSITORY) private readonly repo: IConfigRangoEdadRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigRangoEdad', id)
    }

    await this.repo.softDelete(id)
  }
}
