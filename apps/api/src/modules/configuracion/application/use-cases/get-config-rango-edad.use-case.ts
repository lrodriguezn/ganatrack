import { injectable, inject } from 'tsyringe'
import { CONFIG_RANGO_EDAD_REPOSITORY } from '../../domain/repositories/config-rango-edad.repository.js'
import type { IConfigRangoEdadRepository } from '../../domain/repositories/config-rango-edad.repository.js'
import type { ConfigRangoEdadResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigRangoEdadMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigRangoEdadUseCase {
  constructor(
    @inject(CONFIG_RANGO_EDAD_REPOSITORY) private readonly repo: IConfigRangoEdadRepository,
  ) {}

  async execute(id: number): Promise<ConfigRangoEdadResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('ConfigRangoEdad', id)
    }
    return ConfigRangoEdadMapper.toResponse(entity)
  }
}
