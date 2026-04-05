import { inject, injectable } from 'tsyringe'
import { CONFIG_KEY_VALUE_REPOSITORY } from '../../domain/repositories/config-key-value.repository.js'
import type { IConfigKeyValueRepository } from '../../domain/repositories/config-key-value.repository.js'
import type { ConfigKeyValueResponseDto, UpdateConfigKeyValueDto } from '../dtos/configuracion.dto.js'
import { ConfigKeyValueMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigKeyValueUseCase {
  constructor(
    @inject(CONFIG_KEY_VALUE_REPOSITORY) private readonly repo: IConfigKeyValueRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigKeyValueDto): Promise<ConfigKeyValueResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigKeyValue', id)
    }

    // Check for duplicate (opcion, key) if being updated
    if ((dto.opcion || dto.key) && 
        (dto.opcion !== existing.opcion || dto.key !== existing.key)) {
      const newOpcion = dto.opcion ?? existing.opcion
      const newKey = dto.key ?? existing.key
      const duplicate = await this.repo.findByOpcionAndKey(newOpcion, newKey)
      if (duplicate) {
        throw new ConflictError(`La configuración '${newOpcion}:${newKey}' ya existe`)
      }
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigKeyValue', id)
    }

    return ConfigKeyValueMapper.toResponse(entity)
  }
}
