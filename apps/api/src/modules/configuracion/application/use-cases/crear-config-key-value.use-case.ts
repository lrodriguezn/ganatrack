import { inject, injectable } from 'tsyringe'
import { CONFIG_KEY_VALUE_REPOSITORY } from '../../domain/repositories/config-key-value.repository.js'
import type { IConfigKeyValueRepository } from '../../domain/repositories/config-key-value.repository.js'
import type { ConfigKeyValueResponseDto, CreateConfigKeyValueDto } from '../dtos/configuracion.dto.js'
import { ConfigKeyValueMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearConfigKeyValueUseCase {
  constructor(
    @inject(CONFIG_KEY_VALUE_REPOSITORY) private readonly repo: IConfigKeyValueRepository,
  ) {}

  async execute(dto: CreateConfigKeyValueDto): Promise<ConfigKeyValueResponseDto> {
    // Check if (opcion, key) already exists
    const existing = await this.repo.findByOpcionAndKey(dto.opcion, dto.key)
    if (existing) {
      throw new ConflictError(`La configuración '${dto.opcion}:${dto.key}' ya existe`)
    }

    const entity = await this.repo.create({
      opcion: dto.opcion,
      key: dto.key,
      value: dto.value ?? null,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    })

    return ConfigKeyValueMapper.toResponse(entity)
  }
}
