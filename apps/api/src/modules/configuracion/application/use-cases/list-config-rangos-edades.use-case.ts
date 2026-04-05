import { injectable, inject } from 'tsyringe'
import { CONFIG_RANGO_EDAD_REPOSITORY } from '../../domain/repositories/config-rango-edad.repository.js'
import type { IConfigRangoEdadRepository } from '../../domain/repositories/config-rango-edad.repository.js'
import type { ConfigRangoEdadResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigRangoEdadMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class ListConfigRangosEdadesUseCase {
  constructor(
    @inject(CONFIG_RANGO_EDAD_REPOSITORY) private readonly repo: IConfigRangoEdadRepository,
  ) {}

  async execute(opts: { page: number; limit: number; search?: string }): Promise<{
    data: ConfigRangoEdadResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(ConfigRangoEdadMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
