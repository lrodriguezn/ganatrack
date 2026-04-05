import { injectable, inject } from 'tsyringe'
import { CONFIG_RAZA_REPOSITORY } from '../../domain/repositories/config-raza.repository.js'
import type { IConfigRazaRepository } from '../../domain/repositories/config-raza.repository.js'
import type { ConfigRazaResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigRazaMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class ListConfigRazasUseCase {
  constructor(
    @inject(CONFIG_RAZA_REPOSITORY) private readonly repo: IConfigRazaRepository,
  ) {}

  async execute(opts: { page: number; limit: number; search?: string }): Promise<{
    data: ConfigRazaResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(ConfigRazaMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
