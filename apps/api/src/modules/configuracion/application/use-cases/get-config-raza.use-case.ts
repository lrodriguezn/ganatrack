import { inject, injectable } from 'tsyringe'
import { CONFIG_RAZA_REPOSITORY } from '../../domain/repositories/config-raza.repository.js'
import type { IConfigRazaRepository } from '../../domain/repositories/config-raza.repository.js'
import type { ConfigRazaResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigRazaMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigRazaUseCase {
  constructor(
    @inject(CONFIG_RAZA_REPOSITORY) private readonly repo: IConfigRazaRepository,
  ) {}

  async execute(id: number): Promise<ConfigRazaResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('ConfigRaza', id)
    }
    return ConfigRazaMapper.toResponse(entity)
  }
}
