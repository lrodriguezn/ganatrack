// apps/web/src/app/dashboard/predios/lotes/page.tsx
/**
 * Global lotes page — displays lotes for the active Predio.
 *
 * Filters by active Predio from usePredioStore.
 * Shows all lotes belonging to the currently selected Predio.
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { useLotes, useDeleteLote } from '@/modules/predios/hooks';
import { LotesTable } from '@/modules/predios/components/lotes-table';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface DeleteTarget {
  id: number;
  nombre: string;
}

export default function LotesPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();

  const { lotes, isLoading, error } = useLotes({
    predioId: predioActivo?.id ?? 0,
  });

  const { mutate: deleteLote, isLoading: isDeleting } = useDeleteLote({
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

  const handleEdit = (lote: { id: number }) => {
    router.push(`/dashboard/predios/${predioActivo.id}/lotes/${lote.id}/edit`);
  };

  const handleDelete = (lote: { id: number; nombre: string }) => {
    setDeleteTarget({ id: lote.id, nombre: lote.nombre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteLote(predioActivo.id, deleteTarget.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Lotes
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Lotes del predio: {predioActivo.nombre}
          </p>
        </div>
        <Link href={`/dashboard/predios/${predioActivo.id}/lotes/nuevo`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lote
          </Button>
        </Link>
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
        <LotesTable
          lotes={lotes}
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
        tipoRecurso="Lote"
        isLoading={isDeleting}
      />
    </div>
  );
}