import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListPrediosUseCase } from '../list-predios.use-case'
import type { IPredioRepository } from '../../../domain/repositories/predio.repository'
import type { PredioEntity } from '../../../domain/entities/predio.entity'

describe('ListPrediosUseCase', () => {
  let useCase: ListPrediosUseCase
  let mockRepo: IPredioRepository

  const mockPredio: PredioEntity = {
    id: 1,
    codigo: 'P001',
    nombre: 'Finca Test',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    vereda: 'La Verde',
    areaHectareas: 100,
    capacidadMaxima: 50,
    tipoExplotacionId: 1,
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue({ data: [mockPredio], total: 1 }),
      create: vi.fn(),
      update: vi.fn(),
      existsByCodigo: vi.fn(),
    }

    useCase = new ListPrediosUseCase(mockRepo)
  })

  it('should return paginated predios', async () => {
    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(result.data).toHaveLength(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.total).toBe(1)
    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined })
  })

  it('should pass search parameter to repository', async () => {
    await useCase.execute({ page: 1, limit: 20, search: 'P001' })

    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20, search: 'P001' })
  })

  it('should return empty list when no predios exist', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 })

    const result = await useCase.execute({ page: 1, limit: 20 })

    expect(result.data).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})
