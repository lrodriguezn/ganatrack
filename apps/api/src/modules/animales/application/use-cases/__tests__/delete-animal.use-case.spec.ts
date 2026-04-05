import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteAnimalUseCase } from '../delete-animal.use-case'
import { ANIMAL_REPOSITORY } from '../../../domain/repositories/animal.repository'
import type { IAnimalRepository } from '../../../domain/repositories/animal.repository'
import { NotFoundError } from '../../../../../shared/errors'

describe('DeleteAnimalUseCase', () => {
  let useCase: DeleteAnimalUseCase
  let mockRepo: IAnimalRepository

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByCodigo: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn().mockResolvedValue(true),
      getGenealogy: vi.fn(),
    }

    useCase = new DeleteAnimalUseCase(mockRepo)
  })

  it('should soft delete animal when found', async () => {
    mockRepo.findById.mockResolvedValueOnce({ id: 1, predioId: 1, codigo: 'A001' } as any)

    await useCase.execute(1, 1)

    expect(mockRepo.softDelete).toHaveBeenCalledWith(1, 1)
  })

  it('should throw NotFoundError when animal does not exist', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)

    await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundError)
  })

  it('should call repository with correct parameters', async () => {
    mockRepo.findById.mockResolvedValueOnce({ id: 5, predioId: 10, codigo: 'A005' } as any)

    await useCase.execute(5, 10)

    expect(mockRepo.softDelete).toHaveBeenCalledWith(5, 10)
  })
})
