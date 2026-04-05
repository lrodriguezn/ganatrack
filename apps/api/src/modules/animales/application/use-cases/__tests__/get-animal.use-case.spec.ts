import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetAnimalUseCase } from '../get-animal.use-case'
import { ANIMAL_REPOSITORY } from '../../../domain/repositories/animal.repository'
import type { IAnimalRepository } from '../../../domain/repositories/animal.repository'
import { NotFoundError } from '../../../../../shared/errors'
import type { AnimalEntity } from '../../../domain/entities/animal.entity'

describe('GetAnimalUseCase', () => {
  let useCase: GetAnimalUseCase
  let mockRepo: IAnimalRepository

  const mockAnimal: AnimalEntity = {
    id: 1,
    predioId: 1,
    codigo: 'A001',
    nombre: 'Test Animal',
    fechaNacimiento: new Date('2023-01-15'),
    fechaCompra: new Date('2023-06-01'),
    sexoKey: 1,
    tipoIngresoId: 1,
    madreId: null,
    codigoMadre: null,
    indTransferenciaEmb: null,
    codigoDonadora: null,
    tipoPadreKey: null,
    padreId: null,
    codigoPadre: null,
    codigoPajuela: null,
    configRazasId: 1,
    potreroId: 1,
    precioCompra: 1000,
    pesoCompra: 50,
    codigoRfid: 'RFID001',
    codigoArete: 'A001',
    codigoQr: 'QR001',
    saludAnimalKey: 1,
    estadoAnimalKey: 1,
    indDescartado: 0,
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockAnimal),
      findByCodigo: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      getGenealogy: vi.fn(),
    }

    useCase = new GetAnimalUseCase(mockRepo)
  })

  it('should return animal when found', async () => {
    const result = await useCase.execute(1, 1)

    expect(result.id).toBe(1)
    expect(result.codigo).toBe('A001')
    expect(result.nombre).toBe('Test Animal')
    expect(mockRepo.findById).toHaveBeenCalledWith(1, 1)
  })

  it('should throw NotFoundError when animal does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundError)
  })

  it('should call repository with correct parameters', async () => {
    await useCase.execute(5, 10)

    expect(mockRepo.findById).toHaveBeenCalledWith(5, 10)
  })
})
