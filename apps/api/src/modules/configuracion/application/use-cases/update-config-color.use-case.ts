import { injectable, inject } from 'tsyringe'
import { CONFIG_COLOR_REPOSITORY } from '../../domain/repositories/config-color.repository.js'
import type { IConfigColorRepository } from '../../domain/repositories/config-color.repository.js'
import type { UpdateConfigColorDto, ConfigColorResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigColorMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigColorUseCase {
  constructor(
    @inject(CONFIG_COLOR_REPOSITORY) private readonly repo: IConfigColorRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigColorDto): Promise<ConfigColorResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigColor', id)
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigColor', id)
    }

    return ConfigColorMapper.toResponse(entity)
  }
}
