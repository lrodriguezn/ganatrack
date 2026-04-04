// apps/web/src/shared/components/feedback/empty-state.tsx
/**
 * EmptyState — Reusable component for empty lists/tables.
 *
 * Props:
 * - icon: LucideIcon — icon to display
 * - title: string — primary heading
 * - description: string — secondary text
 * - action?: { label: string; onClick: () => void } — optional CTA button
 *
 * @example
 * <EmptyState
 *   icon={Package}
 *   title="No hay animales registrados"
 *   description="Comienza agregando tu primer animal al sistema"
 *   action={{ label: 'Agregar animal', onClick: handleCreate }}
 * />
 */

'use client';

import type { LucideIcon } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
