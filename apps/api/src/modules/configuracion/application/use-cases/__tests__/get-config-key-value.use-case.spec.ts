import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetConfigKeyValueUseCase } from '../get-config-key-value.use-case'
import type { IConfigKeyValueRepository } from '../../../domain/repositories/config-key-value.repository'
import { NotFoundError } from '../../../../../shared/errors'

describe('GetConfigKeyValueUseCase', () => {
  let useCase: GetConfigKeyValueUseCase
  let mockRepo: IConfigKeyValueRepository

  const mockConfig = {
    id: 1,
    opcion: 'general',
    key: 'app_name',
    value: 'GanaTrack',
    descripcion: 'Application name',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findByKey: vi.fn(),
      findByOpcionAndKey: vi.fn(),
      findAll: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockConfig),
    }

    useCase = new GetConfigKeyValueUseCase(mockRepo)
  })

  it('should return config when found', async () => {
    const result = await useCase.execute(1)

    expect(result.id).toBe(1)
    expect(result.opcion).toBe('general')
    expect(result.key).toBe('app_name')
    expect(result.value).toBe('GanaTrack')
    expect(mockRepo.findById).toHaveBeenCalledWith(1)
  })

  it('should throw NotFoundError when config does not exist', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)

    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError)
  })
})
