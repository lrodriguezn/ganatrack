import { inject, injectable } from 'tsyringe'
import { CONFIG_CALIDAD_ANIMAL_REPOSITORY } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { IConfigCalidadAnimalRepository } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { ConfigCalidadAnimalResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigCalidadAnimalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class ListConfigCalidadesAnimalesUseCase {
  constructor(
    @inject(CONFIG_CALIDAD_ANIMAL_REPOSITORY) private readonly repo: IConfigCalidadAnimalRepository,
  ) {}

  async execute(opts: { page: number; limit: number; search?: string }): Promise<{
    data: ConfigCalidadAnimalResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(ConfigCalidadAnimalMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
