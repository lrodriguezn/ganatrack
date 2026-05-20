import { inject, injectable } from 'tsyringe'
import { INSEMINACION_GRUPAL_REPOSITORY } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionGrupalRepository } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { InseminacionGrupalResponseDto, UpdateInseminacionGrupalDto } from '../dtos/inseminacion.dto.js'
import { InseminacionGrupalMapper } from '../../infrastructure/mappers/inseminacion.mapper.js'
import { ConflictError, NotFoundError, VersionConflictError } from '../../../../shared/errors/index.js'
import type { InseminacionGrupalEntity } from '../../domain/entities/inseminacion.entity.js'

@injectable()
export class UpdateInseminacionGrupalUseCase {
  constructor(
    @inject(INSEMINACION_GRUPAL_REPOSITORY) private readonly repo: IInseminacionGrupalRepository,
  ) {}

  async execute(id: number, dto: UpdateInseminacionGrupalDto, predioId: number, expectedVersion: number): Promise<InseminacionGrupalResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('InseminacionGrupal', id)
    }

    // Optimistic locking: check version
    if (existing.version !== expectedVersion) {
      throw new VersionConflictError(existing.version, expectedVersion)
    }

    if (dto.codigo && dto.codigo !== existing.codigo) {
      const duplicate = await this.repo.findByCodigo(dto.codigo, predioId)
      if (duplicate) {
        throw new ConflictError(`La inseminación con código '${dto.codigo}' ya existe en este predio`)
      }
    }

    const newVersion = existing.version + 1

    const updateData: Partial<InseminacionGrupalEntity> = { version: newVersion, updatedAt: new Date() }
    if (dto.codigo !== undefined) updateData.codigo = dto.codigo
    if (dto.fecha !== undefined) updateData.fecha = new Date(dto.fecha)
    if (dto.veterinariosId !== undefined) updateData.veterinariosId = dto.veterinariosId
    if (dto.observaciones !== undefined) updateData.observaciones = dto.observaciones

    const updated = await this.repo.update(id, updateData)
    if (!updated) {
      throw new NotFoundError('InseminacionGrupal', id)
    }

    return InseminacionGrupalMapper.toResponse(updated)
  }
}
