import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdatePalpacionGrupalUseCase } from '../update-palpacion-grupal.use-case'
import { PALPACION_GRUPAL_REPOSITORY } from '../../../domain/repositories/palpacion-grupal.repository'
import type { IPalpacionGrupalRepository } from '../../../domain/repositories/palpacion-grupal.repository'
import { NotFoundError, VersionConflictError } from '../../../../../shared/errors'
import type { PalpacionGrupalEntity } from '../../../domain/entities/palpacion.entity'

describe('UpdatePalpacionGrupalUseCase', () => {
  let useCase: UpdatePalpacionGrupalUseCase
  let mockRepo: IPalpacionGrupalRepository

  const existing: PalpacionGrupalEntity = {
    id: 1, predioId: 1, codigo: 'PAL-001', fecha: new Date('2024-01-15'),
    veterinariosId: 1, observaciones: 'Original', activo: 1, version: 1,
    createdAt: new Date(), updatedAt: new Date(),
  }

  const updated: PalpacionGrupalEntity = {
    ...existing, codigo: 'PAL-UPDATED', observaciones: 'Updated', version: 2, updatedAt: new Date(),
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
    useCase = new UpdatePalpacionGrupalUseCase(mockRepo)
  })

  it('should update when version matches', async () => {
    const dto = { codigo: 'PAL-UPDATED', observaciones: 'Updated' }
    const result = await useCase.execute(1, dto, 1, 1)
    expect(result.codigo).toBe('PAL-UPDATED')
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ version: 2 }))
  })

  it('should throw NotFoundError when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute(99, {}, 1, 1)).rejects.toThrow(NotFoundError)
  })

  it('should throw VersionConflictError when version mismatches', async () => {
    const dto = { codigo: 'PAL-UPDATED' }
    await expect(useCase.execute(1, dto, 1, 999)).rejects.toThrow(VersionConflictError)
  })

  it('should include currentVersion and expectedVersion in error details', async () => {
    try {
      await useCase.execute(1, {}, 1, 999)
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(VersionConflictError)
      const err = error as VersionConflictError
      expect(err.details.currentVersion).toEqual(['1'])
      expect(err.details.expectedVersion).toEqual(['999'])
    }
  })

  it('should increment version on successful update', async () => {
    const v5: PalpacionGrupalEntity = { ...existing, version: 5 }
    mockRepo.findById.mockResolvedValue(v5)
    await useCase.execute(1, { codigo: 'PAL-V5' }, 1, 5)
    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ version: 6 }))
  })
})
