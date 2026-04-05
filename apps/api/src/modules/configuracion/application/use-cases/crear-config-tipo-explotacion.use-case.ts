import { injectable, inject } from 'tsyringe'
import { CONFIG_TIPO_EXPLOTACION_REPOSITORY } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigTipoExplotacionRepository } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { CreateConfigTipoExplotacionDto, ConfigTipoExplotacionResponseDto } from '../dtos/configuracion.dto.js'
import { ConfigTipoExplotacionMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class CrearConfigTipoExplotacionUseCase {
  constructor(
    @inject(CONFIG_TIPO_EXPLOTACION_REPOSITORY) private readonly repo: IConfigTipoExplotacionRepository,
  ) {}

  async execute(dto: CreateConfigTipoExplotacionDto): Promise<ConfigTipoExplotacionResponseDto> {
    const entity = await this.repo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    })

    return ConfigTipoExplotacionMapper.toResponse(entity)
  }
}
