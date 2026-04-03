// apps/web/src/modules/reportes/hooks/use-reporte-mortalidad.ts
/**
 * useReporteMortalidad — fetches mortality report data.
 *
 * Computes peak detection (>2x 6-month avg) for alert highlighting.
 *
 * @example
 * const { data, isLoading, error, peakMonths } = useReporteMortalidad({
 *   predioId: 1,
 *   fechaInicio: '2025-04-01',
 *   fechaFin: '2026-04-01',
 * });
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ReporteFiltros, TimeSeriesItem } from '../types/reportes.types';

export function useReporteMortalidad(filtros: ReporteFiltros) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.reportes.mortalidad(filtros),
    queryFn: () => reportesService.getMortalidad(filtros),
    staleTime: 5 * 60_000, // 5min
    enabled: filtros.predioId > 0,
  });

  // Compute peak detection: months with mortality > 2x 6-month rolling average
  const peakMonths = useMemo(() => {
    if (!data?.graficos?.tendenciaMensual) return new Set<number>();
    const series = data.graficos.tendenciaMensual;
    const peaks = new Set<number>();

    for (let i = 5; i < series.length; i++) {
      const window = series.slice(i - 6, i);
      const avg =
        window.reduce((sum, item) => {
          const values = Object.values(item.values);
          return sum + values.reduce((a, b) => a + b, 0);
        }, 0) / 6;

      const currentValues = Object.values(series[i]!.values);
      const current = currentValues.reduce((a, b) => a + b, 0);

      if (avg > 0 && current > 2 * avg) {
        peaks.add(i);
      }
    }

    return peaks;
  }, [data]);

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
    peakMonths,
  };
}
