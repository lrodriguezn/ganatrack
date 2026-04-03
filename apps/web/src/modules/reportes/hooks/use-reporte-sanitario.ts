// apps/web/src/modules/reportes/hooks/use-reporte-sanitario.ts
/**
 * useReporteSanitario — fetches sanitary report data.
 *
 * Flags overdue vaccinations (>7 days past due).
 *
 * @example
 * const { data, isLoading, error, overdueVaccinations } = useReporteSanitario({...});
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ReporteFiltros, TimeSeriesItem } from '../types/reportes.types';

export function useReporteSanitario(filtros: ReporteFiltros) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.reportes.sanitario(filtros),
    queryFn: () => reportesService.getSanitario(filtros),
    staleTime: 5 * 60_000, // 5min
    enabled: filtros.predioId > 0,
  });

  // Flag overdue vaccinations (>7 days past due)
  const overdueCount = useMemo(() => {
    if (!data?.graficos?.vacunaciones) return 0;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    return data.graficos.vacunaciones.filter((item: TimeSeriesItem) => {
      const itemDate = new Date(item.date);
      const pending = item.values.pendiente ?? 0;
      return pending > 0 && itemDate < sevenDaysAgo;
    }).length;
  }, [data]);

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
    overdueCount,
  };
}
