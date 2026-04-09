// apps/web/src/app/dashboard/predios/[id]/potreros/page.tsx
/**
 * Potreros list page within Predio context — displays potreros for a specific Predio.
 *
 * URL: /dashboard/predios/:id/potreros
 * Shows potreros table with CRUD actions for the specified predio.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { usePotreros, useDeletePotrero } from '@/modules/predios/hooks';
import { PotrerosTable } from '@/modules/predios/components/potreros-table';
import { SubRecursoDeleteModal } from '@/modules/predios/components';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface DeleteTarget {
  id: number;
  nombre: string;
}

export default function PredioPotrerosPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse predioId from URL
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const predioId = idStr ? Number(idStr) : NaN;

  const { potreros, isLoading, error } = usePotreros({ predioId });

  const { mutate: deletePotrero, isLoading: isDeleting } = useDeletePotrero({
    onSuccess: () => {
      // Query invalidation happens automatically via the hook
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Invalid predioId
  if (isNaN(predioId) || predioId <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          ID de predio inválido
        </p>
      </div>
    );
  }

  const handleEdit = (potrero: { id: number }) => {
    router.push(`/dashboard/predios/${predioId}/potreros/${potrero.id}/edit`);
  };

  const handleDelete = (potrero: { id: number; nombre: string }) => {
    setDeleteTarget({ id: potrero.id, nombre: potrero.nombre });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deletePotrero(predioId, deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/predios/${predioId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Predio
            </Button>
          </Link>
        </div>
        <Link href={`/dashboard/predios/${predioId}/potreros/nuevo`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Potrero
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Potreros
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gestiona los potreros de este predio
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
