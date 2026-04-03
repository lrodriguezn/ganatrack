// apps/web/src/modules/reportes/components/export/export-progress.tsx
/**
 * ExportProgress — Progress bar showing polling status for active exports.
 *
 * Features:
 * - Shows multiple concurrent exports (max 3)
 * - Cancel button per export
 * - Retry on failure
 * - Toast-like notifications
 */

'use client';

import { useExportacion } from '../../hooks/use-exportacion';
import { X, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'Preparando...',
  processing: 'Generando archivo...',
  completed: 'Completado',
  failed: 'Error',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-400',
  processing: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
};

export function ExportProgress() {
  const { exports, cancelExport, retryExport } = useExportacion();

  if (exports.size === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 space-y-2">
      {Array.from(exports.values()).map((exp) => (
        <div
          key={exp.jobId}
          className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {exp.status === 'processing' && (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              )}
              {exp.status === 'failed' && (
                <X className="h-4 w-4 text-red-500" />
              )}
              {exp.status === 'completed' && (
                <div className="h-4 w-4 rounded-full bg-emerald-500" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {exp.tipo} — {exp.formato.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {exp.status === 'failed' && (
                <button
                  type="button"
                  onClick={() => retryExport(exp.jobId)}
                  className="rounded p-1 text-gray-400 hover:text-emerald-500"
                  title="Reintentar"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => cancelExport(exp.jobId)}
                className="rounded p-1 text-gray-400 hover:text-red-500"
                title="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                statusColors[exp.status] ?? 'bg-gray-400',
              )}
              style={{ width: `${exp.progress}%` }}
            />
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {statusLabels[exp.status] ?? exp.status}
            </span>
            {exp.error && (
              <span className="text-xs text-red-500">{exp.error}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
