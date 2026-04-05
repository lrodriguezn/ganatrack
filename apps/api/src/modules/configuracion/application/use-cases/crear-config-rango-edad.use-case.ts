import { injectable, inject } from 'tsyringe'
import { CONFIG_RANGO_EDAD_REPOSITORY } from '../../domain/repositories/config-rango-edad.repository.js'
import type { IConfigRangoEdadRepository } from '../../domain/repositories/config-rango-edad.repository.js'
import type { CreateConfigRangoEdadDto, ConfigRangoEdadResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigRangoEdadMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class CrearConfigRangoEdadUseCase {
  constructor(
    @inject(CONFIG_RANGO_EDAD_REPOSITORY) private readonly repo: IConfigRangoEdadRepository,
  ) {}

  async execute(dto: CreateConfigRangoEdadDto): Promise<ConfigRangoEdadResponseDto> {
    const entity = await this.repo.create({
      nombre: dto.nombre,
      rango1: dto.rango1,
      rango2: dto.rango2,
      sexo: dto.sexo ?? null,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    })

    return ConfigRangoEdadMapper.toResponse(entity)
  }
}
