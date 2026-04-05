import { injectable, inject } from 'tsyringe'
import { CONFIG_RAZA_REPOSITORY } from '../../domain/repositories/config-raza.repository.js'
import type { IConfigRazaRepository } from '../../domain/repositories/config-raza.repository.js'
import type { CreateConfigRazaDto, ConfigRazaResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigRazaMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearConfigRazaUseCase {
  constructor(
    @inject(CONFIG_RAZA_REPOSITORY) private readonly repo: IConfigRazaRepository,
  ) {}

  async execute(dto: CreateConfigRazaDto): Promise<ConfigRazaResponseDto> {
    // Check if nombre already exists
    const existing = await this.repo.findByNombre(dto.nombre)
    if (existing) {
      throw new ConflictError(`La raza '${dto.nombre}' ya existe`)
    }

    const entity = await this.repo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      origen: dto.origen ?? null,
      tipoProduccion: dto.tipoProduccion ?? null,
      activo: 1,
    })

    return ConfigRazaMapper.toResponse(entity)
  }
}
