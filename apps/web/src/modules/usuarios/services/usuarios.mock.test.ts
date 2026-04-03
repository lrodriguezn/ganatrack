// apps/web/src/modules/usuarios/services/usuarios.mock.test.ts
/**
 * Unit tests for MockUsuariosService.
 *
 * Tests:
 * - CRUD operations (create, read, update, deactivate, activate)
 * - Pagination
 * - Search
 * - 404 handling
 * - Duplicate email prevention
 * - Roles CRUD
 * - Permission matrix operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockUsuariosService, resetUsuariosMock } from './usuarios.mock';
import { ApiError } from '@/shared/lib/errors';

function createService(): MockUsuariosService {
  return new MockUsuariosService();
}

describe('MockUsuariosService', () => {
  let service: MockUsuariosService;

  beforeEach(() => {
    resetUsuariosMock();
    service = createService();
  });

  describe('getAll', () => {
    it('should return paginated results', async () => {
      const result = await service.getAll({ predioId: 1, page: 1, limit: 5 });
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeGreaterThan(0);
    });

    it('should filter by predioId', async () => {
      const result = await service.getAll({ predioId: 2, page: 1, limit: 10 });
      expect(result.data.every((u) => u.predioId === 2)).toBe(true);
    });

    it('should filter by search term', async () => {
      const result = await service.getAll({
        predioId: 1,
        page: 1,
        limit: 10,
        search: 'carlos',
      });
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].nombre.toLowerCase()).toContain('carlos');
    });

    it('should filter by rolId', async () => {
      const result = await service.getAll({
        predioId: 1,
        page: 1,
        limit: 10,
        rolId: 1,
      });
      expect(result.data.every((u) => u.rolId === 1)).toBe(true);
    });

    it('should filter by activo status', async () => {
      const result = await service.getAll({
        predioId: 1,
        page: 1,
        limit: 10,
        activo: false,
      });
      expect(result.data.every((u) => u.activo === false)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return usuario by ID', async () => {
      const result = await service.getById(1);
      expect(result.id).toBe(1);
      expect(result.nombre).toBe('Carlos Mendoza');
    });

    it('should throw 404 for non-existent usuario', async () => {
      await expect(service.getById(999)).rejects.toThrow(ApiError);
      await expect(service.getById(999)).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('create', () => {
    it('should create a new usuario', async () => {
      const result = await service.create({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@finca.com',
        password: 'Password1',
        rolId: 3,
        predioId: 1,
      });
      expect(result.id).toBeGreaterThan(0);
      expect(result.nombre).toBe('Nuevo Usuario');
      expect(result.activo).toBe(true);
    });

    it('should throw 409 for duplicate email', async () => {
      await expect(
        service.create({
          nombre: 'Duplicado',
          email: 'carlos@finca.com',
          password: 'Password1',
          rolId: 3,
          predioId: 1,
        }),
      ).rejects.toMatchObject({
        status: 409,
        code: 'DUPLICATE_EMAIL',
      });
    });
  });

  describe('update', () => {
    it('should update an existing usuario', async () => {
      const result = await service.update(1, { nombre: 'Carlos Actualizado' });
      expect(result.nombre).toBe('Carlos Actualizado');
    });

    it('should throw 404 for non-existent usuario', async () => {
      await expect(service.update(999, { nombre: 'Test' })).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });

    it('should throw 409 for duplicate email on update', async () => {
      await expect(
        service.update(1, { email: 'maria@finca.com' }),
      ).rejects.toMatchObject({
        status: 409,
        code: 'DUPLICATE_EMAIL',
      });
    });
  });

  describe('deactivate', () => {
    it('should deactivate a usuario', async () => {
      await service.deactivate(1);
      const usuario = await service.getById(1);
      expect(usuario.activo).toBe(false);
    });

    it('should throw 404 for non-existent usuario', async () => {
      await expect(service.deactivate(999)).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('activate', () => {
    it('should activate a deactivated usuario', async () => {
      await service.deactivate(1);
      const result = await service.activate(1);
      expect(result.activo).toBe(true);
    });

    it('should throw 404 for non-existent usuario', async () => {
      await expect(service.activate(999)).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const roles = await service.getRoles();
      expect(roles.length).toBe(5);
      expect(roles[0].nombre).toBe('Administrador');
    });
  });

  describe('getRolPermisos', () => {
    it('should return permission matrix for a role', async () => {
      const matrix = await service.getRolPermisos(1);
      expect(matrix.rolId).toBe(1);
      expect(matrix.cells.length).toBe(44); // 11 modules × 4 actions
      expect(matrix.conflicts).toEqual([]);
    });

    it('should throw 404 for non-existent role', async () => {
      await expect(service.getRolPermisos(999)).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('updateRolPermisos', () => {
    it('should batch update permissions', async () => {
      const payload = {
        rolId: 1,
        permisos: [{ modulo: 'dashboard', accion: 'ver', enabled: false }],
      };
      const result = await service.updateRolPermisos(payload);
      const changedCell = result.cells.find(
        (c) => c.modulo === 'dashboard' && c.accion === 'ver',
      );
      expect(changedCell?.enabled).toBe(false);
    });

    it('should throw 404 for non-existent role', async () => {
      await expect(
        service.updateRolPermisos({
          rolId: 999,
          permisos: [],
        }),
      ).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });
  });
});
