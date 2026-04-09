// apps/web/src/app/dashboard/predios/[id]/lotes/[loteId]/page.tsx
/**
 * Lote detail page — displays a single Lote within a Predio.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useLote, useDeleteLote } from '@/modules/predios/hooks';
import { LoteDetail } from '@/modules/predios/components/lote-detail';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Skeleton } from '@/shared/components/ui/skeleton';

function LoteDetailContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const loteIdParam = params.loteId;
  const loteIdStr = Array.isArray(loteIdParam) ? loteIdParam[0] : loteIdParam;
  const loteId = loteIdStr ? Number(loteIdStr) : NaN;

  const { lote, isLoading, error } = useLote({ id: loteId, predioId: id });
  const { mutate: deleteLote, isLoading: isDeleting } = useDeleteLote();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Invalid IDs
  if (isNaN(id) || id <= 0 || isNaN(loteId) || loteId <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          ID de lote inválido
        </p>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/dashboard/predios/${id}/lotes/${loteId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteLote(id, loteId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.push(`/dashboard/predios/${id}/lotes`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !lote) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el lote
        </p>
        {error && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {(error as Error).message}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <LoteDetail
        lote={lote}
        predioId={id}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SubRecursoDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        nombre={lote?.nombre ?? ''}
        tipoRecurso="Lote"
        isLoading={isDeleting}
      />
    </>
  );
}

export default function LoteDetailPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <LoteDetailContent />
    </Suspense>
  );
}