import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdatePartoUseCase } from '../update-parto.use-case'
import type { IPartoAnimalRepository } from '../../../domain/repositories/parto-animal.repository'
import { NotFoundError, VersionConflictError } from '../../../../../shared/errors'
import type { PartoAnimalEntity } from '../../../domain/entities/parto.entity'

describe('UpdatePartoUseCase', () => {
  let useCase: UpdatePartoUseCase
  let mockRepo: IPartoAnimalRepository

  const existing: PartoAnimalEntity = {
    id: 1, predioId: 1, animalId: 10, fecha: new Date('2024-04-05'),
    macho: 1, hembra: 0, muertos: 0, peso: 25.5, tipoPartoKey: 1,
    observaciones: 'Original', activo: 1, version: 1,
    createdAt: new Date(), updatedAt: new Date(),
  }

  const updated: PartoAnimalEntity = {
    ...existing, observaciones: 'Updated', version: 2, updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(existing),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updated),
      softDelete: vi.fn(),
    }
    useCase = new UpdatePartoUseCase(mockRepo)
  })

  it('should update when version matches', async () => {
    const result = await useCase.execute(1, { observaciones: 'Updated' }, 1, 1)
    expect(result.observaciones).toBe('Updated')
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ version: 2 }), 1)
  })

  it('should throw NotFoundError when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute(99, {}, 1, 1)).rejects.toThrow(NotFoundError)
  })

  it('should throw VersionConflictError when version mismatches', async () => {
    await expect(useCase.execute(1, {}, 1, 999)).rejects.toThrow(VersionConflictError)
  })

  it('should increment version on successful update', async () => {
    const v5: PartoAnimalEntity = { ...existing, version: 5 }
    mockRepo.findById.mockResolvedValue(v5)
    await useCase.execute(1, { observaciones: 'V5' }, 1, 5)
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ version: 6 }), 1)
  })
})
