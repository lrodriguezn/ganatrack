// apps/web/src/app/dashboard/predios/[id]/lotes/page.tsx
/**
 * Lotes list page within Predio context — displays lotes for a specific Predio.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useLotes, useDeleteLote } from '@/modules/predios/hooks';
import { LotesTable } from '@/modules/predios/components/lotes-table';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface DeleteTarget {
  id: number;
  nombre: string;
}

export default function PredioLotesPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const predioId = idStr ? Number(idStr) : NaN;

  const { lotes, isLoading, error } = useLotes({ predioId });

  const { mutate: deleteLote, isLoading: isDeleting } = useDeleteLote({
    onSuccess: () => { setDeleteTarget(null); },
  });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  if (isNaN(predioId) || predioId <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">ID de predio inválido</p>
      </div>
    );
  }

  const handleEdit = (lote: { id: number }) => {
    router.push(`/dashboard/predios/${predioId}/lotes/${lote.id}/edit`);
  };

  const handleDelete = (lote: { id: number; nombre: string }) => {
    setDeleteTarget({ id: lote.id, nombre: lote.nombre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteLote(predioId, deleteTarget.id);
      // Modal se cierra en onSuccess del hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/predios/${predioId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Predio
            </Button>
          </Link>
        </div>
        <Link href={`/dashboard/predios/${predioId}/lotes/nuevo`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lote
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Lotes</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gestiona los lotes de este predio
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar los lotes: {(error as Error).message}
          </p>
        </div>
      )}

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
