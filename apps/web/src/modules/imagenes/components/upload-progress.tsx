// apps/web/src/modules/imagenes/components/upload-progress.tsx
/**
 * UploadProgress — per-file progress bar overlay.
 *
 * Displays the current state of each file in the upload queue:
 * - Pending: waiting to be uploaded
 * - Uploading: progress bar with percentage
 * - Complete: green checkmark
 * - Error: red X with retry button
 *
 * @example
 * <UploadProgress
 *   onRetry={(id) => handleRetry(id)}
 *   onCancel={(id) => handleCancel(id)}
 * />
 */

'use client';

import { CheckCircle2, XCircle, Loader2, RotateCcw, X } from 'lucide-react';
import { useImagenStore } from '@/store/imagen.store';
import type { UploadQueueItem } from '../types/imagen.types';

interface UploadProgressProps {
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const statusConfig: Record<UploadQueueItem['status'], { color: string; bg: string }> = {
  pending: { color: 'text-gray-500', bg: 'bg-gray-200 dark:bg-gray-700' },
  uploading: { color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-200 dark:bg-brand-500/20' },
  complete: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-200 dark:bg-green-500/20' },
  error: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-200 dark:bg-red-500/20' },
};

export function UploadProgress({
  onRetry,
  onCancel,
  onRemove,
}: UploadProgressProps): JSX.Element {
  const { queue, removeFile } = useImagenStore();

  if (queue.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-2">
      {queue.map((item) => {
        const config = statusConfig[item.status];
        const sizeKB = (item.file.size / 1024).toFixed(0);

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
          >
            {/* Preview */}
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded">
              <img
                src={item.preview}
                alt={item.file.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info + Progress */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.file.name}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {sizeKB}KB
                </span>
              </div>

              {item.status === 'uploading' && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    <span>Subiendo...</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${config.bg}`}>
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {item.status === 'error' && item.error && (
                <p className="mt-0.5 text-xs text-red-500">{item.error}</p>
              )}
            </div>

            {/* Status icon + Actions */}
            <div className="flex items-center gap-1">
              {item.status === 'pending' && (
                <Loader2 className={`h-5 w-5 animate-spin ${config.color}`} />
              )}
              {item.status === 'uploading' && (
                <Loader2 className={`h-5 w-5 animate-spin ${config.color}`} />
              )}
              {item.status === 'complete' && (
                <CheckCircle2 className={`h-5 w-5 ${config.color}`} />
              )}
              {item.status === 'error' && (
                <XCircle className={`h-5 w-5 ${config.color}`} />
              )}

              {item.status === 'error' && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(item.id)}
                  className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
                  aria-label="Reintentar"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}

              {item.status === 'uploading' && onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Cancelar upload"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {item.status === 'complete' && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Remover de la cola"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
