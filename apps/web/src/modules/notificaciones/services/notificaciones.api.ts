// apps/web/src/modules/notificaciones/services/notificaciones.api.ts
/**
 * Real Notificaciones Service — production API calls.
 *
 * All endpoints are relative to /api/v1/notificaciones
 * Uses apiClient from @/shared/lib/api-client
 */

import { apiClient } from '@/shared/lib/api-client';
import type {
  Notificacion,
  NotificacionResumen,
  NotificacionPreferencias,
  PushSubscriptionDto,
  PaginationParams,
  PaginatedResponse,
} from '../types/notificaciones.types';
import type { INotificacionesService } from './notificaciones.service';

export class RealNotificacionesService implements INotificacionesService {
  async getResumen(predioId: number): Promise<NotificacionResumen> {
    const response = await apiClient.get('notificaciones/resumen', {
      searchParams: { predio_id: predioId },
    });
    return response.json() as Promise<NotificacionResumen>;
  }

  async getAll(
    predioId: number,
    params: PaginationParams,
  ): Promise<PaginatedResponse<Notificacion>> {
    const response = await apiClient.get('notificaciones', {
      searchParams: {
        predio_id: predioId,
        page: params.page,
        limit: params.limit,
      },
    });
    return response.json() as Promise<PaginatedResponse<Notificacion>>;
  }

  async markRead(id: number): Promise<void> {
    await apiClient.patch(`notificaciones/${id}/leer`);
  }

  async markAllRead(predioId: number): Promise<void> {
    await apiClient.patch('notificaciones/leer-todas', {
      searchParams: { predio_id: predioId },
    });
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`notificaciones/${id}`);
  }

  async getPreferencias(): Promise<NotificacionPreferencias> {
    const response = await apiClient.get('notificaciones/preferencias');
    return response.json() as Promise<NotificacionPreferencias>;
  }

  async updatePreferencias(data: NotificacionPreferencias): Promise<void> {
    await apiClient.put('notificaciones/preferencias', { json: data });
  }

  async subscribePush(dto: PushSubscriptionDto): Promise<void> {
    await apiClient.post('notificaciones/push/subscribe', { json: dto });
  }

  async unsubscribePush(token: string): Promise<void> {
    await apiClient.post('notificaciones/push/unsubscribe', { json: { token } });
  }
}
