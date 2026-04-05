import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearProductoUseCase } from '../crear-producto.use-case'
import type { IProductoRepository } from '../../../domain/repositories/producto.repository'
import { ConflictError } from '../../../../../shared/errors'
import type { ProductoEntity } from '../../../domain/entities/producto.entity'

describe('CrearProductoUseCase', () => {
  let useCase: CrearProductoUseCase
  let mockRepo: IProductoRepository

  const createdProducto: ProductoEntity = {
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
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(createdProducto),
      update: vi.fn(),
      updateStock: vi.fn(),
      delete: vi.fn(),
      findByCodigo: vi.fn().mockResolvedValue(null),
    }

    useCase = new CrearProductoUseCase(mockRepo)
  })

  it('should create a new product', async () => {
    const dto = {
      codigo: 'PROD001',
      nombre: 'Vaccine',
      tipoProducto: 'medicine',
      precioUnitario: 50,
    }

    const result = await useCase.execute(dto, 1)

    expect(result.id).toBe(1)
    expect(result.codigo).toBe('PROD001')
    expect(mockRepo.findByCodigo).toHaveBeenCalledWith('PROD001', 1)
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('should throw ConflictError when code already exists', async () => {
    mockRepo.findByCodigo.mockResolvedValueOnce(createdProducto)

    const dto = {
      codigo: 'PROD001',
      nombre: 'Vaccine',
    }

    await expect(useCase.execute(dto, 1)).rejects.toThrow(ConflictError)
  })

  it('should set activo to 1 on create', async () => {
    const dto = {
      codigo: 'PROD002',
      nombre: 'Another Product',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        activo: 1,
      })
    )
  })

  it('should set optional fields to null when not provided', async () => {
    const dto = {
      codigo: 'PROD003',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: null,
        descripcion: null,
        tipoProducto: null,
        categoria: null,
        presentacion: null,
        unidadMedida: null,
        precioUnitario: null,
      })
    )
  })
})
