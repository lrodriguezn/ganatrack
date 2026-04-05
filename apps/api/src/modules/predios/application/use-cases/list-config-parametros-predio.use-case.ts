import { inject, injectable } from 'tsyringe'
import { CONFIG_PARAMETRO_PREDIO_REPOSITORY } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { IConfigParametroPredioRepository } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { ConfigParametroPredioResponseDto } from '../dtos/predios.dto.js'
import { ConfigParametroPredioMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class ListConfigParametrosPredioUseCase {
  constructor(
    @inject(CONFIG_PARAMETRO_PREDIO_REPOSITORY) private readonly repo: IConfigParametroPredioRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number }): Promise<{
    data: ConfigParametroPredioResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(ConfigParametroPredioMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
