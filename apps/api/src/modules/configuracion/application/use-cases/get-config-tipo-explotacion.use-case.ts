import { inject, injectable } from 'tsyringe'
import { CONFIG_TIPO_EXPLOTACION_REPOSITORY } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigTipoExplotacionRepository } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { ConfigTipoExplotacionResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigTipoExplotacionMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigTipoExplotacionUseCase {
  constructor(
    @inject(CONFIG_TIPO_EXPLOTACION_REPOSITORY) private readonly repo: IConfigTipoExplotacionRepository,
  ) {}

  async execute(id: number): Promise<ConfigTipoExplotacionResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('ConfigTipoExplotacion', id)
    }
    return ConfigTipoExplotacionMapper.toResponse(entity)
  }
}
