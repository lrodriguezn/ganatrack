// apps/web/src/modules/notificaciones/types/notificaciones.types.ts
/**
 * Notification module types — interfaces, DTOs, and pagination types.
 *
 * Covers all notification types for cattle management:
 * partos, celos, servicios, alertas sanitarias, sync events.
 */

// ============================================================================
// Notification Types
// ============================================================================

export type NotificacionTipo =
  | 'parto_proximo'        // Parto próximo (7 días)
  | 'celo_detectado'       // Celo detectado
  | 'servicio_pendiente'   // Palpación pendiente
  | 'alerta_sanitaria'     // Alerta sanitaria
  | 'sync_completado'      // Background sync exitoso
  | 'sync_fallido';        // Background sync fallido

export interface Notificacion {
  id: number;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;       // ISO 8601
  entidadTipo: 'animal' | 'servicio' | 'predio' | null;
  entidadId: number | null;
  accionUrl: string | null;    // Deep link to entity
}

export interface NotificacionResumen {
  noLeidas: number;
  ultimas: Notificacion[];     // Últimas 5 para preview
}

export interface NotificacionPreferencias {
  partosProximos: boolean;
  celosDetectados: boolean;
  serviciosPendientes: boolean;
  alertasSanitarias: boolean;
  pushHabilitado: boolean;
}

export interface PushSubscriptionDto {
  token: string;
  dispositivo: 'web';
  userAgent: string;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Type helpers
// ============================================================================

export const NOTIFICACION_TIPO_LABELS: Record<NotificacionTipo, string> = {
  parto_proximo: 'Parto próximo',
  celo_detectado: 'Celo detectado',
  servicio_pendiente: 'Servicio pendiente',
  alerta_sanitaria: 'Alerta sanitaria',
  sync_completado: 'Sincronización completada',
  sync_fallido: 'Sincronización fallida',
};

export const NOTIFICACION_TIPO_COLORS: Record<NotificacionTipo, string> = {
  parto_proximo: 'text-pink-500 bg-pink-50 dark:bg-pink-950',
  celo_detectado: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  servicio_pendiente: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
  alerta_sanitaria: 'text-red-500 bg-red-50 dark:bg-red-950',
  sync_completado: 'text-green-500 bg-green-50 dark:bg-green-950',
  sync_fallido: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
};
