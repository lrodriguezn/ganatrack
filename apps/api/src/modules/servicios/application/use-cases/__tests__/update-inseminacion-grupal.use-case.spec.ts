import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateInseminacionGrupalUseCase } from '../update-inseminacion-grupal.use-case'
import type { IInseminacionGrupalRepository } from '../../../domain/repositories/inseminacion-grupal.repository'
import { NotFoundError, VersionConflictError } from '../../../../../shared/errors'
import type { InseminacionGrupalEntity } from '../../../domain/entities/inseminacion.entity'

describe('UpdateInseminacionGrupalUseCase', () => {
  let useCase: UpdateInseminacionGrupalUseCase
  let mockRepo: IInseminacionGrupalRepository

  const existing: InseminacionGrupalEntity = {
    id: 1, predioId: 1, codigo: 'INS-001', fecha: new Date('2024-01-15'),
    veterinariosId: 1, observaciones: 'Original', activo: 1, version: 1,
    createdAt: new Date(), updatedAt: new Date(),
  }

  const updated: InseminacionGrupalEntity = {
    ...existing, codigo: 'INS-UPDATED', observaciones: 'Updated', version: 2, updatedAt: new Date(),
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
    useCase = new UpdateInseminacionGrupalUseCase(mockRepo)
  })

  it('should update when version matches', async () => {
    const result = await useCase.execute(1, { codigo: 'INS-UPDATED' }, 1, 1)
    expect(result.codigo).toBe('INS-UPDATED')
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
    const v5: InseminacionGrupalEntity = { ...existing, version: 5 }
    mockRepo.findById.mockResolvedValue(v5)
    await useCase.execute(1, { codigo: 'INS-V5' }, 1, 5)
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ version: 6 }))
  })
})
