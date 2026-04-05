import { injectable, inject } from 'tsyringe'
import { CONFIG_CALIDAD_ANIMAL_REPOSITORY } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { IConfigCalidadAnimalRepository } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { CreateConfigCalidadAnimalDto, ConfigCalidadAnimalResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigCalidadAnimalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class CrearConfigCalidadAnimalUseCase {
  constructor(
    @inject(CONFIG_CALIDAD_ANIMAL_REPOSITORY) private readonly repo: IConfigCalidadAnimalRepository,
  ) {}

  async execute(dto: CreateConfigCalidadAnimalDto): Promise<ConfigCalidadAnimalResponseDto> {
    const entity = await this.repo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    })

    return ConfigCalidadAnimalMapper.toResponse(entity)
  }
}
