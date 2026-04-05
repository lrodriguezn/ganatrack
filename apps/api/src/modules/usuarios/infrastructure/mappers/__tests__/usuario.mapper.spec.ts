import { describe, expect, it } from 'vitest'
import { PermisoMapper, RolMapper, UsuarioMapper } from '../usuario.mapper.js'
import type { UsuarioEntity } from '../../../domain/entities/usuario.entity.js'
import type { RolEntity } from '../../../domain/entities/rol.entity.js'
import type { PermisoEntity } from '../../../domain/entities/permiso.entity.js'

describe('UsuarioMapper', () => {
  describe('toResponse', () => {
    const mockUsuario: UsuarioEntity = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      activo: 1,
      createdAt: new Date('2024-01-01'),
    }

    it('should map UsuarioEntity to UsuarioResponseDto', () => {
      const result = UsuarioMapper.toResponse(mockUsuario, ['ADMIN', 'USER'])

      expect(result).toEqual({
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        activo: 1,
        roles: ['ADMIN', 'USER'],
        createdAt: '2024-01-01T00:00:00.000Z',
      })
    })

    it('should handle empty roles array', () => {
      const result = UsuarioMapper.toResponse(mockUsuario, [])

      expect(result.roles).toEqual([])
    })

    it('should handle null createdAt', () => {
      const usuarioWithoutDate: UsuarioEntity = {
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        activo: 1,
        createdAt: null,
      }

      const result = UsuarioMapper.toResponse(usuarioWithoutDate, ['ADMIN'])

      expect(result.createdAt).toBeNull()
    })

    it('should handle undefined createdAt', () => {
      const usuarioWithoutDate: UsuarioEntity = {
        id: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        activo: 1,
      }

      const result = UsuarioMapper.toResponse(usuarioWithoutDate, ['ADMIN'])

      expect(result.createdAt).toBeNull()
    })
  })
})

describe('RolMapper', () => {
  describe('toResponse', () => {
    const mockRol: RolEntity = {
      id: 1,
      nombre: 'ADMIN',
      descripcion: 'Administrator role',
      esSistema: 1,
      activo: 1,
    }

    const mockPermisos: PermisoEntity[] = [
      { id: 1, modulo: 'usuarios', accion: 'read', nombre: 'Leer Usuarios', activo: 1 },
      { id: 2, modulo: 'usuarios', accion: 'write', nombre: 'Escribir Usuarios', activo: 1 },
    ]

    it('should map RolEntity to RolResponseDto with permisos', () => {
      const result = RolMapper.toResponse(mockRol, mockPermisos)

      expect(result).toEqual({
        id: 1,
        nombre: 'ADMIN',
        descripcion: 'Administrator role',
        esSistema: 1,
        permisos: [
          { id: 1, modulo: 'usuarios', accion: 'read', nombre: 'Leer Usuarios' },
          { id: 2, modulo: 'usuarios', accion: 'write', nombre: 'Escribir Usuarios' },
        ],
      })
    })

    it('should handle empty permisos array', () => {
      const result = RolMapper.toResponse(mockRol, [])

      expect(result.permisos).toEqual([])
    })

    it('should handle null descripcion', () => {
      const rolWithoutDesc: RolEntity = {
        id: 1,
        nombre: 'USER',
        descripcion: null,
        esSistema: 0,
        activo: 1,
      }

      const result = RolMapper.toResponse(rolWithoutDesc, [])

      expect(result.descripcion).toBeNull()
    })
  })
})

describe('PermisoMapper', () => {
  describe('toResponse', () => {
    const mockPermiso: PermisoEntity = {
      id: 1,
      modulo: 'usuarios',
      accion: 'read',
      nombre: 'Leer Usuarios',
      activo: 1,
    }

    it('should map PermisoEntity to PermisoResponseDto', () => {
      const result = PermisoMapper.toResponse(mockPermiso)

      expect(result).toEqual({
        id: 1,
        modulo: 'usuarios',
        accion: 'read',
        nombre: 'Leer Usuarios',
      })
    })
  })
})