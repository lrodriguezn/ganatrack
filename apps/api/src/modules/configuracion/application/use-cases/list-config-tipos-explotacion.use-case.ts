import { inject, injectable } from 'tsyringe'
import { CONFIG_TIPO_EXPLOTACION_REPOSITORY } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigTipoExplotacionRepository } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { ConfigTipoExplotacionResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigTipoExplotacionMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class ListConfigTiposExplotacionUseCase {
  constructor(
    @inject(CONFIG_TIPO_EXPLOTACION_REPOSITORY) private readonly repo: IConfigTipoExplotacionRepository,
  ) {}

  async execute(opts: { page: number; limit: number; search?: string }): Promise<{
    data: ConfigTipoExplotacionResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(ConfigTipoExplotacionMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
