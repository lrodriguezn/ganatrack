// apps/web/src/modules/notificaciones/components/notification-item.tsx
/**
 * NotificationItem — single notification row.
 *
 * Features:
 * - Tipo-based icon and color
 * - Título and short description
 * - Relative date (hace X minutos/horas/días)
 * - Unread indicator (bold text + blue dot)
 * - Mark-read action on click
 *
 * @example
 * <NotificationItem notification={notif} onMarkRead={() => markRead(notif.id)} />
 */

'use client';

import {
  HeartIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { Notificacion, NotificacionTipo } from '../types/notificaciones.types';
import { NOTIFICACION_TIPO_COLORS } from '../types/notificaciones.types';

interface NotificationItemProps {
  notification: Notificacion;
  onMarkRead: (id: number) => void;
}

const TIPO_ICONS: Record<NotificacionTipo, React.ComponentType<{ className?: string }>> = {
  parto_proximo: HeartIcon,
  celo_detectado: BellAlertIcon,
  servicio_pendiente: ArrowPathIcon,
  alerta_sanitaria: ExclamationTriangleIcon,
  sync_completado: CheckCircleIcon,
  sync_fallido: ExclamationTriangleIcon,
};

function relativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CO');
}

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps): JSX.Element {
  const Icon = TIPO_ICONS[notification.tipo];
  const colorClasses = NOTIFICACION_TIPO_COLORS[notification.tipo];

  function handleClick() {
    if (!notification.leida) {
      onMarkRead(notification.id);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800
        hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
        ${!notification.leida ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-lg ${colorClasses}`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm truncate ${
                !notification.leida
                  ? 'font-semibold text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {notification.titulo}
            </p>
            {/* Unread dot */}
            {!notification.leida && (
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {notification.mensaje}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {relativeDate(notification.fechaCreacion)}
          </p>
        </div>
      </div>
    </button>
  );
}
