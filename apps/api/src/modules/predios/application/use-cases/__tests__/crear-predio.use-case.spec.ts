import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearPredioUseCase } from '../crear-predio.use-case'
import type { IPredioRepository } from '../../../domain/repositories/predio.repository'
import { ConflictError } from '../../../../../shared/errors'
import type { PredioEntity } from '../../../domain/entities/predio.entity'

describe('CrearPredioUseCase', () => {
  let useCase: CrearPredioUseCase
  let mockRepo: IPredioRepository

  const createdPredio: PredioEntity = {
    id: 1,
    codigo: 'P001',
    nombre: 'Finca Test',
    departamento: 'Antioquia',
    municipio: null,
    vereda: null,
    areaHectareas: 100,
    capacidadMaxima: 50,
    tipoExplotacionId: null,
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(createdPredio),
      update: vi.fn(),
      softDelete: vi.fn(),
      findByCodigo: vi.fn().mockResolvedValue(null),
    }

    useCase = new CrearPredioUseCase(mockRepo)
  })

  it('should create a new predio', async () => {
    const dto = {
      codigo: 'P001',
      nombre: 'Finca Test',
      areaHectareas: 100,
    }

    const result = await useCase.execute(dto)

    expect(result.id).toBe(1)
    expect(result.codigo).toBe('P001')
    expect(mockRepo.findByCodigo).toHaveBeenCalledWith('P001')
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('should throw ConflictError when code already exists', async () => {
    mockRepo.findByCodigo.mockResolvedValueOnce(createdPredio)

    const dto = {
      codigo: 'P001',
      nombre: 'Finca Test',
    }

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictError)
  })

  it('should set activo to 1 on create', async () => {
    const dto = {
      codigo: 'P002',
      nombre: 'Another Finca',
    }

    await useCase.execute(dto)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        activo: 1,
      })
    )
  })

  it('should set optional fields to null when not provided', async () => {
    const dto = {
      codigo: 'P003',
      nombre: 'Minimal Finca',
    }

    await useCase.execute(dto)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        departamento: null,
        municipio: null,
        vereda: null,
        areaHectareas: null,
        capacidadMaxima: null,
        tipoExplotacionId: null,
      })
    )
  })
})
