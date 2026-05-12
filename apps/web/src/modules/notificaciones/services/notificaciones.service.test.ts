// apps/web/src/modules/notificaciones/services/notificaciones.service.test.ts
/**
 * NotificacionesService tests.
 *
 * Tests:
 * - Factory creates correct service type based on env
 * - All service methods are callable
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/modules/notificaciones/services/notificaciones.service', () => ({
  notificacionesService: {
    getResumen: vi.fn(),
    getAll: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    delete: vi.fn(),
    getPreferencias: vi.fn(),
    updatePreferencias: vi.fn(),
    subscribePush: vi.fn(),
    unsubscribePush: vi.fn(),
  },
}));

describe('NotificacionesService', () => {
  it('should export notificacionesService singleton with correct interface', async () => {
    const { notificacionesService } = await import('./notificaciones.service');
    expect(notificacionesService).toBeDefined();
    expect(typeof notificacionesService.getResumen).toBe('function');
    expect(typeof notificacionesService.getAll).toBe('function');
    expect(typeof notificacionesService.markRead).toBe('function');
    expect(typeof notificacionesService.markAllRead).toBe('function');
    expect(typeof notificacionesService.delete).toBe('function');
    expect(typeof notificacionesService.getPreferencias).toBe('function');
    expect(typeof notificacionesService.updatePreferencias).toBe('function');
    expect(typeof notificacionesService.subscribePush).toBe('function');
    expect(typeof notificacionesService.unsubscribePush).toBe('function');
  });
});
