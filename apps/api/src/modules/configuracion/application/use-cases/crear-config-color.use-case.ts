import { inject, injectable } from 'tsyringe'
import { CONFIG_COLOR_REPOSITORY } from '../../domain/repositories/config-color.repository.js'
import type { IConfigColorRepository } from '../../domain/repositories/config-color.repository.js'
import type { ConfigColorResponseDto, CreateConfigColorDto } from '../dtos/configuracion.dto.js'
import { ConfigColorMapper } from '../../infrastructure/mappers/configuracion.mapper.js'

@injectable()
export class CrearConfigColorUseCase {
  constructor(
    @inject(CONFIG_COLOR_REPOSITORY) private readonly repo: IConfigColorRepository,
  ) {}

  async execute(dto: CreateConfigColorDto): Promise<ConfigColorResponseDto> {
    const entity = await this.repo.create({
      nombre: dto.nombre,
      codigo: dto.codigo ?? null,
      activo: 1,
    })

    return ConfigColorMapper.toResponse(entity)
  }
}
