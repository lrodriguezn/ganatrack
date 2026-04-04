// apps/web/src/modules/notificaciones/services/notificaciones.service.ts
/**
 * NotificacionesService — interface + factory.
 *
 * Swaps between MockNotificacionesService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealNotificacionesService (production).
 *
 * Base API path: /notificaciones
 */

import type {
  Notificacion,
  NotificacionResumen,
  NotificacionPreferencias,
  PushSubscriptionDto,
  PaginationParams,
  PaginatedResponse,
} from '../types/notificaciones.types';

// ============================================================================
// NotificacionesService Interface
// ============================================================================

export interface INotificacionesService {
  // Resumen / polling
  getResumen(predioId: number): Promise<NotificacionResumen>;

  // List / pagination
  getAll(predioId: number, params: PaginationParams): Promise<PaginatedResponse<Notificacion>>;

  // Read state mutations
  markRead(id: number): Promise<void>;
  markAllRead(predioId: number): Promise<void>;

  // Deletion
  delete(id: number): Promise<void>;

  // Preferences
  getPreferencias(): Promise<NotificacionPreferencias>;
  updatePreferencias(data: NotificacionPreferencias): Promise<void>;

  // Push notifications
  subscribePush(dto: PushSubscriptionDto): Promise<void>;
  unsubscribePush(token: string): Promise<void>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): INotificacionesService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockNotificacionesService } = require('./notificaciones.mock');
  return new MockNotificacionesService();
}

function createRealService(): INotificacionesService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealNotificacionesService } = require('./notificaciones.api');
  return new RealNotificacionesService();
}

/**
 * Notificaciones service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real when env var is not set (falsy).
 */
export const notificacionesService: INotificacionesService = USE_MOCKS
  ? createMockService()
  : createRealService();
