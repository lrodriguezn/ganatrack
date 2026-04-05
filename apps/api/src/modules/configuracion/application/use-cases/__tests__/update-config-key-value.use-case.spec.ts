import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateConfigKeyValueUseCase } from '../update-config-key-value.use-case'
import type { IConfigKeyValueRepository } from '../../../domain/repositories/config-key-value.repository'
import { NotFoundError, ConflictError } from '../../../../../shared/errors'

describe('UpdateConfigKeyValueUseCase', () => {
  let useCase: UpdateConfigKeyValueUseCase
  let mockRepo: IConfigKeyValueRepository

  const existingConfig = {
    id: 1,
    opcion: 'general',
    key: 'app_name',
    value: 'OldValue',
    descripcion: 'Description',
    activo: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const updatedConfig = {
    ...existingConfig,
    value: 'NewValue',
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findByKey: vi.fn(),
      findByOpcionAndKey: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingConfig),
      update: vi.fn().mockResolvedValue(updatedConfig),
    }

    useCase = new UpdateConfigKeyValueUseCase(mockRepo)
  })

  it('should update config when found', async () => {
    const dto = {
      value: 'NewValue',
    }

    const result = await useCase.execute(1, dto)

    expect(result.value).toBe('NewValue')
    expect(mockRepo.update).toHaveBeenCalledWith(1, dto)
  })

  it('should throw NotFoundError when config does not exist', async () => {
    mockRepo.findById.mockResolvedValueOnce(null)

    const dto = { value: 'NewValue' }

    await expect(useCase.execute(99, dto)).rejects.toThrow(NotFoundError)
  })

  it('should check for duplicate when opcion or key is changed', async () => {
    const dto = {
      opcion: 'different',
      key: 'different_key',
    }

    await useCase.execute(1, dto)

    expect(mockRepo.findByOpcionAndKey).toHaveBeenCalledWith('different', 'different_key')
  })

  it('should throw ConflictError when duplicate config exists', async () => {
    mockRepo.findByOpcionAndKey.mockResolvedValueOnce(existingConfig)

    const dto = {
      opcion: 'different', // Must be different from existing.opcion to trigger the duplicate check
      key: 'app_name',
    }

    await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictError)
  })
})
