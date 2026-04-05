import { injectable, inject } from 'tsyringe'
import { CONFIG_RANGO_EDAD_REPOSITORY } from '../../domain/repositories/config-rango-edad.repository.js'
import type { IConfigRangoEdadRepository } from '../../domain/repositories/config-rango-edad.repository.js'
import type { UpdateConfigRangoEdadDto, ConfigRangoEdadResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigRangoEdadMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigRangoEdadUseCase {
  constructor(
    @inject(CONFIG_RANGO_EDAD_REPOSITORY) private readonly repo: IConfigRangoEdadRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigRangoEdadDto): Promise<ConfigRangoEdadResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigRangoEdad', id)
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigRangoEdad', id)
    }

    return ConfigRangoEdadMapper.toResponse(entity)
  }
}
