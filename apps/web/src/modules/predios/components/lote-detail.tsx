// apps/web/src/modules/predios/components/lote-detail.tsx
/**
 * LoteDetail — detail view for a single Lote.
 *
 * Displays lote information with Edit and Delete actions.
 * Simple header + grid layout (no tabs).
 *
 * Usage:
 *   <LoteDetail
 *     lote={lote}
 *     predioId={1}
 *     onEdit={handleEdit}
 *     onDelete={handleDelete}
 *   />
 */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { Lote } from '@ganatrack/shared-types';

interface LoteDetailProps {
  lote: Lote;
  predioId: number;
  onEdit?: (lote: Lote) => void;
  onDelete?: (lote: Lote) => void;
}

const TIPO_LABELS: Record<string, { label: string; className: string }> = {
  producción: {
    label: 'Producción',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  levante: {
    label: 'Levante',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  engorde: {
    label: 'Engorde',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  },
  cría: {
    label: 'Cría',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
};

export function LoteDetail({
  lote,
  onEdit,
  onDelete,
}: LoteDetailProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {lote.nombre}
            </h1>
            {lote.descripcion && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {lote.descripcion}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIPO_LABELS[lote.tipo]?.className ?? ''}`}>
            {TIPO_LABELS[lote.tipo]?.label ?? lote.tipo}
          </span>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(lote)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDelete(lote)}
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
              <dd className="text-gray-900 dark:text-gray-100 font-medium">{lote.nombre}</dd>
            </div>
            {lote.descripcion && (
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
                <dd className="text-gray-900 dark:text-gray-100">{lote.descripcion}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo</dt>
              <dd>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIPO_LABELS[lote.tipo]?.className ?? ''}`}>
                  {TIPO_LABELS[lote.tipo]?.label ?? lote.tipo}
                </span>
              </dd>
            </div>
          </dl>
        </InfoCard>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for LoteDetail.
 */
export function LoteDetailSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
