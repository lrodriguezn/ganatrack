import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddPalpacionAnimalUseCase } from '../add-palpacion-animal.use-case'
import type { IPalpacionGrupalRepository } from '../../../domain/repositories/palpacion-grupal.repository'
import type { IPalpacionAnimalRepository } from '../../../domain/repositories/palpacion-animal.repository'
import { NotFoundError } from '../../../../../shared/errors'

describe('AddPalpacionAnimalUseCase', () => {
  let useCase: AddPalpacionAnimalUseCase
  let mockGrupalRepo: IPalpacionGrupalRepository
  let mockRepo: IPalpacionAnimalRepository

  const mockGrupal = {
    id: 1,
    predioId: 1,
    codigo: 'PALP001',
    fecha: new Date('2024-04-05'),
    veterinariosId: null,
    observaciones: null,
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPalpacionAnimal = {
    id: 1,
    palpacionGrupalId: 1,
    animalId: 10,
    veterinarioId: null,
    diagnosticoId: 1,
    condicionCorporalId: null,
    fecha: new Date('2024-04-05'),
    diasGestacion: 90,
    fechaParto: new Date('2024-07-04'),
    comentarios: 'Test palpation',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockGrupalRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockGrupal),
      findByCodigo: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    mockRepo = {
      findById: vi.fn(),
      findByAnimal: vi.fn(),
      create: vi.fn().mockResolvedValue(mockPalpacionAnimal),
      update: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new AddPalpacionAnimalUseCase(mockGrupalRepo, mockRepo)
  })

  it('should add animal to palpacion group', async () => {
    const dto = {
      animalId: 10,
      diagnosticoId: 1,
      diasGestacion: 90,
      fechaParto: '2024-07-04T00:00:00Z',
      comentarios: 'Test palpation',
    }

    const result = await useCase.execute(1, dto, 1)

    expect(result.id).toBe(1)
    expect(result.animalId).toBe(10)
    expect(mockGrupalRepo.findById).toHaveBeenCalledWith(1, 1)
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('should throw NotFoundError when grupal does not exist', async () => {
    mockGrupalRepo.findById.mockResolvedValue(null)

    const dto = {
      animalId: 10,
    }

    await expect(useCase.execute(99, dto, 1)).rejects.toThrow(NotFoundError)
  })

  it('should set optional fields to null when not provided', async () => {
    const dto = {
      animalId: 10,
    }

    await useCase.execute(1, dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        palpacionGrupalId: 1,
        animalId: 10,
        veterinarioId: null,
        diagnosticoId: null,
        condicionCorporalId: null,
        diasGestacion: null,
        fechaParto: null,
        comentarios: null,
      })
    )
  })

  it('should use current date when fecha not provided', async () => {
    const dto = {
      animalId: 10,
    }

    await useCase.execute(1, dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fecha: expect.any(Date),
      })
    )
  })
})
