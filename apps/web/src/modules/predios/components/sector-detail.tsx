// apps/web/src/modules/predios/components/sector-detail.tsx
/**
 * SectorDetail — detail view for a single Sector.
 *
 * Displays sector information with Edit and Delete actions.
 * Simple header + grid layout (no tabs).
 *
 * Usage:
 *   <SectorDetail
 *     sector={sector}
 *     predioId={1}
 *     onEdit={handleEdit}
 *     onDelete={handleDelete}
 *   />
 */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { Sector } from '@ganatrack/shared-types';

interface SectorDetailProps {
  sector: Sector;
  predioId: number;
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

const ESTADO_LABELS: Record<string, { label: string; className: string }> = {
  activo: {
    label: 'Activo',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  en_descanso: {
    label: 'En Descanso',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
};

export function SectorDetail({
  sector,
  onEdit,
  onDelete,
}: SectorDetailProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {sector.nombre}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {sector.codigo}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(sector)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDelete(sector)}
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
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{sector.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
              <dd className="text-gray-900 dark:text-gray-100 font-mono">{sector.codigo}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de Pasto</dt>
              <dd className="text-gray-900 dark:text-gray-100">{sector.tipoPasto}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
              <dd>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_LABELS[sector.estado]?.className ?? ''}`}>
                  {ESTADO_LABELS[sector.estado]?.label ?? sector.estado}
                </span>
              </dd>
            </div>
          </dl>
        </InfoCard>

        <InfoCard title="Dimensiones">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Hectáreas</dt>
              <dd className="text-gray-900 dark:text-gray-100 text-2xl font-semibold">
                {sector.areaHectareas?.toLocaleString('es-CO') ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Capacidad Máxima</dt>
              <dd className="text-gray-900 dark:text-gray-100">{sector.capacidadMaxima ?? '—'} animales</dd>
            </div>
          </dl>
        </InfoCard>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for SectorDetail.
 */
export function SectorDetailSkeleton(): JSX.Element {
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
