import { injectable, inject } from 'tsyringe'
import { CONFIG_COLOR_REPOSITORY } from '../../domain/repositories/config-color.repository.js'
import type { IConfigColorRepository } from '../../domain/repositories/config-color.repository.js'
import type { ConfigColorResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigColorMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class ListConfigColoresUseCase {
  constructor(
    @inject(CONFIG_COLOR_REPOSITORY) private readonly repo: IConfigColorRepository,
  ) {}

  async execute(opts: { page: number; limit: number; search?: string }): Promise<{
    data: ConfigColorResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(ConfigColorMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
