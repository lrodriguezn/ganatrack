// apps/web/src/app/dashboard/sincronizacion/components/conflict-resolver.tsx
/**
 * conflict-resolver.tsx — Modal component for resolving sync conflicts.
 *
 * Shows a side-by-side diff between local and server versions.
 * User can choose to keep their local version or accept the server version.
 */

'use client';

import { useState } from 'react';
import { X, Server, Monitor, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export interface IConflictItem {
  url: string;
  method: string;
  body?: string;
  timestamp: number;
  error?: string;
  status?: number;
}

interface ConflictResolverProps {
  item: IConflictItem;
  serverData: Record<string, unknown>;
  onKeepLocal: () => void;
  onAcceptServer: () => void;
  onClose?: () => void;
}

/**
 * Parses JSON body safely.
 */
function parseBody(body?: string): Record<string, unknown> {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

/**
 * Renders a diff between local and server data.
 */
function DiffView({
  localData,
  serverData,
}: {
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
}): JSX.Element {
  const allKeys = Array.from(new Set([...Object.keys(localData), ...Object.keys(serverData)]));

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      {/* Local version */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
          <Monitor className="h-4 w-4" />
          Mi Versión
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          {allKeys.map((key) => {
            const localValue = localData[key];
            const serverValue = serverData[key];
            const isDifferent = JSON.stringify(localValue) !== JSON.stringify(serverValue);

            return (
              <div key={key} className="flex justify-between gap-2">
                <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                <span
                  className={clsx(
                    'font-mono text-right',
                    isDifferent && 'bg-yellow-100 dark:bg-yellow-900/40 rounded px-1',
                  )}
                >
                  {JSON.stringify(localValue) ?? 'null'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Server version */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-400">
          <Server className="h-4 w-4" />
          Versión Servidor
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {allKeys.map((key) => {
            const localValue = localData[key];
            const serverValue = serverData[key];
            const isDifferent = JSON.stringify(localValue) !== JSON.stringify(serverValue);

            return (
              <div key={key} className="flex justify-between gap-2">
                <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                <span
                  className={clsx(
                    'font-mono text-right',
                    isDifferent && 'bg-green-100 dark:bg-green-900/40 rounded px-1',
                  )}
                >
                  {JSON.stringify(serverValue) ?? 'null'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ConflictResolver({
  item,
  serverData,
  onKeepLocal,
  onAcceptServer,
  onClose,
}: ConflictResolverProps): JSX.Element {
  const [selectedOption, setSelectedOption] = useState<'local' | 'server' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const localData = parseBody(item.body);

  const handleKeepLocal = async () => {
    setIsLoading(true);
    setSelectedOption('local');
    try {
      await onKeepLocal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptServer = async () => {
    setIsLoading(true);
    setSelectedOption('server');
    try {
      await onAcceptServer();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Resolver Conflicto
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                'p-1 rounded-md',
                'text-gray-400 hover:text-gray-600',
                'dark:text-gray-500 dark:hover:text-gray-300',
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Info message */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Se detectó un conflicto de versión. Otro usuario modificó este registro mientras
            estabas offline. Elige qué versión quieres mantener.
          </p>

          {/* Diff view */}
          <DiffView localData={localData} serverData={serverData} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onAcceptServer}
            disabled={isLoading}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2',
              'text-sm font-medium rounded-lg',
              'border border-gray-300 dark:border-gray-600',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <Server className="h-4 w-4" />
            Aceptar Versión Servidor
          </button>

          <button
            type="button"
            onClick={handleKeepLocal}
            disabled={isLoading}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2',
              'text-sm font-medium rounded-lg',
              'bg-blue-600 text-white',
              'hover:bg-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <Monitor className="h-4 w-4" />
            Mantener Mi Versión
          </button>
        </div>
      </div>
    </div>
  );
}
