import { injectable, inject } from 'tsyringe'
import { CONFIG_CALIDAD_ANIMAL_REPOSITORY } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { IConfigCalidadAnimalRepository } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { ConfigCalidadAnimalResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigCalidadAnimalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigCalidadAnimalUseCase {
  constructor(
    @inject(CONFIG_CALIDAD_ANIMAL_REPOSITORY) private readonly repo: IConfigCalidadAnimalRepository,
  ) {}

  async execute(id: number): Promise<ConfigCalidadAnimalResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('ConfigCalidadAnimal', id)
    }
    return ConfigCalidadAnimalMapper.toResponse(entity)
  }
}
