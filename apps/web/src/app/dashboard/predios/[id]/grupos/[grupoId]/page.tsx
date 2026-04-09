// apps/web/src/app/dashboard/predios/[id]/grupos/[grupoId]/page.tsx
/**
 * Grupo detail page — displays a single Grupo within a Predio.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useGrupo, useDeleteGrupo } from '@/modules/predios/hooks';
import { GrupoDetail } from '@/modules/predios/components/grupo-detail';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Skeleton } from '@/shared/components/ui/skeleton';

function GrupoDetailContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const grupoIdParam = params.grupoId;
  const grupoIdStr = Array.isArray(grupoIdParam) ? grupoIdParam[0] : grupoIdParam;
  const grupoId = grupoIdStr ? Number(grupoIdStr) : NaN;

  const { grupo, isLoading, error } = useGrupo({ id: grupoId, predioId: id });
  const { mutate: deleteGrupo, isLoading: isDeleting } = useDeleteGrupo();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Invalid IDs
  if (isNaN(id) || id <= 0 || isNaN(grupoId) || grupoId <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          ID de grupo inválido
        </p>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/dashboard/predios/${id}/grupos/${grupoId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteGrupo(id, grupoId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.push(`/dashboard/predios/${id}/grupos`);
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

  if (error || !grupo) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el grupo
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
      <GrupoDetail
        grupo={grupo}
        predioId={id}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SubRecursoDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        nombre={grupo?.nombre ?? ''}
        tipoRecurso="Grupo"
        isLoading={isDeleting}
      />
    </>
  );
}

export default function GrupoDetailPage(): JSX.Element {
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
      <GrupoDetailContent />
    </Suspense>
  );
}