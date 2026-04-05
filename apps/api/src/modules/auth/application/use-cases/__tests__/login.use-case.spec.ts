import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginUseCase } from '../login.use-case.js'
import { AuthDomainService } from '../../../domain/services/auth.domain-service.js'
import { UnauthorizedError } from '../../../../../shared/errors/index.js'
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.js'

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase
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

    loginUseCase = new LoginUseCase(mockAuthRepo, new AuthDomainService())
  })

  describe('execute', () => {
    const validUser = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      activo: 1,
    }

    const validPasswordHash = '$2b$12$D.aLj9jYNyMZUycE2Q7TJOHjz.GhsH505QuV8PQyODl80iEUUBIZO' // "Admin123!"

    it('should return AuthSession on valid credentials (happy path)', async () => {
      vi.mocked(mockAuthRepo.findUsuarioByEmail).mockResolvedValue(validUser)
      vi.mocked(mockAuthRepo.getContrasenaHash).mockResolvedValue(validPasswordHash)
      vi.mocked(mockAuthRepo.getTwoFactor).mockResolvedValue(null) // 2FA disabled
      vi.mocked(mockAuthRepo.getRoles).mockResolvedValue(['ADMIN'])
      vi.mocked(mockAuthRepo.getPermisos).mockResolvedValue(['usuarios:read'])
      vi.mocked(mockAuthRepo.getPredioIds).mockResolvedValue([1])
      vi.mocked(mockAuthRepo.saveRefreshToken).mockResolvedValue(undefined)

      const result = await loginUseCase.execute({
        email: 'test@example.com',
        password: 'Admin123!',
      })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('expiresIn')
      expect(result).toHaveProperty('usuario')
      expect((result as any).usuario.id).toBe(1)
      expect((result as any).usuario.nombre).toBe('Test User')
      expect((result as any).usuario.roles).toEqual(['ADMIN'])
    })

    it('should throw UnauthorizedError if email not found', async () => {
      vi.mocked(mockAuthRepo.findUsuarioByEmail).mockResolvedValue(null)

      await expect(
        loginUseCase.execute({
          email: 'nonexistent@example.com',
          password: 'Admin123!',
        })
      ).rejects.toThrow(UnauthorizedError)

      await expect(
        loginUseCase.execute({
          email: 'nonexistent@example.com',
          password: 'Admin123!',
        })
      ).rejects.toThrow('Credenciales inválidas')
    })

    it('should throw UnauthorizedError if password is invalid', async () => {
      vi.mocked(mockAuthRepo.findUsuarioByEmail).mockResolvedValue(validUser)
      vi.mocked(mockAuthRepo.getContrasenaHash).mockResolvedValue(validPasswordHash)
      // bcrypt.compare returns false for wrong password

      await expect(
        loginUseCase.execute({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow(UnauthorizedError)

      await expect(
        loginUseCase.execute({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow('Credenciales inválidas')
    })

    it('should return TwoFactorChallenge if 2FA is enabled', async () => {
      vi.mocked(mockAuthRepo.findUsuarioByEmail).mockResolvedValue(validUser)
      vi.mocked(mockAuthRepo.getContrasenaHash).mockResolvedValue(validPasswordHash)
      vi.mocked(mockAuthRepo.getTwoFactor).mockResolvedValue({
        habilitado: 1,
        metodo: 'email',
        codigo: null,
        fechaExpiracion: null,
        intentosFallidos: 0,
      })
      vi.mocked(mockAuthRepo.saveTwoFactorCode).mockResolvedValue(undefined)

      const result = await loginUseCase.execute({
        email: 'test@example.com',
        password: 'Admin123!',
      })

      expect(result).toHaveProperty('requires2FA', true)
      expect(result).toHaveProperty('tempToken')
    })

    it('should throw UnauthorizedError if user is inactive (activo != 1)', async () => {
      vi.mocked(mockAuthRepo.findUsuarioByEmail).mockResolvedValue({ ...validUser, activo: 0 })

      await expect(
        loginUseCase.execute({
          email: 'test@example.com',
          password: 'Admin123!',
        })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError if password hash not found', async () => {
      vi.mocked(mockAuthRepo.findUsuarioByEmail).mockResolvedValue(validUser)
      vi.mocked(mockAuthRepo.getContrasenaHash).mockResolvedValue(null)

      await expect(
        loginUseCase.execute({
          email: 'test@example.com',
          password: 'Admin123!',
        })
      ).rejects.toThrow(UnauthorizedError)

      await expect(
        loginUseCase.execute({
          email: 'test@example.com',
          password: 'Admin123!',
        })
      ).rejects.toThrow('Credenciales inválidas')
    })
  })
})
