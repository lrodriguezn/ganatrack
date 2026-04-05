import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Verify2faUseCase } from '../verify-2fa.use-case.js'
import { AuthDomainService } from '../../../domain/services/auth.domain-service.js'
import { UnauthorizedError, ValidationError } from '../../../../../shared/errors/index.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.js'

describe('Verify2faUseCase', () => {
  let verify2faUseCase: Verify2faUseCase
  let mockAuthRepo: IAuthRepository

  const TEMP_TOKEN_SECRET = process.env.JWT_SECRET ?? 'super-secret-key-change-in-production'
  const OTP_CODE = '123456'
  let hashedOtpCode: string

  beforeEach(async () => {
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

    // Generate bcrypt hash for OTP code (must match what the implementation compares against)
    hashedOtpCode = await bcrypt.hash(OTP_CODE, 10)

    verify2faUseCase = new Verify2faUseCase(mockAuthRepo, new AuthDomainService())
  })

  describe('execute', () => {
    function createTempToken(usuarioId: number, expiresIn: string = '5m'): string {
      return jwt.sign(
        { usuarioId, type: '2fa' },
        TEMP_TOKEN_SECRET,
        { expiresIn }
      )
    }

    function createValidTwoFactor(overrides?: Partial<{ fechaExpiracion: Date; intentosFallidos: number }>) {
      return {
        habilitado: 1,
        metodo: 'email',
        codigo: hashedOtpCode, // bcrypt hash, not plain text
        fechaExpiracion: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        intentosFallidos: 0,
        ...overrides,
      }
    }

    it('should return AuthSession on correct code (happy path)', async () => {
      const tempToken = createTempToken(1)
      const validTwoFactor = createValidTwoFactor()

      vi.mocked(mockAuthRepo.getTwoFactor).mockResolvedValue(validTwoFactor)
      vi.mocked(mockAuthRepo.resetTwoFactorAttempts).mockResolvedValue(undefined)
      vi.mocked(mockAuthRepo.getRoles).mockResolvedValue(['ADMIN'])
      vi.mocked(mockAuthRepo.getPermisos).mockResolvedValue(['usuarios:read'])
      vi.mocked(mockAuthRepo.getPredioIds).mockResolvedValue([1])
      vi.mocked(mockAuthRepo.saveRefreshToken).mockResolvedValue(undefined)
      vi.mocked(mockAuthRepo.findUsuarioById).mockResolvedValue({
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        activo: 1,
      })

      const result = await verify2faUseCase.execute({
        tempToken,
        codigo: OTP_CODE,
      })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('expiresIn')
      expect((result as any).usuario.id).toBe(1)
      expect((result as any).usuario.nombre).toBe('Test User')
      expect(mockAuthRepo.resetTwoFactorAttempts).toHaveBeenCalledWith(1)
    })

    it('should throw UnauthorizedError on wrong code and increment attempts', async () => {
      const tempToken = createTempToken(1)
      const validTwoFactor = createValidTwoFactor()

      vi.mocked(mockAuthRepo.getTwoFactor).mockResolvedValue(validTwoFactor)
      vi.mocked(mockAuthRepo.incrementTwoFactorAttempts).mockResolvedValue(undefined)

      await expect(
        verify2faUseCase.execute({
          tempToken,
          codigo: '999999', // wrong code
        })
      ).rejects.toThrow(ValidationError)

      expect(mockAuthRepo.incrementTwoFactorAttempts).toHaveBeenCalledWith(1)
    })

    it('should throw UnauthorizedError on expired code', async () => {
      const expiredTwoFactor = createValidTwoFactor({
        fechaExpiracion: new Date(Date.now() - 60000), // 1 minute ago
      })
      const tempToken = createTempToken(1)

      vi.mocked(mockAuthRepo.getTwoFactor).mockResolvedValue(expiredTwoFactor)

      await expect(
        verify2faUseCase.execute({
          tempToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow(UnauthorizedError)

      await expect(
        verify2faUseCase.execute({
          tempToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow('Código expirado. Solicita un nuevo código')
    })

    it('should throw UnauthorizedError when locked (3 failed attempts)', async () => {
      const lockedTwoFactor = createValidTwoFactor({
        intentosFallidos: 3,
      })
      const tempToken = createTempToken(1)

      vi.mocked(mockAuthRepo.getTwoFactor).mockResolvedValue(lockedTwoFactor)

      await expect(
        verify2faUseCase.execute({
          tempToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow(UnauthorizedError)

      await expect(
        verify2faUseCase.execute({
          tempToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow('Demasiados intentos fallidos. Solicita un nuevo código')
    })

    it('should throw UnauthorizedError on invalid temp token', async () => {
      const invalidToken = 'invalid.token.here'

      await expect(
        verify2faUseCase.execute({
          tempToken: invalidToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError if temp token has wrong type', async () => {
      // Create a token with wrong type
      const wrongTypeToken = jwt.sign(
        { usuarioId: 1, type: 'access' },
        TEMP_TOKEN_SECRET,
        { expiresIn: '5m' }
      )

      await expect(
        verify2faUseCase.execute({
          tempToken: wrongTypeToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError if 2FA not configured', async () => {
      const tempToken = createTempToken(1)

      vi.mocked(mockAuthRepo.getTwoFactor).mockResolvedValue(null)

      await expect(
        verify2faUseCase.execute({
          tempToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow(UnauthorizedError)

      await expect(
        verify2faUseCase.execute({
          tempToken,
          codigo: OTP_CODE,
        })
      ).rejects.toThrow('2FA no configurado')
    })
  })
})
