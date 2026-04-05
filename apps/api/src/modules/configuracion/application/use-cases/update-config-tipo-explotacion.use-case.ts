import { inject, injectable } from 'tsyringe'
import { CONFIG_TIPO_EXPLOTACION_REPOSITORY } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigTipoExplotacionRepository } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { ConfigTipoExplotacionResponseDto, UpdateConfigTipoExplotacionDto } from '../dtos/configuracion.dto.js'
import { ConfigTipoExplotacionMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigTipoExplotacionUseCase {
  constructor(
    @inject(CONFIG_TIPO_EXPLOTACION_REPOSITORY) private readonly repo: IConfigTipoExplotacionRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigTipoExplotacionDto): Promise<ConfigTipoExplotacionResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigTipoExplotacion', id)
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigTipoExplotacion', id)
    }

    return ConfigTipoExplotacionMapper.toResponse(entity)
  }
}
