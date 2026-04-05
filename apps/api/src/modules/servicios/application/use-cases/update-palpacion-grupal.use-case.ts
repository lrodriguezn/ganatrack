import { inject, injectable } from 'tsyringe'
import { PALPACION_GRUPAL_REPOSITORY } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionGrupalRepository } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { PalpacionGrupalResponseDto, UpdatePalpacionGrupalDto } from '../dtos/palpacion.dto.js'
import { PalpacionGrupalMapper } from '../../infrastructure/mappers/palpacion.mapper.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'
import type { PalpacionGrupalEntity } from '../../domain/entities/palpacion.entity.js'

@injectable()
export class UpdatePalpacionGrupalUseCase {
  constructor(
    @inject(PALPACION_GRUPAL_REPOSITORY) private readonly repo: IPalpacionGrupalRepository,
  ) {}

  async execute(id: number, dto: UpdatePalpacionGrupalDto, predioId: number): Promise<PalpacionGrupalResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('PalpacionGrupal', id)
    }

    // Check duplicate codigo if changed
    if (dto.codigo && dto.codigo !== existing.codigo) {
      const duplicate = await this.repo.findByCodigo(dto.codigo, predioId)
      if (duplicate) {
        throw new ConflictError(`La palpación con código '${dto.codigo}' ya existe en este predio`)
      }
    }

    const updateData: Partial<PalpacionGrupalEntity> = {
      updatedAt: new Date(),
    }
    if (dto.codigo !== undefined) updateData.codigo = dto.codigo
    if (dto.fecha !== undefined) updateData.fecha = new Date(dto.fecha)
    if (dto.veterinariosId !== undefined) updateData.veterinariosId = dto.veterinariosId
    if (dto.observaciones !== undefined) updateData.observaciones = dto.observaciones

    const updated = await this.repo.update(id, updateData)
    if (!updated) {
      throw new NotFoundError('PalpacionGrupal', id)
    }

    return PalpacionGrupalMapper.toResponse(updated)
  }
}
