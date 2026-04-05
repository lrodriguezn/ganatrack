import { describe, expect, it } from 'vitest'
import { AuthMapper } from '../auth.mapper.js'
import type { LoginResponseDto, TwoFactorResponseDto } from '../../../application/dtos/login.dto.js'

describe('AuthMapper', () => {
  describe('toLoginResponse', () => {
    it('should map login response correctly', () => {
      const result = AuthMapper.toLoginResponse(
        'fake-access-token',
        'fake-refresh-token',
        900,
        1,
        'Test User',
        ['ADMIN', 'USER'],
      )

      expect(result).toMatchObject<LoginResponseDto>({
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
        expiresIn: 900,
        usuario: {
          id: 1,
          nombre: 'Test User',
          roles: ['ADMIN', 'USER'],
        },
      })
    })

    it('should handle single role', () => {
      const result = AuthMapper.toLoginResponse(
        'token',
        'refresh',
        900,
        1,
        'User',
        ['USER'],
      )

      expect(result.usuario.roles).toEqual(['USER'])
    })

    it('should handle empty roles array', () => {
      const result = AuthMapper.toLoginResponse(
        'token',
        'refresh',
        900,
        1,
        'User',
        [],
      )

      expect(result.usuario.roles).toEqual([])
    })
  })

  describe('toTwoFactorResponse', () => {
    it('should map two factor response correctly', () => {
      const result = AuthMapper.toTwoFactorResponse('temp-token-123')

      expect(result).toMatchObject<TwoFactorResponseDto>({
        requires2FA: true,
        tempToken: 'temp-token-123',
      })
    })

    it('should always set requires2FA to true', () => {
      const result = AuthMapper.toTwoFactorResponse('any-token')

      expect(result.requires2FA).toBe(true)
    })
  })
})