import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateAnimalUseCase } from '../update-animal.use-case'
import { ANIMAL_REPOSITORY } from '../../../domain/repositories/animal.repository'
import type { IAnimalRepository } from '../../../domain/repositories/animal.repository'
import { NotFoundError, VersionConflictError } from '../../../../../shared/errors'
import type { AnimalEntity } from '../../../domain/entities/animal.entity'

describe('UpdateAnimalUseCase', () => {
  let useCase: UpdateAnimalUseCase
  let mockRepo: IAnimalRepository

  const existingAnimal: AnimalEntity = {
    id: 1,
    version: 1,
    predioId: 1,
    codigo: 'A001',
    nombre: 'Original Name',
    fechaNacimiento: new Date('2023-01-15'),
    fechaCompra: null,
    sexoKey: 1,
    tipoIngresoId: null,
    madreId: null,
    codigoMadre: null,
    indTransferenciaEmb: null,
    codigoDonadora: null,
    tipoPadreKey: null,
    padreId: null,
    codigoPadre: null,
    codigoPajuela: null,
    configRazasId: 1,
    potreroId: null,
    precioCompra: null,
    pesoCompra: null,
    codigoRfid: null,
    codigoArete: null,
    codigoQr: null,
    saludAnimalKey: null,
    estadoAnimalKey: null,
    indDescartado: null,
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const updatedAnimal: AnimalEntity = {
    ...existingAnimal,
    nombre: 'Updated Name',
    version: 2,
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingAnimal),
      findByCodigo: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updatedAnimal),
      softDelete: vi.fn(),
      getGenealogy: vi.fn(),
    }

    useCase = new UpdateAnimalUseCase(mockRepo)
  })

  it('should update animal when found', async () => {
    const dto = {
      nombre: 'Updated Name',
    }

    const result = await useCase.execute(1, 1, dto, 1)

    expect(result.nombre).toBe('Updated Name')
    expect(mockRepo.findById).toHaveBeenCalledWith(1, 1)
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ nombre: 'Updated Name' }))
  })

  it('should throw NotFoundError when animal does not exist', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)

    const dto = { nombre: 'New Name' }

    await expect(useCase.execute(99, 1, dto, 1)).rejects.toThrow(NotFoundError)
  })

  it('should convert fechaNacimiento string to Date when updating', async () => {
    const dto = {
      fechaNacimiento: '2024-01-15T00:00:00Z',
    }

    await useCase.execute(1, 1, dto, 1)

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({
      fechaNacimiento: expect.any(Date),
    }))
  })

  it('should handle null values for optional fields', async () => {
    const dto = {
      fechaNacimiento: null,
    }

    await useCase.execute(1, 1, dto, 1)

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({
      fechaNacimiento: null,
    }))
  })

  it('should only update provided fields', async () => {
    const dto = {
      nombre: 'Only Name Changed',
    }

    await useCase.execute(1, 1, dto, 1)

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({
      nombre: 'Only Name Changed',
    }))
  })

  it('should update multiple fields at once', async () => {
    const dto = {
      nombre: 'New Name',
      potreroId: 5,
      precioCompra: 2000,
    }

    await useCase.execute(1, 1, dto, 1)

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({
      nombre: 'New Name',
      potreroId: 5,
      precioCompra: 2000,
    }))
  })

  describe('optimistic locking (REQ-5, REQ-6, REQ-7)', () => {
    it('should throw VersionConflictError when expectedVersion does not match', async () => {
      const dto = { nombre: 'Updated Name' }

      await expect(useCase.execute(1, 1, dto, 999)).rejects.toThrow(VersionConflictError)
    })

    it('should include currentVersion and expectedVersion in error details', async () => {
      const dto = { nombre: 'Updated Name' }

      try {
        await useCase.execute(1, 1, dto, 999)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(VersionConflictError)
        const err = error as VersionConflictError
        expect(err.details.currentVersion).toEqual(['1'])
        expect(err.details.expectedVersion).toEqual(['999'])
      }
    })

    it('should increment version and return updated entity when version matches', async () => {
      const dto = { nombre: 'Updated Name' }

      const result = await useCase.execute(1, 1, dto, 1)

      expect(result.version).toBe(2)
      expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({
        nombre: 'Updated Name',
        version: 2,
      }))
    })

    it('should pass incremented version to repository update', async () => {
      const animalV5: AnimalEntity = { ...existingAnimal, version: 5 }
      mockRepo.findById.mockResolvedValue(animalV5)

      const dto = { nombre: 'V5 Update' }

      await useCase.execute(1, 1, dto, 5)

      expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({
        version: 6,
      }))
    })
  })
})
