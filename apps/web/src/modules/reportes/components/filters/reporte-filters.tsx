// apps/web/src/modules/reportes/components/filters/reporte-filters.tsx
/**
 * ReporteFiltros — Date range picker + predio selector.
 *
 * Syncs with useFiltrosReportes() hook for bidirectional URL ↔ store sync.
 *
 * Props:
 * - className?: string
 * - showPredio?: boolean (default true)
 * - onChange?: (filtros) => void
 */

'use client';

import { useCallback } from 'react';
import { useFiltrosReportes } from '../../hooks/use-filtros-reportes';
import { usePredioStore } from '@/store/predio.store';
import type { ReporteFiltros } from '../../types/reportes.types';
import { cn } from '@/shared/lib/utils';

interface ReporteFiltrosProps {
  className?: string;
  showPredio?: boolean;
  onChange?: (filtros: ReporteFiltros) => void;
}

export function ReporteFiltros({
  className,
  showPredio = true,
  onChange,
}: ReporteFiltrosProps) {
  const { filtros, setFechas, resetFiltros } = useFiltrosReportes();
  const predios = usePredioStore((s) => s.predios);
  const predioActivo = usePredioStore((s) => s.predioActivo);
  const switchPredio = usePredioStore((s) => s.switchPredio);

  const handleFechaInicioChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFechas(e.target.value, filtros.fechaFin);
      onChange?.({ ...filtros, fechaInicio: e.target.value });
    },
    [filtros, setFechas, onChange],
  );

  const handleFechaFinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFechas(filtros.fechaInicio, e.target.value);
      onChange?.({ ...filtros, fechaFin: e.target.value });
    },
    [filtros, setFechas, onChange],
  );

  const handlePredioChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = parseInt(e.target.value, 10);
      switchPredio(id);
    },
    [switchPredio],
  );

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {showPredio && predios.length > 1 && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="predio-select"
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Predio
          </label>
          <select
            id="predio-select"
            value={predioActivo?.id ?? ''}
            onChange={handlePredioChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            {predios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label
          htmlFor="fecha-inicio"
          className="text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Desde
        </label>
        <input
          id="fecha-inicio"
          type="date"
          value={filtros.fechaInicio}
          onChange={handleFechaInicioChange}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="fecha-fin"
          className="text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Hasta
        </label>
        <input
          id="fecha-fin"
          type="date"
          value={filtros.fechaFin}
          onChange={handleFechaFinChange}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <button
        type="button"
        onClick={resetFiltros}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Restablecer
      </button>
    </div>
  );
}
