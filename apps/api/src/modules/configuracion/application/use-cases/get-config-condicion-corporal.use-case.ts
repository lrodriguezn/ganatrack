import { inject, injectable } from 'tsyringe'
import { CONFIG_CONDICION_CORPORAL_REPOSITORY } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigCondicionCorporalRepository } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { ConfigCondicionCorporalResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigCondicionCorporalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigCondicionCorporalUseCase {
  constructor(
    @inject(CONFIG_CONDICION_CORPORAL_REPOSITORY) private readonly repo: IConfigCondicionCorporalRepository,
  ) {}

  async execute(id: number): Promise<ConfigCondicionCorporalResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('ConfigCondicionCorporal', id)
    }
    return ConfigCondicionCorporalMapper.toResponse(entity)
  }
}
