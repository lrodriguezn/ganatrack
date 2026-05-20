import { inject, injectable } from 'tsyringe'
import { PARTO_ANIMAL_REPOSITORY } from '../../domain/repositories/parto-animal.repository.js'
import type { IPartoAnimalRepository } from '../../domain/repositories/parto-animal.repository.js'
import type { PartoAnimalResponseDto, UpdatePartoAnimalDto } from '../dtos/parto.dto.js'
import { PartoAnimalMapper } from '../../infrastructure/mappers/parto.mapper.js'
import { NotFoundError, VersionConflictError } from '../../../../shared/errors/index.js'
import type { PartoAnimalEntity } from '../../domain/entities/parto.entity.js'

@injectable()
export class UpdatePartoUseCase {
  constructor(
    @inject(PARTO_ANIMAL_REPOSITORY) private readonly repo: IPartoAnimalRepository,
  ) {}

  async execute(id: number, dto: UpdatePartoAnimalDto, predioId: number, expectedVersion: number): Promise<PartoAnimalResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('PartoAnimal', id)
    }

    // Optimistic locking: check version
    if (existing.version !== expectedVersion) {
      throw new VersionConflictError(existing.version, expectedVersion)
    }

    const newVersion = existing.version + 1

    const updateData: Partial<PartoAnimalEntity> = { version: newVersion, updatedAt: new Date() }
    if (dto.fecha !== undefined) updateData.fecha = new Date(dto.fecha)
    if (dto.macho !== undefined) updateData.macho = dto.macho
    if (dto.hembra !== undefined) updateData.hembra = dto.hembra
    if (dto.muertos !== undefined) updateData.muertos = dto.muertos
    if (dto.peso !== undefined) updateData.peso = dto.peso
    if (dto.tipoPartoKey !== undefined) updateData.tipoPartoKey = dto.tipoPartoKey
    if (dto.observaciones !== undefined) updateData.observaciones = dto.observaciones

    const updated = await this.repo.update(id, updateData, predioId)
    if (!updated) {
      throw new NotFoundError('PartoAnimal', id)
    }

    return { ...PartoAnimalMapper.toResponse(updated), crias: [] }
  }
}
