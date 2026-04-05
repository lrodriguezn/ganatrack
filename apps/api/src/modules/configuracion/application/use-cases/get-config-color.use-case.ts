import { injectable, inject } from 'tsyringe'
import { CONFIG_COLOR_REPOSITORY } from '../../domain/repositories/config-color.repository.js'
import type { IConfigColorRepository } from '../../domain/repositories/config-color.repository.js'
import type { ConfigColorResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigColorMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigColorUseCase {
  constructor(
    @inject(CONFIG_COLOR_REPOSITORY) private readonly repo: IConfigColorRepository,
  ) {}

  async execute(id: number): Promise<ConfigColorResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('ConfigColor', id)
    }
    return ConfigColorMapper.toResponse(entity)
  }
}
