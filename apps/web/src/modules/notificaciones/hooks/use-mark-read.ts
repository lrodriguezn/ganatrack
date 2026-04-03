// apps/web/src/modules/notificaciones/hooks/use-mark-read.ts
/**
 * useMarkRead — mutation hook for marking notifications as read.
 *
 * Features:
 * - Optimistic unreadCount update in Zustand store
 * - Query invalidation of resumen after mutation
 * - Error rollback for optimistic updates
 *
 * @example
 * const { markRead, markAllRead, isPending } = useMarkRead();
 * markRead(notificationId);
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionesService } from '../services';
import { useNotificacionesStore } from '@/store/notificaciones.store';

export function useMarkRead() {
  const queryClient = useQueryClient();
  // Use selectors instead of getState() to avoid stale references
  const decrementUnread = useNotificacionesStore((s) => s.decrementUnread);
  const setUnreadCount = useNotificacionesStore((s) => s.setUnreadCount);

  const mutation = useMutation({
    mutationFn: (id: number) => notificacionesService.markRead(id),
    onMutate: () => {
      // Optimistic: decrement unread count
      decrementUnread();
    },
    onError: () => {
      // Rollback: refetch to get correct count
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'resumen'] });
    },
    onSuccess: () => {
      // Invalidate resumen to refresh data
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'resumen'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: (predioId: number) => notificacionesService.markAllRead(predioId),
    onMutate: () => {
      // Optimistic: set unread count to 0
      setUnreadCount(0);
    },
    onError: () => {
      // Rollback: refetch to get correct count
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'resumen'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'resumen'] });
    },
  });

  return {
    markRead: mutation.mutate,
    markAllRead: markAllMutation.mutate,
    isPending: mutation.isPending || markAllMutation.isPending,
    error: (mutation.error ?? markAllMutation.error) as Error | null,
  };
}
