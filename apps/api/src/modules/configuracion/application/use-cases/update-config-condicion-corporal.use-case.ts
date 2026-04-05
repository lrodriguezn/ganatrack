import { injectable, inject } from 'tsyringe'
import { CONFIG_CONDICION_CORPORAL_REPOSITORY } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigCondicionCorporalRepository } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { UpdateConfigCondicionCorporalDto, ConfigCondicionCorporalResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigCondicionCorporalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigCondicionCorporalUseCase {
  constructor(
    @inject(CONFIG_CONDICION_CORPORAL_REPOSITORY) private readonly repo: IConfigCondicionCorporalRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigCondicionCorporalDto): Promise<ConfigCondicionCorporalResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigCondicionCorporal', id)
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigCondicionCorporal', id)
    }

    return ConfigCondicionCorporalMapper.toResponse(entity)
  }
}
