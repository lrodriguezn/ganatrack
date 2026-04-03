// apps/web/src/modules/notificaciones/hooks/use-notificacion-preferencias.ts
/**
 * useNotificacionPreferencias — query + mutation for notification preferences.
 *
 * Features:
 * - Query for fetching current preferences
 * - Mutation for updating preferences with optimistic toggle
 * - Rollback on error
 *
 * @example
 * const { preferencias, isLoading, updatePreferencia } = useNotificacionPreferencias();
 * updatePreferencia('partosProximos', false);
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { NotificacionPreferencias } from '../types/notificaciones.types';

export function useNotificacionPreferencias() {
  const queryClient = useQueryClient();

  const { data: preferencias, isLoading, error } = useQuery({
    queryKey: queryKeys.notificaciones.preferencias(),
    queryFn: () => notificacionesService.getPreferencias(),
    staleTime: 60_000, // 1 minute — preferences rarely change
  });

  const updateMutation = useMutation({
    mutationFn: (data: NotificacionPreferencias) => notificacionesService.updatePreferencias(data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notificaciones.preferencias() });

      // Snapshot current value
      const previous = queryClient.getQueryData<NotificacionPreferencias>(
        queryKeys.notificaciones.preferencias(),
      );

      // Optimistically update
      queryClient.setQueryData(queryKeys.notificaciones.preferencias(), newData);

      return { previous };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notificaciones.preferencias(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones.preferencias() });
    },
  });

  /**
   * Toggle a single preference field optimistically.
   * Note: Excludes 'pushHabilitado' — use usePushRegistration for push toggling.
   */
  type PreferenceField = Exclude<keyof NotificacionPreferencias, 'pushHabilitado'>;

  const togglePreferencia = (field: PreferenceField) => {
    if (!preferencias) return;
    updateMutation.mutate({
      ...preferencias,
      [field]: !preferencias[field],
    });
  };

  return {
    preferencias,
    isLoading,
    error: error as Error | null,
    updatePreferencias: updateMutation.mutate,
    togglePreferencia,
    isPending: updateMutation.isPending,
  };
}
