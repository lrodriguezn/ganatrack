// apps/web/src/app/dashboard/sincronizacion/components/sync-queue-list.tsx
/**
 * sync-queue-list.tsx — List component for displaying failed sync items.
 *
 * Shows a list of failed sync items with actions to retry or discard.
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { FailedItemCard } from './failed-item-card';
import type { IFailedItemCardProps } from './failed-item-card';

export interface ISyncQueueItem {
  url: string;
  method: string;
  body?: string;
  timestamp: number;
  error?: string;
  status?: number;
  reason?: string;
}

interface SyncQueueListProps {
  items: ISyncQueueItem[];
  type: 'failed' | 'conflict';
  title?: string;
  onRetry?: (url: string) => void;
  onDiscard?: (url: string) => void;
  onResolve?: (url: string, keepLocal: boolean) => void;
}

export function SyncQueueList({
  items,
  type,
  title,
  onRetry,
  onDiscard,
  onResolve,
}: SyncQueueListProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const defaultTitle = type === 'conflict' ? 'Conflictos' : 'Elementos fallidos';
  const displayTitle = title ?? defaultTitle;

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          No hay elementos pendientes
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Todos los cambios se han sincronizado correctamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {displayTitle}
          </h3>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
            {items.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            'p-1 rounded-md',
            'text-gray-400 hover:text-gray-600',
            'dark:text-gray-500 dark:hover:text-gray-300',
          )}
        >
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* List */}
      {!isCollapsed && (
        <div className="space-y-3">
          {items.map((item, index) => (
            <FailedItemCard
              key={`${item.url}-${item.method}-${index}`}
              item={item}
              onRetry={onRetry ? () => onRetry(item.url) : undefined}
              onDiscard={onDiscard ? () => onDiscard(item.url) : undefined}
              onResolve={type === 'conflict' && onResolve ? () => onResolve(item.url, true) : undefined}
              onAcceptServer={type === 'conflict' && onResolve ? () => onResolve(item.url, false) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
