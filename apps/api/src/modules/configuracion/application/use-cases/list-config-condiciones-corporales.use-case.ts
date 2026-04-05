import { injectable, inject } from 'tsyringe'
import { CONFIG_CONDICION_CORPORAL_REPOSITORY } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigCondicionCorporalRepository } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { ConfigCondicionCorporalResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigCondicionCorporalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class ListConfigCondicionesCorporalesUseCase {
  constructor(
    @inject(CONFIG_CONDICION_CORPORAL_REPOSITORY) private readonly repo: IConfigCondicionCorporalRepository,
  ) {}

  async execute(opts: { page: number; limit: number; search?: string }): Promise<{
    data: ConfigCondicionCorporalResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(ConfigCondicionCorporalMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
