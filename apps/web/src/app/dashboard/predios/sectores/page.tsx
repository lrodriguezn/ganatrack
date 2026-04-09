// apps/web/src/app/dashboard/predios/sectores/page.tsx
/**
 * Global sectores page — displays sectores for the active Predio.
 *
 * Filters by active Predio from usePredioStore.
 * Shows all sectores belonging to the currently selected Predio.
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { useSectores, useDeleteSector } from '@/modules/predios/hooks';
import { SectoresTable } from '@/modules/predios/components/sectores-table';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface DeleteTarget {
  id: number;
  nombre: string;
}

export default function SectoresPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();

  const { sectores, isLoading, error } = useSectores({
    predioId: predioActivo?.id ?? 0,
  });

  const { mutate: deleteSector, isLoading: isDeleting } = useDeleteSector({
    onSuccess: () => {
      // Query invalidation happens automatically via the hook
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  if (!predioActivo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Sectores
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los sectores de tu operación
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Selecciona un grupo activo para ver sus sectores
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = (sector: { id: number }) => {
    router.push(`/dashboard/predios/${predioActivo.id}/sectores/${sector.id}/edit`);
  };

  const handleDelete = (sector: { id: number; nombre: string }) => {
    setDeleteTarget({ id: sector.id, nombre: sector.nombre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteSector(predioActivo.id, deleteTarget.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Sectores
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sectores del grupo: {predioActivo.nombre}
          </p>
        </div>
        <Link href={`/dashboard/predios/${predioActivo.id}/sectores/nuevo`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Sector
          </Button>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar los sectores: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <SectoresTable
          sectores={sectores}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <SubRecursoDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        nombre={deleteTarget?.nombre ?? ''}
        tipoRecurso="Sector"
        isLoading={isDeleting}
      />
    </div>
  );
}