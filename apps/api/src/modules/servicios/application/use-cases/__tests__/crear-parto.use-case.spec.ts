import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearPartoUseCase } from '../crear-parto.use-case'
import type { IPartoAnimalRepository } from '../../../domain/repositories/parto-animal.repository'
import type { IPartoCriaRepository } from '../../../domain/repositories/parto-cria.repository'
import type { ITransactionManager } from '../../../../../shared/types/transaction'

describe('CrearPartoUseCase', () => {
  let useCase: CrearPartoUseCase
  let mockRepo: IPartoAnimalRepository
  let mockCriaRepo: IPartoCriaRepository
  let mockTxManager: ITransactionManager

  const mockParto = {
    id: 1,
    predioId: 1,
    animalId: 10,
    fecha: new Date('2024-04-05'),
    macho: 1,
    hembra: 0,
    muertos: 0,
    peso: 25.5,
    tipoPartoKey: 1,
    observaciones: 'Test birth',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCrias = [
    { id: 1, partoId: 1, criaId: 20, sexoKey: 1, pesoNacimiento: 20, observaciones: null, activo: 1, createdAt: new Date() },
  ]

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(mockParto),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    mockCriaRepo = {
      findById: vi.fn(),
      findByParto: vi.fn(),
      createMany: vi.fn().mockResolvedValue(mockCrias),
    }

    mockTxManager = {
      execute: vi.fn().mockImplementation(async (callback: () => Promise<unknown>) => {
        const result = await callback()
        return result
      }),
    }

    useCase = new CrearPartoUseCase(mockRepo, mockCriaRepo, mockTxManager)
  })

  it('should create a birth record with cria', async () => {
    const dto = {
      animalId: 10,
      fecha: '2024-04-05T00:00:00Z',
      macho: 1,
      hembra: 0,
      muertos: 0,
      peso: 25.5,
      tipoPartoKey: 1,
      observaciones: 'Test birth',
      crias: [{ criaId: 20, sexoKey: 1, pesoNacimiento: 20 }],
    }

    const result = await useCase.execute(dto, 1)

    expect(result.id).toBe(1)
    expect(result.animalId).toBe(10)
    expect(mockRepo.create).toHaveBeenCalled()
    expect(mockCriaRepo.createMany).toHaveBeenCalled()
  })

  it('should execute within transaction', async () => {
    const dto = {
      animalId: 10,
      fecha: '2024-04-05T00:00:00Z',
    }

    await useCase.execute(dto, 1)

    expect(mockTxManager.execute).toHaveBeenCalled()
  })

  it('should handle null optional fields', async () => {
    const dto = {
      animalId: 10,
      fecha: '2024-04-05T00:00:00Z',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        macho: null,
        hembra: null,
        muertos: null,
        peso: null,
      })
    )
  })
})
