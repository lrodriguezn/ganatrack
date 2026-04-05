import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearAnimalUseCase } from '../crear-animal.use-case'
import { ANIMAL_REPOSITORY } from '../../../domain/repositories/animal.repository'
import type { IAnimalRepository } from '../../../domain/repositories/animal.repository'
import { ConflictError } from '../../../../../shared/errors'
import type { AnimalEntity } from '../../../domain/entities/animal.entity'

describe('CrearAnimalUseCase', () => {
  let useCase: CrearAnimalUseCase
  let mockRepo: IAnimalRepository

  const createdAnimal: AnimalEntity = {
    id: 1,
    predioId: 1,
    codigo: 'A001',
    nombre: 'New Animal',
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

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByCodigo: vi.fn().mockResolvedValue(null), // No existing animal
      create: vi.fn().mockResolvedValue(createdAnimal),
      update: vi.fn(),
      softDelete: vi.fn(),
      getGenealogy: vi.fn(),
    }

    useCase = new CrearAnimalUseCase(mockRepo)
  })

  it('should create animal with valid data', async () => {
    const dto = {
      codigo: 'A001',
      nombre: 'New Animal',
      sexoKey: 1,
      configRazasId: 1,
    }

    const result = await useCase.execute(dto, 1)

    expect(result.id).toBe(1)
    expect(result.codigo).toBe('A001')
    expect(mockRepo.findByCodigo).toHaveBeenCalledWith('A001', 1)
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('should throw ConflictError when code already exists', async () => {
    mockRepo.findByCodigo.mockResolvedValueOnce(createdAnimal)

    const dto = {
      codigo: 'A001',
    }

    await expect(useCase.execute(dto, 1)).rejects.toThrow(ConflictError)
  })

  it('should set activo to 1 on create', async () => {
    const dto = {
      codigo: 'A002',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        activo: 1,
      })
    )
  })

  it('should convert fechaNacimiento string to Date', async () => {
    const dto = {
      codigo: 'A003',
      fechaNacimiento: '2023-01-15T00:00:00Z',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fechaNacimiento: expect.any(Date),
      })
    )
  })

  it('should set optional fields to null when not provided', async () => {
    const dto = {
      codigo: 'A004',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: null,
        fechaNacimiento: null,
        fechaCompra: null,
        madreId: null,
      })
    )
  })
})
