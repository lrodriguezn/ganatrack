import { injectable, inject } from 'tsyringe'
import { CONFIG_TIPO_EXPLOTACION_REPOSITORY } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigTipoExplotacionRepository } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigTipoExplotacionUseCase {
  constructor(
    @inject(CONFIG_TIPO_EXPLOTACION_REPOSITORY) private readonly repo: IConfigTipoExplotacionRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigTipoExplotacion', id)
    }

    await this.repo.softDelete(id)
  }
}
