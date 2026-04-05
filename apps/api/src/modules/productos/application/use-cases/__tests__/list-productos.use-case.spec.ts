import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListProductosUseCase } from '../list-productos.use-case'
import type { IProductoRepository } from '../../../domain/repositories/producto.repository'
import type { ProductoEntity } from '../../../domain/entities/producto.entity'

describe('ListProductosUseCase', () => {
  let useCase: ListProductosUseCase
  let mockRepo: IProductoRepository

  const mockProducto: ProductoEntity = {
    id: 1,
    predioId: 1,
    codigo: 'PROD001',
    nombre: 'Vaccine',
    descripcion: 'Animal vaccine',
    tipoProducto: 'medicine',
    categoria: 'veterinary',
    presentacion: 'bottle',
    unidadMedida: 'ml',
    precioUnitario: 50,
    stockMinimo: 10,
    stockActual: 100,
    fechaVencimiento: null,
    laboratorio: 'Pfizer',
    registroInvima: null,
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue({ data: [mockProducto], total: 1 }),
      create: vi.fn(),
      update: vi.fn(),
      updateStock: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new ListProductosUseCase(mockRepo)
  })

  it('should return paginated products', async () => {
    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data).toHaveLength(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.total).toBe(1)
    expect(mockRepo.findAll).toHaveBeenCalledWith(1, { page: 1, limit: 20, tipoProducto: undefined })
  })

  it('should pass tipoProducto filter to repository', async () => {
    await useCase.execute(1, { page: 1, limit: 20, tipoProducto: 'medicine' })

    expect(mockRepo.findAll).toHaveBeenCalledWith(1, { page: 1, limit: 20, tipoProducto: 'medicine' })
  })

  it('should return empty list when no products exist', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 })

    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})
