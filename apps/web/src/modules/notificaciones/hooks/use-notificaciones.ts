// apps/web/src/modules/notificaciones/hooks/use-notificaciones.ts
/**
 * useNotificaciones — paginated notification list with server-side pagination.
 *
 * @example
 * const { data, isLoading, error, fetchNextPage } = useNotificaciones({
 *   predioId: 1,
 *   page: 1,
 *   limit: 20,
 * });
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { notificacionesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';
import { StaleTimes } from '@/shared/lib/query-client';

export interface UseNotificacionesParams {
  predioId: number;
  page?: number;
  limit?: number;
}

export function useNotificaciones({
  predioId,
  page = 1,
  limit = 20,
}: UseNotificacionesParams) {
  const isOnline = useOnlineStatus();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.notificaciones.list(predioId, { page, limit }),
    queryFn: () => notificacionesService.getAll(predioId, { page, limit }),
    enabled: isOnline && !!predioId,
    staleTime: StaleTimes.LIST,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
