import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListAnimalesUseCase } from '../list-animales.use-case'
import { ANIMAL_REPOSITORY } from '../../../domain/repositories/animal.repository'
import type { IAnimalRepository } from '../../../domain/repositories/animal.repository'
import { AnimalMapper } from '../../../infrastructure/mappers/animal.mapper'
import type { AnimalEntity } from '../../../domain/entities/animal.entity'

describe('ListAnimalesUseCase', () => {
  let useCase: ListAnimalesUseCase
  let mockRepo: IAnimalRepository

  const mockAnimal: AnimalEntity = {
    id: 1,
    predioId: 1,
    codigo: 'A001',
    nombre: null,
    fechaNacimiento: null,
    fechaCompra: null,
    sexoKey: null,
    tipoIngresoId: null,
    madreId: null,
    codigoMadre: null,
    indTransferenciaEmb: null,
    codigoDonadora: null,
    tipoPadreKey: null,
    padreId: null,
    codigoPadre: null,
    codigoPajuela: null,
    configRazasId: null,
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
      findAll: vi.fn().mockResolvedValue({ data: [mockAnimal], total: 1 }),
      findById: vi.fn(),
      findByCodigo: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      getGenealogy: vi.fn(),
    }

    useCase = new ListAnimalesUseCase(mockRepo)
  })

  it('should return paginated animals', async () => {
    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data).toHaveLength(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.total).toBe(1)
    expect(mockRepo.findAll).toHaveBeenCalledWith(1, { page: 1, limit: 20, search: undefined, potreroId: undefined, estado: undefined })
  })

  it('should pass search parameter to repository', async () => {
    await useCase.execute(1, { page: 1, limit: 20, search: 'A001' })

    expect(mockRepo.findAll).toHaveBeenCalledWith(1, { page: 1, limit: 20, search: 'A001', potreroId: undefined, estado: undefined })
  })

  it('should pass potreroId filter to repository', async () => {
    await useCase.execute(1, { page: 1, limit: 20, potreroId: 5 })

    expect(mockRepo.findAll).toHaveBeenCalledWith(1, { page: 1, limit: 20, search: undefined, potreroId: 5, estado: undefined })
  })

  it('should pass estado filter to repository', async () => {
    await useCase.execute(1, { page: 1, limit: 20, estado: 1 })

    expect(mockRepo.findAll).toHaveBeenCalledWith(1, { page: 1, limit: 20, search: undefined, potreroId: undefined, estado: 1 })
  })

  it('should map entities to response DTOs', async () => {
    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data[0]).toEqual(AnimalMapper.toResponse(mockAnimal))
  })

  it('should return empty list when no animals exist', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 })

    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})
