// apps/web/src/app/dashboard/sincronizacion/components/failed-item-card.tsx
/**
 * failed-item-card.tsx — Card component for displaying a failed sync item.
 *
 * Shows:
 * - HTTP method (POST, PUT, DELETE)
 * - Entity name (derived from URL)
 * - Error message
 * - Timestamp
 * - Actions: retry, discard
 */

'use client';

import { useState } from 'react';
import { AlertCircle, Trash2, RefreshCw, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export interface IFailedItemCardProps {
  item: {
    url: string;
    method: string;
    body?: string;
    timestamp: number;
    error?: string;
    reason?: string;
    status?: number;
  };
  onRetry?: (url: string) => void;
  onDiscard?: (url: string) => void;
  onResolve?: (url: string, keepLocal: boolean) => void;
  onAcceptServer?: (url: string) => void;
}

/**
 * Extracts the entity name from a URL.
 * e.g., "/api/v1/animales/123" -> "animales"
 */
function extractEntityName(url: string): string {
  const parts = url.split('/');
  // Find "animales", "servicios", "productos", etc.
  const entityIndex = parts.findIndex(
    (p) => p === 'animales' || p === 'servicios' || p === 'productos' || p === 'usuarios',
  );
  return entityIndex !== -1 ? (parts[entityIndex] ?? 'recurso') : 'recurso';
}

/**
 * Formats a timestamp to a readable string.
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/**
 * Returns a CSS class based on the HTTP method.
 */
function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'bg-green-100 text-green-800';
    case 'PUT':
      return 'bg-blue-100 text-blue-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function FailedItemCard({
  item,
  onRetry,
  onDiscard,
}: IFailedItemCardProps): JSX.Element {
  const [showConfirm, setShowConfirm] = useState(false);
  const entityName = extractEntityName(item.url);
  const timestamp = formatTimestamp(item.timestamp);

  const handleDiscard = () => {
    if (showConfirm) {
      onDiscard?.(item.url);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div
      className={clsx(
        'relative rounded-lg border p-4',
        'bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-700',
        'shadow-sm',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Method badge */}
          <span
            className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
              getMethodColor(item.method),
            )}
          >
            {item.method}
          </span>

          {/* Entity */}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {entityName}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{timestamp}</span>
        </div>
      </div>

      {/* Error message */}
      {item.error && (
        <div className="mt-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{item.error}</p>
        </div>
      )}

      {/* Status badge */}
      {item.status && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
            Status: {item.status}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {/* Retry button */}
        <button
          type="button"
          onClick={() => onRetry?.(item.url)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5',
            'text-sm font-medium rounded-md',
            'bg-blue-600 text-white',
            'hover:bg-blue-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>

        {/* Discard button */}
        <button
          type="button"
          onClick={handleDiscard}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5',
            'text-sm font-medium rounded-md',
            showConfirm
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
          )}
        >
          <Trash2 className="h-4 w-4" />
          {showConfirm ? 'Confirmar' : 'Descartar'}
        </button>

        {/* Cancel confirmation */}
        {showConfirm && (
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5',
              'text-sm font-medium rounded-md',
              'text-gray-600 hover:text-gray-800',
              'dark:text-gray-400 dark:hover:text-gray-200',
            )}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
