import { injectable, inject } from 'tsyringe'
import { CONFIG_CONDICION_CORPORAL_REPOSITORY } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigCondicionCorporalRepository } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { CreateConfigCondicionCorporalDto, ConfigCondicionCorporalResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigCondicionCorporalMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class CrearConfigCondicionCorporalUseCase {
  constructor(
    @inject(CONFIG_CONDICION_CORPORAL_REPOSITORY) private readonly repo: IConfigCondicionCorporalRepository,
  ) {}

  async execute(dto: CreateConfigCondicionCorporalDto): Promise<ConfigCondicionCorporalResponseDto> {
    const entity = await this.repo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      valorMin: dto.valorMin ?? null,
      valorMax: dto.valorMax ?? null,
      activo: 1,
    })

    return ConfigCondicionCorporalMapper.toResponse(entity)
  }
}
