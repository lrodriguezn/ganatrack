import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearPropietarioUseCase } from '../crear-propietario.use-case'
import type { IPropietarioRepository } from '../../../domain/repositories/propietario.repository'
import type { PropietarioEntity } from '../../../domain/entities/propietario.entity'

describe('CrearPropietarioUseCase', () => {
  let useCase: CrearPropietarioUseCase
  let mockRepo: IPropietarioRepository

  const createdPropietario: PropietarioEntity = {
    id: 1,
    predioId: 1,
    nombre: 'John Doe',
    tipoDocumento: 'CC',
    numeroDocumento: '123456789',
    telefono: '123456789',
    email: 'john@example.com',
    direccion: '123 Main St',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(createdPropietario),
      update: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new CrearPropietarioUseCase(mockRepo)
  })

  it('should create a new propietario', async () => {
    const dto = {
      nombre: 'John Doe',
    }

    const result = await useCase.execute(dto, 1)

    expect(result.id).toBe(1)
    expect(result.nombre).toBe('John Doe')
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('should set activo to 1 on create', async () => {
    const dto = {
      nombre: 'Jane Doe',
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
      nombre: 'Minimal Owner',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoDocumento: null,
        numeroDocumento: null,
        telefono: null,
        email: null,
        direccion: null,
      })
    )
  })
})
