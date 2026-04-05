import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearInseminacionGrupalUseCase } from '../crear-inseminacion-grupal.use-case'
import type { IInseminacionGrupalRepository } from '../../../domain/repositories/inseminacion-grupal.repository'
import type { IInseminacionAnimalRepository } from '../../../domain/repositories/inseminacion-animal.repository'
import { ValidationError, ConflictError } from '../../../../../shared/errors'
import type { ITransactionManager } from '../../../../../shared/types/transaction'

describe('CrearInseminacionGrupalUseCase', () => {
  let useCase: CrearInseminacionGrupalUseCase
  let mockGrupalRepo: IInseminacionGrupalRepository
  let mockAnimalRepo: IInseminacionAnimalRepository
  let mockTxManager: ITransactionManager

  const mockGrupal = {
    id: 1,
    predioId: 1,
    codigo: 'INS001',
    fecha: new Date('2024-04-05'),
    veterinariosId: null,
    observaciones: 'Test insemination',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockAnimales = [
    {
      id: 1,
      inseminacionGrupalId: 1,
      animalId: 10,
      veterinarioId: null,
      fecha: new Date('2024-04-05'),
      tipoInseminacionKey: null,
      codigoPajuela: null,
      diagnosticoId: null,
      observaciones: null,
      activo: 1,
      createdAt: new Date(),
    },
  ]

  beforeEach(() => {
    mockGrupalRepo = {
      findById: vi.fn(),
      findByCodigo: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(mockGrupal),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    mockAnimalRepo = {
      findById: vi.fn(),
      findByAnimal: vi.fn(),
      findByGrupal: vi.fn(),
      createMany: vi.fn().mockResolvedValue(mockAnimales),
      update: vi.fn(),
      delete: vi.fn(),
    }

    mockTxManager = {
      execute: vi.fn().mockImplementation(async (callback: () => Promise<unknown>) => {
        const result = await callback()
        return result
      }),
    }

    useCase = new CrearInseminacionGrupalUseCase(mockGrupalRepo, mockAnimalRepo, mockTxManager)
  })

  it('should create group insemination with animals', async () => {
    const dto = {
      codigo: 'INS001',
      fecha: '2024-04-05T00:00:00Z',
      animales: [{ animalId: 10 }],
    }

    const result = await useCase.execute(dto, 1)

    expect(result.id).toBe(1)
    expect(result.codigo).toBe('INS001')
    expect(mockGrupalRepo.create).toHaveBeenCalled()
    expect(mockAnimalRepo.createMany).toHaveBeenCalled()
  })

  it('should throw ValidationError when no animals provided', async () => {
    const dto = {
      codigo: 'INS001',
      fecha: '2024-04-05T00:00:00Z',
      animales: [],
    }

    await expect(useCase.execute(dto, 1)).rejects.toThrow(ValidationError)
  })

  it('should throw ConflictError when code already exists', async () => {
    mockGrupalRepo.findByCodigo.mockResolvedValueOnce(mockGrupal)

    const dto = {
      codigo: 'INS001',
      fecha: '2024-04-05T00:00:00Z',
      animales: [{ animalId: 10 }],
    }

    await expect(useCase.execute(dto, 1)).rejects.toThrow(ConflictError)
  })

  it('should execute within transaction', async () => {
    const dto = {
      codigo: 'INS001',
      fecha: '2024-04-05T00:00:00Z',
      animales: [{ animalId: 10 }],
    }

    await useCase.execute(dto, 1)

    expect(mockTxManager.execute).toHaveBeenCalled()
  })
})
