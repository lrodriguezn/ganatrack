// apps/web/src/app/dashboard/predios/[id]/sectores/[sectorId]/page.tsx
/**
 * Sector detail page — displays a single Sector within a Predio.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useSector, useDeleteSector } from '@/modules/predios/hooks';
import { SectorDetail } from '@/modules/predios/components/sector-detail';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Skeleton } from '@/shared/components/ui/skeleton';

function SectorDetailContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const sectorIdParam = params.sectorId;
  const sectorIdStr = Array.isArray(sectorIdParam) ? sectorIdParam[0] : sectorIdParam;
  const sectorId = sectorIdStr ? Number(sectorIdStr) : NaN;

  const { sector, isLoading, error } = useSector({ id: sectorId, predioId: id });
  const { mutate: deleteSector, isLoading: isDeleting } = useDeleteSector();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Invalid IDs
  if (isNaN(id) || id <= 0 || isNaN(sectorId) || sectorId <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          ID de sector inválido
        </p>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/dashboard/predios/${id}/sectores/${sectorId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteSector(id, sectorId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.push(`/dashboard/predios/${id}/sectores`);
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

  if (error || !sector) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el sector
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
      <SectorDetail
        sector={sector}
        predioId={id}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SubRecursoDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        nombre={sector?.nombre ?? ''}
        tipoRecurso="Sector"
        isLoading={isDeleting}
      />
    </>
  );
}

export default function SectorDetailPage(): JSX.Element {
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
      <SectorDetailContent />
    </Suspense>
  );
}