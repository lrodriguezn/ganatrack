// apps/web/src/modules/notificaciones/hooks/use-notificaciones-resumen.ts
/**
 * useNotificacionesResumen — polling hook for notification summary.
 *
 * Polls every 30 seconds for unread count + latest notifications.
 * Pauses when tab is hidden (refetchIntervalInBackground: false).
 * Pauses when offline (enabled: isOnline).
 * Syncs unreadCount to Zustand store for badge display.
 *
 * @example
 * const { data, isLoading, error } = useNotificacionesResumen(predioId);
 */

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificacionesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { useNotificacionesStore } from '@/store/notificaciones.store';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';

export function useNotificacionesResumen(predioId: number | undefined) {
  const isOnline = useOnlineStatus();
  const setUnreadCount = useNotificacionesStore((s) => s.setUnreadCount);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.notificaciones.resumen(predioId ?? -1),
    queryFn: () => notificacionesService.getResumen(predioId!),
    enabled: isOnline && !!predioId,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });

  // Sync unreadCount to Zustand store
  useEffect(() => {
    if (data?.noLeidas !== undefined) {
      setUnreadCount(data.noLeidas);
    }
  }, [data?.noLeidas, setUnreadCount]);

  return {
    data,
    isLoading,
    error: error as Error | null,
  };
}
