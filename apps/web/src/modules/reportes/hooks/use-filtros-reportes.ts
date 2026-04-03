// apps/web/src/modules/reportes/hooks/use-filtros-reportes.ts
/**
 * useFiltrosReportes — syncs Zustand store with URL searchParams.
 *
 * Features:
 * - Reads fechaInicio/fechaFin from Zustand store
 * - Reads predioId from URL searchParams (falls back to active predio)
 * - Bidirectional URL ↔ store sync
 * - 300ms debounce on date changes
 * - Defaults to last 12 months + active predio
 *
 * @example
 * const { filtros, setFechas, resetFiltros } = useFiltrosReportes();
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useReportesStore } from '@/store/reportes.store';
import { usePredioStore } from '@/store/predio.store';
import type { ReporteFiltros } from '../types/reportes.types';

const DEBOUNCE_MS = 300;

export function useFiltrosReportes(): {
  filtros: ReporteFiltros;
  setFechas: (inicio: string, fin: string) => void;
  resetFiltros: () => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const fechaInicio = useReportesStore((s) => s.fechaInicio);
  const fechaFin = useReportesStore((s) => s.fechaFin);
  const storeSetFechas = useReportesStore((s) => s.setFechas);
  const storeResetFiltros = useReportesStore((s) => s.resetFiltros);

  const predioActivo = usePredioStore((s) => s.predioActivo);

  // Debounce refs
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get predioId from URL or fallback to active predio
  const predioId = useMemo(() => {
    const urlPredio = searchParams.get('predio_id');
    if (urlPredio) {
      const parsed = parseInt(urlPredio, 10);
      if (Number.isNaN(parsed)) return predioActivo?.id ?? 0;
      return parsed;
    }
    return predioActivo?.id ?? 0;
  }, [searchParams, predioActivo]);

  // Initialize dates from URL or store defaults
  useEffect(() => {
    const urlInicio = searchParams.get('desde');
    const urlFin = searchParams.get('hasta');

    if (urlInicio && urlFin) {
      // Only update store if different from current
      if (urlInicio !== fechaInicio || urlFin !== fechaFin) {
        storeSetFechas(urlInicio, urlFin);
      }
    } else if (!urlInicio && !urlFin) {
      // No URL params — update URL with store defaults
      const params = new URLSearchParams(searchParams.toString());
      params.set('desde', fechaInicio);
      params.set('hasta', fechaFin);
      if (predioId > 0) {
        params.set('predio_id', String(predioId));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when store dates change (debounced)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('desde', fechaInicio);
      params.set('hasta', fechaFin);
      if (predioId > 0) {
        params.set('predio_id', String(predioId));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fechaInicio, fechaFin, predioId, pathname, router, searchParams]);

  const setFechas = (inicio: string, fin: string) => {
    storeSetFechas(inicio, fin);
  };

  const resetFiltros = () => {
    storeResetFiltros();
    // Clear debounce timer to prevent double navigation
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // Reset URL too
    const params = new URLSearchParams();
    if (predioId > 0) {
      params.set('predio_id', String(predioId));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filtros: ReporteFiltros = useMemo(
    () => ({
      predioId,
      fechaInicio,
      fechaFin,
    }),
    [predioId, fechaInicio, fechaFin],
  );

  return { filtros, setFechas, resetFiltros };
}
