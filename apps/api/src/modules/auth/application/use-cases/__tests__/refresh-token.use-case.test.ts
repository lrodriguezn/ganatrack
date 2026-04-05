import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RefreshTokenUseCase } from '../refresh-token.use-case.js'
import { UnauthorizedError } from '../../../../../shared/errors/index.js'
import { signRefreshToken } from '../../../../../shared/utils/jwt.utils.js'
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.js'

describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase
  let mockAuthRepo: IAuthRepository

  beforeEach(() => {
    mockAuthRepo = {
      findUsuarioById: vi.fn(),
      findUsuarioByEmail: vi.fn(),
      getContrasenaHash: vi.fn(),
      getRoles: vi.fn(),
      getPermisos: vi.fn(),
      getPredioIds: vi.fn(),
      getTwoFactor: vi.fn(),
      saveTwoFactorCode: vi.fn(),
      incrementTwoFactorAttempts: vi.fn(),
      resetTwoFactorAttempts: vi.fn(),
      saveRefreshToken: vi.fn(),
      findRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
      savePasswordHistory: vi.fn(),
      getPasswordHistory: vi.fn(),
      updatePassword: vi.fn(),
      revokeAllUserTokens: vi.fn(),
    }

    refreshTokenUseCase = new RefreshTokenUseCase(mockAuthRepo)
  })

  describe('execute', () => {
    const validPayload = {
      sub: 1,
      roles: ['ADMIN'] as string[],
      permisos: ['usuarios:read'] as string[],
      predioIds: [1] as number[],
    }

    it('should return new tokens on valid refresh token (happy path)', async () => {
      const validToken = signRefreshToken(validPayload)

      vi.mocked(mockAuthRepo.findRefreshToken).mockResolvedValue({
        usuarioId: 1,
        activo: 1,
      })
      vi.mocked(mockAuthRepo.revokeRefreshToken).mockResolvedValue(undefined)
      vi.mocked(mockAuthRepo.getRoles).mockResolvedValue(['ADMIN'])
      vi.mocked(mockAuthRepo.getPermisos).mockResolvedValue(['usuarios:read'])
      vi.mocked(mockAuthRepo.getPredioIds).mockResolvedValue([1])
      vi.mocked(mockAuthRepo.saveRefreshToken).mockResolvedValue(undefined)

      const result = await refreshTokenUseCase.execute(validToken)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('expiresIn')
      expect(result).toHaveProperty('usuario')
      expect((result as any).usuario.id).toBe(1)
      expect((result as any).usuario.roles).toEqual(['ADMIN'])

      // Verify old token was revoked
      expect(mockAuthRepo.revokeRefreshToken).toHaveBeenCalledWith(validToken)
      // Verify new token was saved
      expect(mockAuthRepo.saveRefreshToken).toHaveBeenCalled()
    })

    it('should throw UnauthorizedError on invalid JWT signature', async () => {
      const invalidToken = 'invalid.token.here'

      await expect(refreshTokenUseCase.execute(invalidToken)).rejects.toThrow(
        UnauthorizedError
      )
      await expect(refreshTokenUseCase.execute(invalidToken)).rejects.toThrow(
        'Token inválido o expirado'
      )
    })

    it('should throw UnauthorizedError if token not found in database', async () => {
      const validToken = signRefreshToken(validPayload)

      vi.mocked(mockAuthRepo.findRefreshToken).mockResolvedValue(null)

      await expect(refreshTokenUseCase.execute(validToken)).rejects.toThrow(
        UnauthorizedError
      )
      await expect(refreshTokenUseCase.execute(validToken)).rejects.toThrow(
        'Token inválido o expirado'
      )
    })

    it('should throw UnauthorizedError if token is revoked (activo != 1)', async () => {
      const validToken = signRefreshToken(validPayload)

      vi.mocked(mockAuthRepo.findRefreshToken).mockResolvedValue({
        usuarioId: 1,
        activo: 0, // revoked
      })

      await expect(refreshTokenUseCase.execute(validToken)).rejects.toThrow(
        UnauthorizedError
      )
    })

    it('should rotate tokens by revoking old and saving new', async () => {
      const validToken = signRefreshToken(validPayload)

      vi.mocked(mockAuthRepo.findRefreshToken).mockResolvedValue({
        usuarioId: 1,
        activo: 1,
      })
      vi.mocked(mockAuthRepo.getRoles).mockResolvedValue(['ADMIN'])
      vi.mocked(mockAuthRepo.getPermisos).mockResolvedValue(['usuarios:read'])
      vi.mocked(mockAuthRepo.getPredioIds).mockResolvedValue([1])
      vi.mocked(mockAuthRepo.saveRefreshToken).mockResolvedValue(undefined)

      await refreshTokenUseCase.execute(validToken)

      // Verify old token was revoked
      expect(mockAuthRepo.revokeRefreshToken).toHaveBeenCalledWith(validToken)
      // Verify new token was saved
      expect(mockAuthRepo.saveRefreshToken).toHaveBeenCalledWith(
        1,
        expect.any(String),
        expect.any(Date)
      )
    })
  })
})
