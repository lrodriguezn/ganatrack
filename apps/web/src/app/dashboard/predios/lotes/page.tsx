// apps/web/src/app/dashboard/predios/lotes/page.tsx
/**
 * Global lotes page — displays lotes for the active Predio.
 *
 * Filters by active Predio from usePredioStore.
 * Shows all lotes belonging to the currently selected Predio.
 */

'use client';

import { usePredioStore } from '@/store/predio.store';
import { useLotes } from '@/modules/predios/hooks';
import { LotesTable } from '@/modules/predios/components/lotes-table';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function LotesPage(): JSX.Element {
  const { predioActivo } = usePredioStore();

  const { lotes, isLoading, error } = useLotes({
    predioId: predioActivo?.id ?? 0,
  });

  if (!predioActivo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Lotes
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los lotes de tu operación
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Selecciona un predio activo para ver sus lotes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Lotes
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Lotes del predio: {predioActivo.nombre}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar los lotes: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <LotesTable lotes={lotes} isLoading={isLoading} />
      )}
    </div>
  );
}
