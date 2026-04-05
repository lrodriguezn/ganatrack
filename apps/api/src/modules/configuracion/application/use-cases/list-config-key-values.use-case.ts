import { injectable, inject } from 'tsyringe'
import { CONFIG_KEY_VALUE_REPOSITORY } from '../../domain/repositories/config-key-value.repository.js'
import type { IConfigKeyValueRepository } from '../../domain/repositories/config-key-value.repository.js'
import type { ConfigKeyValueResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigKeyValueMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class ListConfigKeyValuesUseCase {
  constructor(
    @inject(CONFIG_KEY_VALUE_REPOSITORY) private readonly repo: IConfigKeyValueRepository,
  ) {}

  async execute(opts: { page: number; limit: number; opcion?: string }): Promise<{
    data: ConfigKeyValueResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(ConfigKeyValueMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
