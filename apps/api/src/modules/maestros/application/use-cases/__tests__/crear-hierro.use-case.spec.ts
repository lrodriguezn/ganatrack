import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearHierroUseCase } from '../crear-hierro.use-case'
import type { IHierroRepository } from '../../../domain/repositories/hierro.repository'
import type { HierroEntity } from '../../../domain/entities/hierro.entity'

describe('CrearHierroUseCase', () => {
  let useCase: CrearHierroUseCase
  let mockRepo: IHierroRepository

  const createdHierro: HierroEntity = {
    id: 1,
    predioId: 1,
    codigo: 'H001',
    nombre: 'Hierro Test',
    descripcion: 'Test description',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(createdHierro),
      update: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new CrearHierroUseCase(mockRepo)
  })

  it('should create a new hierro', async () => {
    const dto = {
      codigo: 'H001',
      nombre: 'Hierro Test',
    }

    const result = await useCase.execute(dto, 1)

    expect(result.id).toBe(1)
    expect(result.nombre).toBe('Hierro Test')
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('should set activo to 1 on create', async () => {
    const dto = {
      codigo: 'H002',
      nombre: 'Another Hierro',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        activo: 1,
      })
    )
  })

  it('should set descripcion to null when not provided', async () => {
    const dto = {
      codigo: 'H003',
      nombre: 'Minimal Hierro',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        descripcion: null,
      })
    )
  })
})
