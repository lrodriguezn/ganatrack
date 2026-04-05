import { inject, injectable } from 'tsyringe'
import { CONFIG_CALIDAD_ANIMAL_REPOSITORY } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { IConfigCalidadAnimalRepository } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { ConfigCalidadAnimalResponseDto, UpdateConfigCalidadAnimalDto } from '../dtos/configuracion.dto.js'
import { ConfigCalidadAnimalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigCalidadAnimalUseCase {
  constructor(
    @inject(CONFIG_CALIDAD_ANIMAL_REPOSITORY) private readonly repo: IConfigCalidadAnimalRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigCalidadAnimalDto): Promise<ConfigCalidadAnimalResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigCalidadAnimal', id)
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigCalidadAnimal', id)
    }

    return ConfigCalidadAnimalMapper.toResponse(entity)
  }
}
