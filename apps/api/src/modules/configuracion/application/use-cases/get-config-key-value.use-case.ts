import { injectable, inject } from 'tsyringe'
import { CONFIG_KEY_VALUE_REPOSITORY } from '../../domain/repositories/config-key-value.repository.js'
import type { IConfigKeyValueRepository } from '../../domain/repositories/config-key-value.repository.js'
import type { ConfigKeyValueResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigKeyValueMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigKeyValueUseCase {
  constructor(
    @inject(CONFIG_KEY_VALUE_REPOSITORY) private readonly repo: IConfigKeyValueRepository,
  ) {}

  async execute(id: number): Promise<ConfigKeyValueResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('ConfigKeyValue', id)
    }
    return ConfigKeyValueMapper.toResponse(entity)
  }
}
