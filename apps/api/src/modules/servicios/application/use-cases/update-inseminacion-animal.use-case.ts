import { inject, injectable } from 'tsyringe'
import { INSEMINACION_ANIMAL_REPOSITORY } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { IInseminacionAnimalRepository } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { InseminacionAnimalResponseDto, UpdateInseminacionAnimalDto } from '../dtos/inseminacion.dto.js'
import { InseminacionAnimalMapper } from '../../infrastructure/mappers/inseminacion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'
import type { InseminacionAnimalEntity } from '../../domain/entities/inseminacion.entity.js'

@injectable()
export class UpdateInseminacionAnimalUseCase {
  constructor(
    @inject(INSEMINACION_ANIMAL_REPOSITORY) private readonly repo: IInseminacionAnimalRepository,
  ) {}

  async execute(id: number, dto: UpdateInseminacionAnimalDto, predioId: number): Promise<InseminacionAnimalResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('InseminacionAnimal', id)
    }

    const updateData: Partial<InseminacionAnimalEntity> = { updatedAt: new Date() }
    if (dto.veterinarioId !== undefined) updateData.veterinarioId = dto.veterinarioId
    if (dto.fecha !== undefined) updateData.fecha = new Date(dto.fecha)
    if (dto.tipoInseminacionKey !== undefined) updateData.tipoInseminacionKey = dto.tipoInseminacionKey
    if (dto.codigoPajuela !== undefined) updateData.codigoPajuela = dto.codigoPajuela
    if (dto.diagnosticoId !== undefined) updateData.diagnosticoId = dto.diagnosticoId
    if (dto.observaciones !== undefined) updateData.observaciones = dto.observaciones

    const updated = await this.repo.update(id, updateData, predioId)
    if (!updated) {
      throw new NotFoundError('InseminacionAnimal', id)
    }

    return InseminacionAnimalMapper.toResponse(updated)
  }
}
