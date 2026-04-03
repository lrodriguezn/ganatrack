// apps/web/src/modules/reportes/hooks/use-reporte-inventario.ts
/**
 * useReporteInventario — fetches inventory report data.
 *
 * @example
 * const { data, isLoading, error } = useReporteInventario({
 *   predioId: 1,
 *   fechaInicio: '2025-04-01',
 *   fechaFin: '2026-04-01',
 * });
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { reportesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ReporteFiltros } from '../types/reportes.types';

export function useReporteInventario(filtros: ReporteFiltros) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.reportes.inventario(filtros),
    queryFn: () => reportesService.getInventario(filtros),
    staleTime: 5 * 60_000, // 5min
    enabled: filtros.predioId > 0,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
