import { inject, injectable } from 'tsyringe'
import { CONFIG_RAZA_REPOSITORY } from '../../domain/repositories/config-raza.repository.js'
import type { IConfigRazaRepository } from '../../domain/repositories/config-raza.repository.js'
import type { ConfigRazaResponseDto, UpdateConfigRazaDto } from '../dtos/configuracion.dto.js'
import { ConfigRazaMapper } from '../../infrastructure/mappers/configuracion.mapper.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigRazaUseCase {
  constructor(
    @inject(CONFIG_RAZA_REPOSITORY) private readonly repo: IConfigRazaRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigRazaDto): Promise<ConfigRazaResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigRaza', id)
    }

    // Check for duplicate nombre if being updated
    if (dto.nombre && dto.nombre !== existing.nombre) {
      const duplicate = await this.repo.findByNombre(dto.nombre)
      if (duplicate) {
        throw new ConflictError(`La raza '${dto.nombre}' ya existe`)
      }
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigRaza', id)
    }

    return ConfigRazaMapper.toResponse(entity)
  }
}
