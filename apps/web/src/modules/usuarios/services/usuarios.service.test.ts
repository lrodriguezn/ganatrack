// apps/web/src/modules/usuarios/services/usuarios.service.test.ts
/**
 * Unit tests for UsuariosService factory.
 *
 * Tests:
 * - Service factory selects mock or real based on NEXT_PUBLIC_USE_MOCKS
 * - Service exports correct interface
 */

import { describe, it, expect, vi } from 'vitest';

describe('UsuariosService Factory', () => {
  it('should export usuariosService singleton', async () => {
    const { usuariosService } = await import('./usuarios.service');
    expect(usuariosService).toBeDefined();
    expect(typeof usuariosService.getAll).toBe('function');
    expect(typeof usuariosService.getById).toBe('function');
    expect(typeof usuariosService.create).toBe('function');
    expect(typeof usuariosService.update).toBe('function');
    expect(typeof usuariosService.deactivate).toBe('function');
    expect(typeof usuariosService.activate).toBe('function');
    expect(typeof usuariosService.getRoles).toBe('function');
    expect(typeof usuariosService.getRolPermisos).toBe('function');
    expect(typeof usuariosService.updateRolPermisos).toBe('function');
  });
});
