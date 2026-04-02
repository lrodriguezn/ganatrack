// apps/web/src/app/dashboard/predios/potreros/page.tsx
/**
 * Global potreros page — displays potreros for the active Predio.
 *
 * Filters by active Predio from usePredioStore.
 * Shows all potreros belonging to the currently selected Predio.
 */

'use client';

import { usePredioStore } from '@/store/predio.store';
import { usePotreros } from '@/modules/predios/hooks';
import { PotrerosTable } from '@/modules/predios/components/potreros-table';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function PotrerosPage(): JSX.Element {
  const { predioActivo } = usePredioStore();

  const { potreros, isLoading, error } = usePotreros({
    predioId: predioActivo?.id ?? 0,
  });

  if (!predioActivo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Potreros
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los potreros de tu operación
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Selecciona un predio activo para ver sus potreros
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
          Potreros
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Potreros del predio: {predioActivo.nombre}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar los potreros: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <PotrerosTable potreros={potreros} isLoading={isLoading} />
      )}
    </div>
  );
}
