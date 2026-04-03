// apps/web/src/modules/notificaciones/services/notificaciones.mock.ts
/**
 * Mock Notificaciones Service — simulates API for development.
 *
 * Provides seeded notification data for all notification types.
 * In-memory store supports all operations.
 * Simulated delay: 200ms.
 */

import type {
  Notificacion,
  NotificacionResumen,
  NotificacionPreferencias,
  PushSubscriptionDto,
  PaginationParams,
  PaginatedResponse,
} from '../types/notificaciones.types';
import type { INotificacionesService } from './notificaciones.service';
import { ApiError } from '@/shared/lib/errors';

// ============================================================================
// Seed Data — realistic notifications
// ============================================================================

const now = new Date();

const SEED_NOTIFICACIONES: Notificacion[] = [
  {
    id: 1,
    tipo: 'parto_proximo',
    titulo: 'Parto próximo — La Negra (GAN-014)',
    mensaje: 'Se estima que el parto ocurrirá en los próximos 7 días. Verifique los signos de parto.',
    leida: false,
    fechaCreacion: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 min ago
    entidadTipo: 'animal',
    entidadId: 14,
    accionUrl: '/animales/14',
  },
  {
    id: 2,
    tipo: 'celo_detectado',
    titulo: 'Celo detectado — Bella (GAN-015)',
    mensaje: 'Se ha detectado celo en Bella. Considere programar servicio.',
    leida: false,
    fechaCreacion: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    entidadTipo: 'animal',
    entidadId: 15,
    accionUrl: '/animales/15',
  },
  {
    id: 3,
    tipo: 'servicio_pendiente',
    titulo: 'Palpación pendiente — Luna (GAN-016)',
    mensaje: 'Han pasado 45 días desde el servicio. Es momento de realizar la palpación.',
    leida: false,
    fechaCreacion: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    entidadTipo: 'servicio',
    entidadId: 42,
    accionUrl: '/servicios/palpaciones?animal=16',
  },
  {
    id: 4,
    tipo: 'alerta_sanitaria',
    titulo: 'Vacunación pendiente — Potrero Norte',
    mensaje: '12 animales en Potrero Norte requieren vacunación contra aftosa.',
    leida: true,
    fechaCreacion: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    entidadTipo: 'predio',
    entidadId: 1,
    accionUrl: '/sanidad/vacunacion',
  },
  {
    id: 5,
    tipo: 'sync_completado',
    titulo: 'Sincronización completada',
    mensaje: 'Se sincronizaron 8 cambios realizados sin conexión.',
    leida: true,
    fechaCreacion: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    entidadTipo: null,
    entidadId: null,
    accionUrl: null,
  },
];

const storeNotificaciones: Notificacion[] = [...SEED_NOTIFICACIONES];

let idCounter = 6;

const defaultPreferencias: NotificacionPreferencias = {
  partosProximos: true,
  celosDetectados: true,
  serviciosPendientes: true,
  alertasSanitarias: true,
  pushHabilitado: false,
};

let preferencias = { ...defaultPreferencias };

// ============================================================================
// Helpers
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// MockNotificacionesService
// ============================================================================

export class MockNotificacionesService implements INotificacionesService {
  async getResumen(predioId: number): Promise<NotificacionResumen> {
    await delay(200);
    // In mock mode, predioId is ignored — return same data
    const unread = storeNotificaciones.filter((n) => !n.leida);
    return {
      noLeidas: unread.length,
      ultimas: unread.slice(0, 5),
    };
  }

  async getAll(
    _predioId: number,
    params: PaginationParams,
  ): Promise<PaginatedResponse<Notificacion>> {
    await delay(200);
    const total = storeNotificaciones.length;
    const totalPages = Math.ceil(total / params.limit);
    const start = (params.page - 1) * params.limit;
    const data = storeNotificaciones.slice(start, start + params.limit);

    return {
      data,
      meta: { total, page: params.page, limit: params.limit, totalPages },
    };
  }

  async markRead(id: number): Promise<void> {
    await delay(200);
    const notif = storeNotificaciones.find((n) => n.id === id);
    if (!notif) {
      throw new ApiError(404, 'NOT_FOUND', `Notificación con ID ${id} no encontrada`);
    }
    notif.leida = true;
  }

  async markAllRead(_predioId: number): Promise<void> {
    await delay(200);
    storeNotificaciones.forEach((n) => {
      n.leida = true;
    });
  }

  async delete(id: number): Promise<void> {
    await delay(200);
    const index = storeNotificaciones.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Notificación con ID ${id} no encontrada`);
    }
    storeNotificaciones.splice(index, 1);
  }

  async getPreferencias(): Promise<NotificacionPreferencias> {
    await delay(200);
    return { ...preferencias };
  }

  async updatePreferencias(data: NotificacionPreferencias): Promise<void> {
    await delay(200);
    preferencias = { ...preferencias, ...data };
  }

  async subscribePush(_dto: PushSubscriptionDto): Promise<void> {
    await delay(200);
    // Mock: just succeed
    preferencias.pushHabilitado = true;
  }

  async unsubscribePush(_token: string): Promise<void> {
    await delay(200);
    // Mock: just succeed
    preferencias.pushHabilitado = false;
  }
}

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetNotificacionesMock(): void {
  storeNotificaciones.length = 0;
  storeNotificaciones.push(...SEED_NOTIFICACIONES.map((n) => ({ ...n })));
  idCounter = 6;
  preferencias = { ...defaultPreferencias };
}
