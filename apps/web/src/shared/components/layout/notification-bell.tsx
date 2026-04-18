// apps/web/src/shared/components/layout/notification-bell.tsx
/**
 * NotificationBell — header bell icon with unread count badge.
 *
 * Features:
 * - Bell icon from @heroicons/react/24/outline
 * - Badge showing unread count (absolute positioned top-right)
 * - Badge hidden when count === 0
 * - Badge shows "99+" when count > 99
 * - Click opens NotificationCenter slide-over panel
 * - Uses useNotificacionesResumen() for real-time polling
 */

'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/shared/components/ui/badge';
import { useNotificacionesStore } from '@/store/notificaciones.store';
import { useNotificacionesResumen } from '@/modules/notificaciones/hooks';
import { usePredioStore } from '@/store/predio.store';

export function NotificationBell(): JSX.Element {
  const predioActivo = usePredioStore((s) => s.predioActivo);
  const unreadCount = useNotificacionesStore((s) => s.unreadCount);
  const panelOpen = useNotificacionesStore((s) => s.panelOpen);
  const openPanel = useNotificacionesStore((s) => s.openPanel);
  const closePanel = useNotificacionesStore((s) => s.closePanel);

  // Start polling for notifications - TEMPORARILY DISABLED FOR TESTING
  // useNotificacionesResumen(predioActivo?.id);

  function handleClick() {
    if (panelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  return (
    <button
      type="button"
      className="relative flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      aria-label="Notificaciones"
      onClick={handleClick}
    >
      <BellIcon className="h-5 w-5" />
      <Badge count={unreadCount} max={99} />
    </button>
  );
}
