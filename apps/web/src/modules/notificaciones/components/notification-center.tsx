// apps/web/src/modules/notificaciones/components/notification-center.tsx
/**
 * NotificationCenter — slide-over panel using Radix Dialog with CSS transform.
 *
 * Features:
 * - Slide-over from right side using CSS translate-x transform
 * - Header with title, "Marcar todas como leídas" button, close button
 * - NotificationList rendering NotificationItem[]
 * - Empty state when no notifications
 * - Loading state and error state
 * - Dialog Portal renders at root level
 *
 * @example
 * <NotificationCenter />
 */

'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { XMarkIcon, CheckCircleIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { useNotificacionesStore, selectPanelOpen } from '@/store/notificaciones.store';
import { useNotificacionesResumen, useMarkRead } from '../hooks';
import { usePredioStore } from '@/store/predio.store';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';
import { NotificationItem } from './notification-item';

export function NotificationCenter(): JSX.Element {
  const panelOpen = useNotificacionesStore(selectPanelOpen);
  const closePanel = useNotificacionesStore((s) => s.closePanel);
  const predioActivo = usePredioStore((s) => s.predioActivo);
  const isOnline = useOnlineStatus();
  const { markRead, markAllRead } = useMarkRead();

  const { data, isLoading, error } = useNotificacionesResumen(predioActivo?.id);

  function handleMarkAllRead() {
    if (predioActivo?.id) {
      markAllRead(predioActivo.id);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      closePanel();
    }
  }

  return (
    <Dialog.Root open={panelOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="
            fixed inset-0 z-50 bg-black/30 backdrop-blur-sm
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          "
        />

        {/* Slide-over panel */}
        <Dialog.Content
          className="
            fixed top-0 right-0 z-50 h-full w-full max-w-md
            bg-white dark:bg-gray-900 shadow-2xl
            border-l border-gray-200 dark:border-gray-800
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right
            duration-300 ease-out
            flex flex-col
          "
          aria-describedby="notification-center-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </Dialog.Title>
              <Dialog.Description
                id="notification-center-description"
                className="sr-only"
              >
                Panel de notificaciones del predio
              </Dialog.Description>
            </div>

            <div className="flex items-center gap-2">
              {/* Mark all as read */}
              {data && data.noLeidas > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="
                    flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400
                    hover:text-blue-800 dark:hover:text-blue-300 transition-colors
                  "
                  title="Marcar todas como leídas"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Marcar todas</span>
                </button>
              )}

              {/* Close button */}
              <Dialog.Close
                className="
                  flex h-8 w-8 items-center justify-center rounded-md
                  text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                aria-label="Cerrar notificaciones"
              >
                <XMarkIcon className="h-5 w-5" />
              </Dialog.Close>
            </div>
          </div>

          {/* Offline indicator */}
          {!isOnline && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Sin conexión — mostrando datos en caché
              </p>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  No se pudieron cargar las notificaciones.
                </p>
              </div>
            )}

            {!isLoading && !error && data?.ultimas && data.ultimas.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BellAlertIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  No tienes notificaciones
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
                  Las notificaciones aparecerán aquí cuando haya actividad en tu predio
                </p>
              </div>
            )}

            {!isLoading && !error && data?.ultimas && data.ultimas.length > 0 && (
              <div>
                {data.ultimas.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={markRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <Link
                href="/dashboard/notificaciones"
                className="
                  block text-center text-sm text-blue-600 dark:text-blue-400
                  hover:text-blue-800 dark:hover:text-blue-300 transition-colors
                "
              >
                Ver todas las notificaciones →
              </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
