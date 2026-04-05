import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IRolRepository } from '../../../domain/repositories/rol.repository.js'
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import { GetMeUseCase } from '../get-me.use-case.js'
import { NotFoundError } from '../../../../../shared/errors/index.js'

describe('GetMeUseCase', () => {
  let getMeUseCase: GetMeUseCase
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

    getMeUseCase = new GetMeUseCase(mockUsuarioRepo, mockRolRepo, mockDbClient)
  })

  describe('execute', () => {
    const validUser = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      activo: 1,
      createdAt: new Date(),
    }

    it('should return user profile on valid user ID (happy path)', async () => {
      vi.mocked(mockUsuarioRepo.findById).mockResolvedValue(validUser)
      vi.mocked(mockRolRepo.getPermisosByRol).mockResolvedValue([
        { modulo: 'usuarios', accion: 'read', nombre: 'Leer Usuarios' },
        { modulo: 'animales', accion: 'write', nombre: 'Escribir Animales' },
      ])

      // Mock DB response for roles
      mockDbClient.where.mockResolvedValue([
        { rolId: 1, nombre: 'ADMIN' },
      ])

      const result = await getMeUseCase.execute(1)

      expect(result).toEqual({
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        roles: ['ADMIN'],
        permisos: ['usuarios:read', 'animales:write'],
      })
    })

    it('should throw NotFoundError if user does not exist', async () => {
      vi.mocked(mockUsuarioRepo.findById).mockResolvedValue(null)

      await expect(getMeUseCase.execute(999)).rejects.toThrow(NotFoundError)
      await expect(getMeUseCase.execute(999)).rejects.toThrow('Usuario con id 999 no existe')
    })

    it('should return empty roles if user has no roles', async () => {
      vi.mocked(mockUsuarioRepo.findById).mockResolvedValue(validUser)
      mockDbClient.where.mockResolvedValue([])

      const result = await getMeUseCase.execute(1)

      expect(result.roles).toEqual([])
      expect(result.permisos).toEqual([])
    })

    it('should return empty permissions if role has no permissions', async () => {
      vi.mocked(mockUsuarioRepo.findById).mockResolvedValue(validUser)
      mockDbClient.where.mockResolvedValue([
        { rolId: 1, nombre: 'ADMIN' },
      ])
      vi.mocked(mockRolRepo.getPermisosByRol).mockResolvedValue([])

      const result = await getMeUseCase.execute(1)

      expect(result.roles).toEqual(['ADMIN'])
      expect(result.permisos).toEqual([])
    })

    it('should deduplicate permissions from multiple roles', async () => {
      vi.mocked(mockUsuarioRepo.findById).mockResolvedValue(validUser)
      mockDbClient.where.mockResolvedValue([
        { rolId: 1, nombre: 'ADMIN' },
        { rolId: 2, nombre: 'USER' },
      ])
      vi.mocked(mockRolRepo.getPermisosByRol)
        .mockResolvedValueOnce([
          { modulo: 'usuarios', accion: 'read', nombre: 'Leer Usuarios' },
          { modulo: 'animales', accion: 'write', nombre: 'Escribir Animales' },
        ])
        .mockResolvedValueOnce([
          { modulo: 'usuarios', accion: 'read', nombre: 'Leer Usuarios' },
          { modulo: 'servicios', accion: 'read', nombre: 'Leer Servicios' },
        ])

      const result = await getMeUseCase.execute(1)

      expect(result.roles).toEqual(['ADMIN', 'USER'])
      expect(result.permisos).toEqual(['usuarios:read', 'animales:write', 'servicios:read'])
    })
  })
})