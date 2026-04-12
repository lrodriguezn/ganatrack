// apps/web/src/app/dashboard/predios/potreros/page.tsx
/**
 * Global potreros page — displays potreros for the active Predio.
 *
 * Filters by active Predio from usePredioStore.
 * Shows all potreros belonging to the currently selected Predio.
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePredioRequerido } from '@/shared/hooks';
import { usePotreros, useDeletePotrero } from '@/modules/predios/hooks';
import { PotrerosTable } from '@/modules/predios/components/potreros-table';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface DeleteTarget {
  id: number;
  nombre: string;
}

export default function PotrerosPage(): JSX.Element | null {
  const router = useRouter();
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();

  const { potreros, isLoading, error } = usePotreros({
    predioId: predioActivo?.id ?? 0,
  });

  const { mutate: deletePotrero, isLoading: isDeleting } = useDeletePotrero({
    onSuccess: () => {
      // Query invalidation happens automatically via the hook
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  if (predioLoading || !predioActivo) return null;

  const handleEdit = (potrero: { id: number }) => {
    router.push(`/dashboard/predios/${predioActivo.id}/potreros/${potrero.id}/edit`);
  };

  const handleDelete = (potrero: { id: number; nombre: string }) => {
    setDeleteTarget({ id: potrero.id, nombre: potrero.nombre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deletePotrero(predioActivo.id, deleteTarget.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Potreros
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Potreros del predio: {predioActivo.nombre}
          </p>
        </div>
        <Link href={`/dashboard/predios/${predioActivo.id}/potreros/nuevo`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Potrero
          </Button>
        </Link>
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
        <PotrerosTable
          potreros={potreros}
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
        tipoRecurso="Potrero"
        isLoading={isDeleting}
      />
    </div>
  );
}
