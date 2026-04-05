import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateUsuarioUseCase } from '../create-usuario.use-case.js'
import { ConflictError, ValidationError } from '../../../../../shared/errors/index.js'
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { IRolRepository } from '../../../domain/repositories/rol.repository.js'
import type { DbClient } from '@ganatrack/database'

describe('CreateUsuarioUseCase', () => {
  let createUsuarioUseCase: CreateUsuarioUseCase
  let mockUsuarioRepo: IUsuarioRepository
  let mockRolRepo: IRolRepository
  let mockDb: DbClient

  beforeEach(() => {
    mockUsuarioRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    }

    mockRolRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    // Mock db with insert capability
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue(undefined),
    } as any

    createUsuarioUseCase = new CreateUsuarioUseCase(
      mockUsuarioRepo,
      mockRolRepo,
      mockDb
    )
  })

  describe('execute', () => {
    const newUsuario = {
      id: 2,
      nombre: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      activo: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should create user with password hash (happy path)', async () => {
      vi.mocked(mockUsuarioRepo.findByEmail).mockResolvedValue(null) // email unique
      vi.mocked(mockUsuarioRepo.create).mockResolvedValue(newUsuario)

      const result = await createUsuarioUseCase.execute({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        password: 'ValidPass123!',
      })

      expect(result.id).toBe(2)
      expect(result.nombre).toBe('Nuevo Usuario')
      expect(result.email).toBe('nuevo@example.com')
      expect(result.roles).toEqual([])
      expect(mockUsuarioRepo.create).toHaveBeenCalledWith({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@example.com',
      })
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should create user with assigned roles', async () => {
      vi.mocked(mockUsuarioRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(mockUsuarioRepo.create).mockResolvedValue(newUsuario)
      vi.mocked(mockRolRepo.findById)
        .mockResolvedValueOnce({ id: 1, nombre: 'ADMIN', descripcion: 'Admin', esSistema: 1, activo: 1 })
        .mockResolvedValueOnce({ id: 2, nombre: 'OPERARIO', descripcion: 'Operario', esSistema: 0, activo: 1 })

      const result = await createUsuarioUseCase.execute({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        password: 'ValidPass123!',
        rolesIds: [1, 2],
      })

      expect(result.roles).toEqual(['ADMIN', 'OPERARIO'])
    })

    it('should throw ConflictError if email already exists', async () => {
      vi.mocked(mockUsuarioRepo.findByEmail).mockResolvedValue({
        id: 1,
        nombre: 'Existing User',
        email: 'existing@example.com',
        activo: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(
        createUsuarioUseCase.execute({
          nombre: 'Nuevo Usuario',
          email: 'existing@example.com',
          password: 'ValidPass123!',
        })
      ).rejects.toThrow(ConflictError)

      await expect(
        createUsuarioUseCase.execute({
          nombre: 'Nuevo Usuario',
          email: 'existing@example.com',
          password: 'ValidPass123!',
        })
      ).rejects.toThrow('El email existing@example.com ya está en uso')
    })

    it('should throw error if password is invalid', async () => {
      vi.mocked(mockUsuarioRepo.findByEmail).mockResolvedValue(null)

      // Too short
      await expect(
        createUsuarioUseCase.execute({
          nombre: 'Nuevo Usuario',
          email: 'nuevo@example.com',
          password: 'Short1!',
        })
      ).rejects.toThrow(ValidationError)

      // No uppercase
      await expect(
        createUsuarioUseCase.execute({
          nombre: 'Nuevo Usuario',
          email: 'nuevo@example.com',
          password: 'lowercase123!',
        })
      ).rejects.toThrow(ValidationError)

      // No number
      await expect(
        createUsuarioUseCase.execute({
          nombre: 'Nuevo Usuario',
          email: 'nuevo@example.com',
          password: 'NoNumbers!',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ConflictError if role ID does not exist', async () => {
      vi.mocked(mockUsuarioRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(mockUsuarioRepo.create).mockResolvedValue(newUsuario)
      vi.mocked(mockRolRepo.findById).mockResolvedValue(null)

      await expect(
        createUsuarioUseCase.execute({
          nombre: 'Nuevo Usuario',
          email: 'nuevo@example.com',
          password: 'ValidPass123!',
          rolesIds: [999], // non-existent role
        })
      ).rejects.toThrow(ConflictError)

      await expect(
        createUsuarioUseCase.execute({
          nombre: 'Nuevo Usuario',
          email: 'nuevo@example.com',
          password: 'ValidPass123!',
          rolesIds: [999],
        })
      ).rejects.toThrow('El rol con id 999 no existe')
    })
  })
})
