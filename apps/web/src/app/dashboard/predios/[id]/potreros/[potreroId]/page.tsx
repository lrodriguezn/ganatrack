// apps/web/src/app/dashboard/predios/[id]/potreros/[potreroId]/page.tsx
/**
 * Potrero detail page — displays a single Potrero within a Predio.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { usePotrero, useDeletePotrero } from '@/modules/predios/hooks';
import { PotreroDetail } from '@/modules/predios/components/potrero-detail';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Skeleton } from '@/shared/components/ui/skeleton';

function PotreroDetailContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const potreroIdParam = params.potreroId;
  const potreroIdStr = Array.isArray(potreroIdParam) ? potreroIdParam[0] : potreroIdParam;
  const potreroId = potreroIdStr ? Number(potreroIdStr) : NaN;

  const { potrero, isLoading, error } = usePotrero({ id: potreroId, predioId: id });
  const { mutate: deletePotrero, isLoading: isDeleting } = useDeletePotrero();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Invalid IDs
  if (isNaN(id) || id <= 0 || isNaN(potreroId) || potreroId <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          ID de potrero inválido
        </p>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/dashboard/predios/${id}/potreros/${potreroId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deletePotrero(id, potreroId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.push(`/dashboard/predios/${id}/potreros`);
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

  if (error || !potrero) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el potrero
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
      <PotreroDetail
        potrero={potrero}
        predioId={id}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SubRecursoDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        nombre={potrero?.nombre ?? ''}
        tipoRecurso="Potrero"
        isLoading={isDeleting}
      />
    </>
  );
}

export default function PotreroDetailPage(): JSX.Element {
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
      <PotreroDetailContent />
    </Suspense>
  );
}