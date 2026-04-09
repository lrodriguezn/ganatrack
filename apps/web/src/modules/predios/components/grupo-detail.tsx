// apps/web/src/modules/predios/components/grupo-detail.tsx
/**
 * GrupoDetail — detail view for a single Grupo.
 *
 * Displays grupo information with Edit and Delete actions.
 * Simple header + grid layout (no tabs).
 *
 * Usage:
 *   <GrupoDetail
 *     grupo={grupo}
 *     predioId={1}
 *     onEdit={handleEdit}
 *     onDelete={handleDelete}
 *   />
 */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { Grupo } from '@ganatrack/shared-types';

interface GrupoDetailProps {
  grupo: Grupo;
  predioId: number;
  onEdit?: (grupo: Grupo) => void;
  onDelete?: (grupo: Grupo) => void;
}

export function GrupoDetail({
  grupo,
  onEdit,
  onDelete,
}: GrupoDetailProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {grupo.nombre}
          </h1>
          {grupo.descripcion && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {grupo.descripcion}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(grupo)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDelete(grupo)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Información General">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{grupo.nombre}</dd>
            </div>
            {grupo.descripcion && (
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
                <dd className="text-gray-900 dark:text-gray-100">{grupo.descripcion}</dd>
              </div>
            )}
          </dl>
        </InfoCard>

        <InfoCard title="Estadísticas">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Cantidad de Animales</dt>
              <dd className="text-gray-900 dark:text-gray-100 text-2xl font-semibold">
                {grupo.animalCount ?? 0}
              </dd>
            </div>
          </dl>
        </InfoCard>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for GrupoDetail.
 */
export function GrupoDetailSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

/**
 * Info card wrapper with title.
 */
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
