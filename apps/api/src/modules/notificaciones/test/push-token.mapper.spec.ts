import { describe, it, expect } from 'vitest'
import { PushTokenMapper } from '../infrastructure/mappers/push-token.mapper.js'
import type { NotificacionPushToken } from '../domain/entities/push-token.entity.js'

describe('PushTokenMapper', () => {
  describe('toResponseDto', () => {
    it('should convert entity to response DTO', () => {
      const entity: NotificacionPushToken = {
        id: 1,
        usuarioId: 10,
        token: 'fcm_token_123',
        plataforma: 'web',
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
        activo: 1,
      }

      const dto = PushTokenMapper.toResponseDto(entity)

      expect(dto.id).toBe(1)
      expect(dto.token).toBe('fcm_token_123')
      expect(dto.plataforma).toBe('web')
      expect(dto.createdAt).toBe('2026-04-05T10:00:00.000Z')
    })

    it('should handle different platforms', () => {
      const androidToken: NotificacionPushToken = {
        id: 2,
        usuarioId: 10,
        token: 'android_token',
        plataforma: 'android',
        createdAt: new Date(),
        activo: 1,
      }

      const dto = PushTokenMapper.toResponseDto(androidToken)
      expect(dto.plataforma).toBe('android')
    })
  })
})
