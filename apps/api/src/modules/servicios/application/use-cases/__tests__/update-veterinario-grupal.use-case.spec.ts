import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateVeterinarioGrupalUseCase } from '../update-veterinario-grupal.use-case'
import type { IVeterinarioGrupalRepository } from '../../../domain/repositories/veterinario-grupal.repository'
import { NotFoundError, VersionConflictError } from '../../../../../shared/errors'
import type { VeterinarioGrupalEntity } from '../../../domain/entities/veterinario.entity'

describe('UpdateVeterinarioGrupalUseCase', () => {
  let useCase: UpdateVeterinarioGrupalUseCase
  let mockRepo: IVeterinarioGrupalRepository

  const existing: VeterinarioGrupalEntity = {
    id: 1, predioId: 1, codigo: 'SV-001', fecha: new Date('2024-03-15'),
    veterinariosId: 1, tipoServicio: 'Desparasitación', observaciones: 'Original',
    activo: 1, version: 1, createdAt: new Date(), updatedAt: new Date(),
  }

  const updated: VeterinarioGrupalEntity = {
    ...existing, observaciones: 'Updated', version: 2, updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(existing),
      findByCodigo: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updated),
      softDelete: vi.fn(),
    }
    useCase = new UpdateVeterinarioGrupalUseCase(mockRepo)
  })

  it('should update when version matches', async () => {
    const result = await useCase.execute(1, { observaciones: 'Updated' }, 1, 1)
    expect(result.observaciones).toBe('Updated')
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ version: 2 }))
  })

  it('should throw NotFoundError when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute(99, {}, 1, 1)).rejects.toThrow(NotFoundError)
  })

  it('should throw VersionConflictError when version mismatches', async () => {
    await expect(useCase.execute(1, {}, 1, 999)).rejects.toThrow(VersionConflictError)
  })

  it('should increment version on successful update', async () => {
    const v5: VeterinarioGrupalEntity = { ...existing, version: 5 }
    mockRepo.findById.mockResolvedValue(v5)
    await useCase.execute(1, { observaciones: 'V5' }, 1, 5)
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ version: 6 }))
  })
})
