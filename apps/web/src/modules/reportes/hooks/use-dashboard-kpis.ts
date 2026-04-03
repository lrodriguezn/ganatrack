// apps/web/src/modules/reportes/hooks/use-dashboard-kpis.ts
/**
 * useDashboardKPIs — fetches dashboard KPIs for the active predio.
 *
 * @example
 * const { data, isLoading, error, refetch } = useDashboardKPIs(1);
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { reportesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';

export function useDashboardKPIs(predioId: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.reportes.dashboard(predioId),
    queryFn: () => reportesService.getDashboardKPIs(predioId),
    staleTime: 60_000, // 60s — KPIs change slowly
    enabled: predioId > 0,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
