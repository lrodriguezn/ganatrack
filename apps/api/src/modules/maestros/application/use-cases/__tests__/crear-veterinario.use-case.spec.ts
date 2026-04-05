import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrearVeterinarioUseCase } from '../crear-veterinario.use-case'
import type { IVeterinarioRepository } from '../../../domain/repositories/veterinario.repository'
import type { VeterinarioEntity } from '../../../domain/entities/veterinario.entity'

describe('CrearVeterinarioUseCase', () => {
  let useCase: CrearVeterinarioUseCase
  let mockRepo: IVeterinarioRepository

  const createdVeterinario: VeterinarioEntity = {
    id: 1,
    predioId: 1,
    nombre: 'Dr. Smith',
    telefono: '123456789',
    email: 'dr@vet.com',
    direccion: '123 Main St',
    numeroRegistro: 'REG123',
    especialidad: 'Large Animals',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(createdVeterinario),
      update: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new CrearVeterinarioUseCase(mockRepo)
  })

  it('should create a new veterinario', async () => {
    const dto = {
      nombre: 'Dr. Smith',
    }

    const result = await useCase.execute(dto, 1)

    expect(result.id).toBe(1)
    expect(result.nombre).toBe('Dr. Smith')
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('should set activo to 1 on create', async () => {
    const dto = {
      nombre: 'Dr. Jones',
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
      nombre: 'Dr. Minimal',
    }

    await useCase.execute(dto, 1)

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        telefono: null,
        email: null,
        direccion: null,
        numeroRegistro: null,
        especialidad: null,
      })
    )
  })
})
