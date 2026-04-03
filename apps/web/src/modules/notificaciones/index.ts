// apps/web/src/modules/notificaciones/index.ts
/**
 * Notificaciones module — barrel export.
 */

// Types
export type {
  Notificacion,
  NotificacionResumen,
  NotificacionPreferencias,
  NotificacionTipo,
  PushSubscriptionDto,
  PaginationParams,
  PaginatedResponse,
} from './types/notificaciones.types';

export {
  NOTIFICACION_TIPO_LABELS,
  NOTIFICACION_TIPO_COLORS,
} from './types/notificaciones.types';

// Services
export { notificacionesService } from './services';
export type { INotificacionesService } from './services';

// Hooks
export {
  useNotificacionesResumen,
  useNotificaciones,
  useMarkRead,
  useNotificacionPreferencias,
  usePushRegistration,
} from './hooks';

// Components
export { NotificationCenter } from './components/notification-center';
export { NotificationItem } from './components/notification-item';
export { PreferenciasForm } from './components/preferencias-form';
