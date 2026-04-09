// apps/web/src/app/dashboard/predios/grupos/page.tsx
/**
 * Global grupos page — displays grupos for the active Predio.
 *
 * Filters by active Predio from usePredioStore.
 * Shows all grupos belonging to the currently selected Predio.
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { useGrupos, useDeleteGrupo } from '@/modules/predios/hooks';
import { GruposTable } from '@/modules/predios/components/grupos-table';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface DeleteTarget {
  id: number;
  nombre: string;
}

export default function GruposPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();

  const { grupos, isLoading, error } = useGrupos({
    predioId: predioActivo?.id ?? 0,
  });

  const { mutate: deleteGrupo, isLoading: isDeleting } = useDeleteGrupo({
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
            Grupos
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los grupos de animales de tu operación
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Selecciona un grupo activo para ver sus grupos
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = (grupo: { id: number }) => {
    router.push(`/dashboard/predios/${predioActivo.id}/grupos/${grupo.id}/edit`);
  };

  const handleDelete = (grupo: { id: number; nombre: string }) => {
    setDeleteTarget({ id: grupo.id, nombre: grupo.nombre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteGrupo(predioActivo.id, deleteTarget.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Grupos
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Grupos del grupo: {predioActivo.nombre}
          </p>
        </div>
        <Link href={`/dashboard/predios/${predioActivo.id}/grupos/nuevo`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Grupo
          </Button>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar los grupos: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <GruposTable
          grupos={grupos}
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
        tipoRecurso="Grupo"
        isLoading={isDeleting}
      />
    </div>
  );
}
