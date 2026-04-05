import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EliminarPushTokenUseCase } from '../application/use-cases/eliminar-push-token.use-case.js'
import { PUSH_TOKEN_REPOSITORY } from '../domain/repositories/push-token.repository.js'
import type { IPushTokenRepository } from '../domain/repositories/push-token.repository.js'
import { NotFoundError } from '../../../shared/errors/index.js'
import type { NotificacionPushToken } from '../domain/entities/push-token.entity.js'

describe('EliminarPushTokenUseCase', () => {
  let useCase: EliminarPushTokenUseCase
  let mockRepo: IPushTokenRepository

  const mockToken: NotificacionPushToken = {
    id: 1,
    usuarioId: 10,
    token: 'fcm_token_123',
    plataforma: 'web',
    createdAt: new Date(),
    activo: 1,
  }

  beforeEach(() => {
    mockRepo = {
      findByUsuario: vi.fn(),
      findByToken: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteByToken: vi.fn(),
    }

    useCase = new EliminarPushTokenUseCase(mockRepo)
  })

  it('should delete token successfully', async () => {
    vi.mocked(mockRepo.findByToken).mockResolvedValue(mockToken)
    vi.mocked(mockRepo.deleteByToken).mockResolvedValue(true)

    await useCase.execute(10, 'fcm_token_123')

    expect(mockRepo.deleteByToken).toHaveBeenCalledWith('fcm_token_123')
  })

  it('should throw NotFoundError when token does not exist', async () => {
    vi.mocked(mockRepo.findByToken).mockResolvedValue(null)

    await expect(
      useCase.execute(10, 'invalid_token')
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw NotFoundError when token belongs to different user', async () => {
    vi.mocked(mockRepo.findByToken).mockResolvedValue({
      ...mockToken,
      usuarioId: 999, // Different user
    })

    await expect(
      useCase.execute(10, 'fcm_token_123')
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw NotFoundError when token is inactive', async () => {
    vi.mocked(mockRepo.findByToken).mockResolvedValue({
      ...mockToken,
      activo: 0,
    })

    await expect(
      useCase.execute(10, 'fcm_token_123')
    ).rejects.toThrow(NotFoundError)
  })
})
