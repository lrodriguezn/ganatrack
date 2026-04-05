import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateAnimalUseCase } from '../update-animal.use-case'
import { ANIMAL_REPOSITORY } from '../../../domain/repositories/animal.repository'
import type { IAnimalRepository } from '../../../domain/repositories/animal.repository'
import { NotFoundError } from '../../../../../shared/errors'
import type { AnimalEntity } from '../../../domain/entities/animal.entity'

describe('UpdateAnimalUseCase', () => {
  let useCase: UpdateAnimalUseCase
  let mockRepo: IAnimalRepository

  const existingAnimal: AnimalEntity = {
    id: 1,
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

    const result = await useCase.execute(1, 1, dto)

    expect(result.nombre).toBe('Updated Name')
    expect(mockRepo.findById).toHaveBeenCalledWith(1, 1)
    expect(mockRepo.update).toHaveBeenCalledWith(1, { nombre: 'Updated Name' })
  })

  it('should throw NotFoundError when animal does not exist', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)

    const dto = { nombre: 'New Name' }

    await expect(useCase.execute(99, 1, dto)).rejects.toThrow(NotFoundError)
  })

  it('should convert fechaNacimiento string to Date when updating', async () => {
    const dto = {
      fechaNacimiento: '2024-01-15T00:00:00Z',
    }

    await useCase.execute(1, 1, dto)

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      fechaNacimiento: expect.any(Date),
    })
  })

  it('should handle null values for optional fields', async () => {
    const dto = {
      fechaNacimiento: null,
    }

    await useCase.execute(1, 1, dto)

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      fechaNacimiento: null,
    })
  })

  it('should only update provided fields', async () => {
    const dto = {
      nombre: 'Only Name Changed',
    }

    await useCase.execute(1, 1, dto)

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      nombre: 'Only Name Changed',
    })
  })

  it('should update multiple fields at once', async () => {
    const dto = {
      nombre: 'New Name',
      potreroId: 5,
      precioCompra: 2000,
    }

    await useCase.execute(1, 1, dto)

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      nombre: 'New Name',
      potreroId: 5,
      precioCompra: 2000,
    })
  })
})
