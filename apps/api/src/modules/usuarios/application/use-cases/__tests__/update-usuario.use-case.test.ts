import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateUsuarioUseCase } from '../update-usuario.use-case.js'
import { ConflictError, NotFoundError } from '../../../../../shared/errors/index.js'
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { IRolRepository } from '../../../domain/repositories/rol.repository.js'
import type { UpdateUsuarioDto } from '../dtos/usuario.dto.js'

describe('UpdateUsuarioUseCase', () => {
  let updateUsuarioUseCase: UpdateUsuarioUseCase
  let mockUsuarioRepo: IUsuarioRepository
  let mockRolRepo: IRolRepository
  let mockDbClient: any

  beforeEach(() => {
    mockUsuarioRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    }

    mockRolRepo = {
      findById: vi.fn(),
      findByNombre: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      getPermisosByRol: vi.fn(),
    }

    // Mock Drizzle DB client
    mockDbClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    }

    updateUsuarioUseCase = new UpdateUsuarioUseCase(mockUsuarioRepo, mockRolRepo, mockDbClient)
  })

  describe('execute', () => {
    const existingUser = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      activo: 1,
      createdAt: new Date(),
    }

    const updatedUserData: UpdateUsuarioDto = {
      nombre: 'Updated User',
      email: 'updated@example.com',
      activo: 1,
    }

    it('should update user profile successfully (happy path)', async () => {
      vi.mocked(mockUsuarioRepo.findById)
        .mockResolvedValueOnce(existingUser) // First call - find user
        .mockResolvedValueOnce({ ...existingUser, ...updatedUserData }) // Second call - get updated user

      vi.mocked(mockUsuarioRepo.update).mockResolvedValue(undefined)
      mockDbClient.where.mockResolvedValue([{ nombre: 'ADMIN' }])

      const result = await updateUsuarioUseCase.execute(1, updatedUserData)

      expect(mockUsuarioRepo.update).toHaveBeenCalledWith(1, updatedUserData)
      expect(result).toEqual({
        id: 1,
        nombre: 'Updated User',
        email: 'updated@example.com',
        activo: 1,
        roles: ['ADMIN'],
        createdAt: existingUser.createdAt.toISOString(),
      })
    })

    it('should throw NotFoundError if user does not exist', async () => {
      vi.mocked(mockUsuarioRepo.findById).mockResolvedValue(null)

      await expect(updateUsuarioUseCase.execute(999, updatedUserData)).rejects.toThrow(NotFoundError)
      await expect(updateUsuarioUseCase.execute(999, updatedUserData)).rejects.toThrow('Usuario con id 999 no existe')
    })

    it('should validate email uniqueness when email is changed', async () => {
      const differentEmailData: UpdateUsuarioDto = {
        email: 'newemail@example.com',
      }

      vi.mocked(mockUsuarioRepo.findById)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce({ ...existingUser, email: 'newemail@example.com' })

      vi.mocked(mockUsuarioRepo.findByEmail).mockResolvedValue(null) // Email is available
      vi.mocked(mockUsuarioRepo.update).mockResolvedValue(undefined)
      mockDbClient.where.mockResolvedValue([])

      await updateUsuarioUseCase.execute(1, differentEmailData)

      expect(mockUsuarioRepo.findByEmail).toHaveBeenCalledWith('newemail@example.com')
    })

    it('should throw ConflictError if email is already taken', async () => {
      const differentEmailData: UpdateUsuarioDto = {
        email: 'existing@example.com',
      }

      vi.mocked(mockUsuarioRepo.findById).mockResolvedValue(existingUser)
      vi.mocked(mockUsuarioRepo.findByEmail).mockResolvedValue({
        id: 2,
        nombre: 'Other User',
        email: 'existing@example.com',
        activo: 1,
        createdAt: new Date(),
      })

      await expect(updateUsuarioUseCase.execute(1, differentEmailData)).rejects.toThrow(ConflictError)
      await expect(updateUsuarioUseCase.execute(1, differentEmailData)).rejects.toThrow('El email existing@example.com ya está en uso')
    })

    it('should allow keeping the same email without validation', async () => {
      const sameEmailData: UpdateUsuarioDto = {
        nombre: 'Updated Name',
        email: 'test@example.com', // Same as current
      }

      vi.mocked(mockUsuarioRepo.findById)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce({ ...existingUser, nombre: 'Updated Name' })

      vi.mocked(mockUsuarioRepo.update).mockResolvedValue(undefined)
      mockDbClient.where.mockResolvedValue([])

      await updateUsuarioUseCase.execute(1, sameEmailData)

      expect(mockUsuarioRepo.findByEmail).not.toHaveBeenCalled()
    })

    it('should handle partial updates (only nombre)', async () => {
      const partialData: UpdateUsuarioDto = {
        nombre: 'New Name Only',
      }

      vi.mocked(mockUsuarioRepo.findById)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce({ ...existingUser, nombre: 'New Name Only' })

      vi.mocked(mockUsuarioRepo.update).mockResolvedValue(undefined)
      mockDbClient.where.mockResolvedValue([])

      const result = await updateUsuarioUseCase.execute(1, partialData)

      expect(mockUsuarioRepo.update).toHaveBeenCalledWith(1, partialData)
      expect(result.nombre).toBe('New Name Only')
    })

    it('should return empty roles if user has no roles', async () => {
      vi.mocked(mockUsuarioRepo.findById)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(existingUser)

      vi.mocked(mockUsuarioRepo.update).mockResolvedValue(undefined)
      mockDbClient.where.mockResolvedValue([])

      const result = await updateUsuarioUseCase.execute(1, updatedUserData)

      expect(result.roles).toEqual([])
    })
  })
})