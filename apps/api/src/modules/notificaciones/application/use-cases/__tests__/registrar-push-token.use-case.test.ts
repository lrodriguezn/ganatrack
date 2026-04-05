import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegistrarPushTokenUseCase } from '../registrar-push-token.use-case.js'
import { PUSH_TOKEN_REPOSITORY } from '../../../domain/repositories/push-token.repository.js'
import type { IPushTokenRepository } from '../../../domain/repositories/push-token.repository.js'
import type { RegistrarPushTokenBodyDto } from '../../dtos/notificacion.dto.js'
import type { NotificacionPushToken } from '../../../domain/entities/push-token.entity.js'

describe('RegistrarPushTokenUseCase', () => {
  let useCase: RegistrarPushTokenUseCase
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
      findById: vi.fn(),
      findByUsuario: vi.fn(),
      findByToken: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteByToken: vi.fn(),
    }

    useCase = new RegistrarPushTokenUseCase(mockRepo)
  })

  describe('execute', () => {
    it('should create new token successfully (happy path)', async () => {
      const body: RegistrarPushTokenBodyDto = {
        token: 'new_fcm_token',
        plataforma: 'android',
      }

      vi.mocked(mockRepo.findByToken).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(mockToken)

      const result = await useCase.execute(10, body)

      expect(result.token).toBe('fcm_token_123')
      expect(mockRepo.create).toHaveBeenCalledWith({
        usuarioId: 10,
        token: 'new_fcm_token',
        plataforma: 'android',
      })
    })

    it('should return existing active token', async () => {
      const body: RegistrarPushTokenBodyDto = {
        token: 'existing_token',
        plataforma: 'web',
      }

      vi.mocked(mockRepo.findByToken).mockResolvedValue(mockToken)

      const result = await useCase.execute(10, body)

      expect(result.token).toBe('fcm_token_123')
      expect(mockRepo.create).not.toHaveBeenCalled()
    })

    it('should create new token if existing is inactive', async () => {
      const inactiveToken: NotificacionPushToken = {
        ...mockToken,
        activo: 0,
      }

      const body: RegistrarPushTokenBodyDto = {
        token: 'reactivated_token',
        plataforma: 'web',
      }

      vi.mocked(mockRepo.findByToken).mockResolvedValue(inactiveToken)
      vi.mocked(mockRepo.create).mockResolvedValue(mockToken)

      const result = await useCase.execute(10, body)

      expect(result.token).toBe('fcm_token_123')
      expect(mockRepo.create).toHaveBeenCalled()
    })
  })
})