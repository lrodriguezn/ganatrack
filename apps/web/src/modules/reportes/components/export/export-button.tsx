// apps/web/src/modules/reportes/components/export/export-button.tsx
/**
 * ExportButton — Popover with format options (PDF/Excel/CSV).
 *
 * Props:
 * - reportType: string ('inventario', 'reproductivo', etc.)
 * - filtros: ReporteFiltros
 * - disabled?: boolean
 *
 * Triggers useExportacion on format selection.
 * Shows tooltip "No hay datos para exportar" when disabled.
 */

'use client';

import { useState } from 'react';
import { Download, FileText, Table, FileType } from 'lucide-react';
import { useExportacion } from '../../hooks/use-exportacion';
import type { ReporteFiltros, ExportFormato } from '../../types/reportes.types';
import { cn } from '@/shared/lib/utils';

interface ExportButtonProps {
  reportType: string;
  filtros: ReporteFiltros;
  disabled?: boolean;
}

const formatOptions: {
  format: ExportFormato;
  label: string;
  icon: typeof FileText;
  ext: string;
}[] = [
  { format: 'pdf', label: 'PDF', icon: FileText, ext: 'pdf' },
  { format: 'excel', label: 'Excel', icon: Table, ext: 'xlsx' },
  { format: 'csv', label: 'CSV', icon: FileType, ext: 'csv' },
];

export function ExportButton({
  reportType,
  filtros,
  disabled = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const { startExport, isExporting, canExport } = useExportacion();

  const handleExport = async (format: ExportFormato) => {
    if (disabled || !canExport) return;

    try {
      await startExport(reportType, {
        formato: format,
        filtros,
      });
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al exportar';
      // Toast would go here — using alert for now
      alert(message);
    }
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-600'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
        )}
        title={disabled ? 'No hay datos para exportar' : undefined}
      >
        <Download className="h-4 w-4" />
        Exportar
        {isExporting && (
          <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        )}
      </button>

      {disabled && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
          No hay datos para exportar
        </div>
      )}

      {open && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Popover */}
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Formato de exportación
            </div>
            {formatOptions.map(({ format, label, icon: Icon }) => (
              <button
                key={format}
                type="button"
                onClick={() => handleExport(format)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
