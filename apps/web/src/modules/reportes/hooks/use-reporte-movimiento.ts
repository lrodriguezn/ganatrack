// apps/web/src/modules/reportes/hooks/use-reporte-movimiento.ts
/**
 * useReporteMovimiento — fetches movement (economic) report data.
 *
 * Computes saldoNeto (compras - ventas) and provides currency formatting.
 *
 * @example
 * const { data, isLoading, error, saldoNeto } = useReporteMovimiento({...});
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ReporteFiltros } from '../types/reportes.types';

/**
 * Format a number as currency (COP by default).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function useReporteMovimiento(filtros: ReporteFiltros) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.reportes.movimiento(filtros),
    queryFn: () => reportesService.getMovimiento(filtros),
    staleTime: 5 * 60_000, // 5min
    enabled: filtros.predioId > 0,
  });

  // Compute saldo neto from compras vs ventas
  const saldoNeto = useMemo(() => {
    if (!data?.graficos?.comprasVsVentas) return 0;
    return data.graficos.comprasVsVentas.reduce((acc, item) => {
      const compras = item.values.compras ?? 0;
      const ventas = item.values.ventas ?? 0;
      return acc + (ventas - compras);
    }, 0);
  }, [data]);

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
    saldoNeto,
    formatCurrency,
  };
}
