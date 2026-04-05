import { injectable, inject } from 'tsyringe'
import { PALPACION_ANIMAL_REPOSITORY } from '../../domain/repositories/palpacion-animal.repository.js'
import type { IPalpacionAnimalRepository } from '../../domain/repositories/palpacion-animal.repository.js'
import type { UpdatePalpacionAnimalDto, PalpacionAnimalResponseDto } from '../dtos/palpacion.dto.js'
import { PalpacionAnimalMapper } from '../../infrastructure/mappers/palpacion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'
import type { PalpacionAnimalEntity } from '../../domain/entities/palpacion.entity.js'

@injectable()
export class UpdatePalpacionAnimalUseCase {
  constructor(
    @inject(PALPACION_ANIMAL_REPOSITORY) private readonly repo: IPalpacionAnimalRepository,
  ) {}

  async execute(id: number, dto: UpdatePalpacionAnimalDto, predioId: number): Promise<PalpacionAnimalResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('PalpacionAnimal', id)
    }

    const updateData: Partial<PalpacionAnimalEntity> = {
      updatedAt: new Date(),
    }
    if (dto.veterinarioId !== undefined) updateData.veterinarioId = dto.veterinarioId
    if (dto.diagnosticoId !== undefined) updateData.diagnosticoId = dto.diagnosticoId
    if (dto.condicionCorporalId !== undefined) updateData.condicionCorporalId = dto.condicionCorporalId
    if (dto.fecha !== undefined) updateData.fecha = new Date(dto.fecha)
    if (dto.diasGestacion !== undefined) updateData.diasGestacion = dto.diasGestacion
    if (dto.fechaParto !== undefined) updateData.fechaParto = dto.fechaParto ? new Date(dto.fechaParto) : null
    if (dto.comentarios !== undefined) updateData.comentarios = dto.comentarios

    const updated = await this.repo.update(id, updateData, predioId)
    if (!updated) {
      throw new NotFoundError('PalpacionAnimal', id)
    }

    return PalpacionAnimalMapper.toResponse(updated)
  }
}
