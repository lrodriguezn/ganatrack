import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListUsuariosUseCase } from '../list-usuarios.use-case.js'
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { DbClient } from '@ganatrack/database'

describe('ListUsuariosUseCase', () => {
  let listUsuariosUseCase: ListUsuariosUseCase
  let mockUsuarioRepo: IUsuarioRepository
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

    // Mock db with select capability
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
    }

    listUsuariosUseCase = new ListUsuariosUseCase(mockUsuarioRepo, mockDb)
  })

  describe('execute', () => {
    const mockUsuarios = [
      {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@ganatrack.com',
        activo: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        nombre: 'Operario User',
        email: 'operario@ganatrack.com',
        activo: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockRoles = [
      { nombre: 'ADMIN' },
      { nombre: 'OPERARIO' },
    ]

    it('should return paginated results with meta (happy path)', async () => {
      vi.mocked(mockUsuarioRepo.findAll).mockResolvedValue({
        data: mockUsuarios,
        total: 2,
      })

      // Mock role query
      ;(mockDb.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockRoles),
          }),
        }),
      })

      const result = await listUsuariosUseCase.execute({
        page: 1,
        limit: 10,
      })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('nombre')
      expect(result.data[0]).toHaveProperty('email')
      expect(result.data[0]).toHaveProperty('roles')
    })

    it('should pass search filter to repository', async () => {
      vi.mocked(mockUsuarioRepo.findAll).mockResolvedValue({
        data: [mockUsuarios[0]],
        total: 1,
      })
      ;(mockDb.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ nombre: 'ADMIN' }]),
          }),
        }),
      })

      await listUsuariosUseCase.execute({
        page: 1,
        limit: 10,
        search: 'admin',
      })

      expect(mockUsuarioRepo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'admin',
        activo: 1,
      })
    })

    it('should pass activo filter to repository', async () => {
      vi.mocked(mockUsuarioRepo.findAll).mockResolvedValue({
        data: [],
        total: 0,
      })
      ;(mockDb.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await listUsuariosUseCase.execute({
        page: 1,
        limit: 10,
        activo: 0, // inactive users
      })

      expect(mockUsuarioRepo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        activo: 0,
      })
    })

    it('should default activo to 1 if not specified', async () => {
      vi.mocked(mockUsuarioRepo.findAll).mockResolvedValue({
        data: mockUsuarios,
        total: 2,
      })
      ;(mockDb.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockRoles),
          }),
        }),
      })

      await listUsuariosUseCase.execute({
        page: 1,
        limit: 10,
      })

      expect(mockUsuarioRepo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        activo: 1,
      })
    })

    it('should return empty data when no usuarios found', async () => {
      vi.mocked(mockUsuarioRepo.findAll).mockResolvedValue({
        data: [],
        total: 0,
      })
      ;(mockDb.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await listUsuariosUseCase.execute({
        page: 1,
        limit: 10,
      })

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })
})
