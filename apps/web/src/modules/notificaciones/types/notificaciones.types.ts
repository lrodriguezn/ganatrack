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

// ============================================================================
// NotificacionTipo
// ============================================================================
//
// Path C fix (JD Round 1, A.C3): web enum is a SUPERSET of the API enum.
// The lower_snake values (parto_proximo, sync_completado, ...) are
// web-native and may be produced by client-side sync events. The
// UPPER_SNAKE values (PARTO_PROXIMO, CELO_ESTIMADO, ...) are exactly
// what the API returns and MUST be handled, otherwise TIPO_ICONS
// lookup returns `undefined` and the component crashes on first poll.
//
// Mapping rationale (PRD for PR #57 — fix-endpoint-notificaciones):
//   parto_proximo       ←→  PARTO_PROXIMO
//   celo_detectado      ←→  CELO_ESTIMADO
//   servicio_pendiente  ←→  INSEMINACION_PENDIENTE
//   alerta_sanitaria    ←→  VACUNA_PENDIENTE | ANIMAL_ENFERMO
//   sync_completado     (web-only)
//   sync_fallido        (web-only)
//
// See TIPO_ICONS, NOTIFICACION_TIPO_LABELS, NOTIFICACION_TIPO_COLORS.

export type NotificacionTipo =
  | 'parto_proximo'        // Parto próximo (7 días) — web + API
  | 'celo_detectado'       // Celo detectado — web; API uses CELO_ESTIMADO
  | 'servicio_pendiente'   // Palpación pendiente — web; API uses INSEMINACION_PENDIENTE
  | 'alerta_sanitaria'     // Alerta sanitaria — web; API uses VACUNA_PENDIENTE / ANIMAL_ENFERMO
  | 'sync_completado'      // Background sync exitoso — web-only
  | 'sync_fallido'         // Background sync fallido — web-only
  | 'PARTO_PROXIMO'        // API
  | 'CELO_ESTIMADO'        // API
  | 'INSEMINACION_PENDIENTE' // API
  | 'VACUNA_PENDIENTE'     // API
  | 'ANIMAL_ENFERMO';      // API

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
  // UPPER_SNAKE — API surface (regression A.C3)
  PARTO_PROXIMO: 'Parto próximo',
  CELO_ESTIMADO: 'Celo estimado',
  INSEMINACION_PENDIENTE: 'Inseminación pendiente',
  VACUNA_PENDIENTE: 'Vacuna pendiente',
  ANIMAL_ENFERMO: 'Animal enfermo',
};

export const NOTIFICACION_TIPO_COLORS: Record<NotificacionTipo, string> = {
  parto_proximo: 'text-pink-500 bg-pink-50 dark:bg-pink-950',
  celo_detectado: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  servicio_pendiente: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
  alerta_sanitaria: 'text-red-500 bg-red-50 dark:bg-red-950',
  sync_completado: 'text-green-500 bg-green-50 dark:bg-green-950',
  sync_fallido: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  // UPPER_SNAKE — API surface (regression A.C3)
  PARTO_PROXIMO: 'text-pink-500 bg-pink-50 dark:bg-pink-950',
  CELO_ESTIMADO: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  INSEMINACION_PENDIENTE: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
  VACUNA_PENDIENTE: 'text-red-500 bg-red-50 dark:bg-red-950',
  ANIMAL_ENFERMO: 'text-red-500 bg-red-50 dark:bg-red-950',
};
