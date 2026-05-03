import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListConfigCondicionesCorporalesUseCase } from '../list-config-condiciones-corporales.use-case'
import type { IConfigCondicionCorporalRepository } from '../../../domain/repositories/config-condicion-corporal.repository'
import type { ConfigCondicionCorporalEntity } from '../../../domain/entities/config-condicion-corporal.entity'

describe('ListConfigCondicionesCorporalesUseCase', () => {
  let useCase: ListConfigCondicionesCorporalesUseCase
  let mockRepo: IConfigCondicionCorporalRepository

  const mockCondicionesCorporales: ConfigCondicionCorporalEntity[] = [
    {
      id: 1,
      nombre: 'Muy delgado',
      valorMin: 1,
      valorMax: 1,
      descripcion: 'Costillas visibles, espinazo prominente',
      activo: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      nombre: 'Delgado',
      valorMin: 2,
      valorMax: 2,
      descripcion: 'Costillas palpables',
      activo: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      nombre: 'Ideal',
      valorMin: 3,
      valorMax: 3,
      descripcion: 'Costillas cubiertas, buena condición',
      activo: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      nombre: 'Gordo',
      valorMin: 4,
      valorMax: 4,
      descripcion: 'Costillas no palpables, grasa visible',
      activo: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      nombre: 'Muy gordo',
      valorMin: 5,
      valorMax: 5,
      descripcion: 'Exceso de grasa, pliegues',
      activo: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn().mockResolvedValue({
        data: mockCondicionesCorporales,
        total: 5,
      }),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    useCase = new ListConfigCondicionesCorporalesUseCase(mockRepo)
  })

  it('should return data with pagination shape { data, page, limit, total }', async () => {
    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('page')
    expect(result).toHaveProperty('limit')
    expect(result).toHaveProperty('total')
  })

  it('should return 5 items with correct pagination values', async () => {
    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(result.data).toHaveLength(5)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.total).toBe(5)
  })

  it('should return mapped items with correct fields', async () => {
    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(result.data[0]).toHaveProperty('id')
    expect(result.data[0]).toHaveProperty('nombre')
    expect(result.data[0]).toHaveProperty('valorMin')
    expect(result.data[0]).toHaveProperty('valorMax')
    expect(result.data[0]).toHaveProperty('descripcion')
    expect(result.data[0]).toHaveProperty('activo')
  })

  it('should return correct nombres for all 5 condiciones corporales', async () => {
    const result = await useCase.execute({ page: 1, limit: 20 })

    const nombres = result.data.map(item => item.nombre)
    expect(nombres).toContain('Muy delgado')
    expect(nombres).toContain('Delgado')
    expect(nombres).toContain('Ideal')
    expect(nombres).toContain('Gordo')
    expect(nombres).toContain('Muy gordo')
  })

  it('should call repo.findAll with correct opts', async () => {
    await useCase.execute({ page: 2, limit: 10 })

    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 10, search: undefined })
  })

  it('should pass search parameter to repo', async () => {
    await useCase.execute({ page: 1, limit: 20, search: 'Ideal' })

    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20, search: 'Ideal' })
  })
})