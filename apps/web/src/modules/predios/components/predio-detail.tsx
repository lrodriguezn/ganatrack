// apps/web/src/modules/predios/components/predio-detail.tsx
/**
 * PredioDetail — detail view for a single Predio with tabbed sub-recursos.
 *
 * Tabs:
 * - Info: Basic Predio information
 * - Potreros: List of paddocks belonging to this Predio
 * - Sectores: List of administrative sectors
 * - Lotes: List of production lots
 * - Grupos: List of animal groups
 *
 * This component fetches sub-recursos using the provided Predio ID.
 * If no ID is provided, uses the active Predio from usePredioStore.
 *
 * Usage:
 *   <PredioDetail
 *     predioId={1}
 *     onEdit={handleEdit}
 *   />
 *
 * Or (using store's active predio):
 *   <PredioDetail onEdit={handleEdit} />
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePredio, usePotreros, useSectores, useLotes, useGrupos } from '../hooks';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Pencil } from 'lucide-react';

interface PredioDetailProps {
  /** Predio ID to display. If omitted, uses active Predio from store. */
  predioId?: number;
  onEdit?: (id: number) => void;
}

type TabId = 'info' | 'potreros' | 'sectores' | 'lotes' | 'grupos';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'info', label: 'Información' },
  { id: 'potreros', label: 'Potreros' },
  { id: 'sectores', label: 'Sectores' },
  { id: 'lotes', label: 'Lotes' },
  { id: 'grupos', label: 'Grupos' },
];

const TIPO_LABELS: Record<string, string> = {
  'lechería': 'Lechería',
  'cría': 'Cría',
  'doble propósito': 'Doble Propósito',
  'engorde': 'Engorde',
};

const ESTADO_LABELS: Record<string, { label: string; className: string }> = {
  activo: {
    label: 'Activo',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  inactivo: {
    label: 'Inactivo',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
  en_descanso: {
    label: 'En Descanso',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
};

export function PredioDetail({ predioId, onEdit }: PredioDetailProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('info');

  // Use the provided ID or fall back to store's active Predio
  // Note: This requires the parent to handle the case where there's no active Predio
  const effectivePredioId = predioId ?? 0;

  const { predio, isLoading: isLoadingPredio, error: errorPredio } = usePredio({
    id: effectivePredioId,
  });

  const { potreros, isLoading: isLoadingPotreros } = usePotreros({
    predioId: effectivePredioId,
  });

  const { lotes, isLoading: isLoadingLotes } = useLotes({
    predioId: effectivePredioId,
  });

  const { sectores, isLoading: isLoadingSectores } = useSectores({
    predioId: effectivePredioId,
  });

  const { grupos, isLoading: isLoadingGrupos } = useGrupos({
    predioId: effectivePredioId,
  });

  // Loading state
  if (isLoadingPredio && !predio) {
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

  // Error state
  if (errorPredio || !predio) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <p>No se pudo cargar la información del predio.</p>
        {errorPredio && (
          <p className="text-sm mt-2">{(errorPredio as Error).message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {predio.nombre}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {predio.municipio}, {predio.departamento}
            {predio.vereda && ` • Vereda ${predio.vereda}`}
          </p>
        </div>
        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(predio.id)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'info' && (
          <PredioInfoTab predio={predio} />
        )}
        {activeTab === 'potreros' && (
          <PotrerosTab potreros={potreros} isLoading={isLoadingPotreros} />
        )}
        {activeTab === 'sectores' && (
          <SectoresTab sectores={sectores} isLoading={isLoadingSectores} />
        )}
        {activeTab === 'lotes' && (
          <LotesTab lotes={lotes} isLoading={isLoadingLotes} />
        )}
        {activeTab === 'grupos' && (
          <GruposTab grupos={grupos} isLoading={isLoadingGrupos} />
        )}
      </div>
    </div>
  );
}

/**
 * Info tab — displays basic Predio information.
 */
function PredioInfoTab({ predio }: { predio: NonNullable<ReturnType<typeof usePredio>['predio']> }): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoCard title="Información General">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="text-gray-900 dark:text-gray-100 font-medium">{predio.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo</dt>
            <dd>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {TIPO_LABELS[predio.tipo] ??predio.tipo}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_LABELS[predio.estado]?.className ?? ''}`}>
                {ESTADO_LABELS[predio.estado]?.label ??predio.estado}
              </span>
            </dd>
          </div>
        </dl>
      </InfoCard>

      <InfoCard title="Ubicación">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Departamento</dt>
            <dd className="text-gray-900 dark:text-gray-100">{predio.departamento}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Municipio</dt>
            <dd className="text-gray-900 dark:text-gray-100">{predio.municipio}</dd>
          </div>
          {predio.vereda && (
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Vereda</dt>
              <dd className="text-gray-900 dark:text-gray-100">{predio.vereda}</dd>
            </div>
          )}
        </dl>
      </InfoCard>

      <InfoCard title="Dimensiones">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Hectáreas</dt>
            <dd className="text-gray-900 dark:text-gray-100 text-2xl font-semibold">
              {predio.hectares.toLocaleString('es-CO')}
            </dd>
          </div>
        </dl>
      </InfoCard>
    </div>
  );
}

/**
 * Potreros tab — displays list of paddocks.
 */
function PotrerosTab({
  potreros,
  isLoading,
}: {
  potreros: ReturnType<typeof usePotreros>['potreros'];
  isLoading: boolean;
}): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (potreros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <p>No hay potreros registrados para este predio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {potreros.map((potrero) => (
        <div
          key={potrero.id}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {potrero.nombre}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({potrero.codigo})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{potrero.hectares} ha</span>
              <span>•</span>
              <span>{potrero.tipoPasto}</span>
              <span>•</span>
              <span>Capacidad: {potrero.capacidadMaxima}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_LABELS[potrero.estado]?.className ?? ''}`}>
            {ESTADO_LABELS[potrero.estado]?.label ?? potrero.estado}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Sectores tab — displays list of administrative sectors.
 */
function SectoresTab({
  sectores,
  isLoading,
}: {
  sectores: ReturnType<typeof useSectores>['sectores'];
  isLoading: boolean;
}): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sectores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <p>No hay sectores registrados para este predio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sectores.map((sector) => (
        <div
          key={sector.id}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {sector.nombre}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({sector.codigo})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{sector.hectares} ha</span>
              <span>•</span>
              <span>{sector.tipoPasto}</span>
              <span>•</span>
              <span>Capacidad: {sector.capacidadMaxima}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_LABELS[sector.estado]?.className ?? ''}`}>
            {ESTADO_LABELS[sector.estado]?.label ?? sector.estado}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Lotes tab — displays list of production lots.
 */
function LotesTab({
  lotes,
  isLoading,
}: {
  lotes: ReturnType<typeof useLotes>['lotes'];
  isLoading: boolean;
}): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (lotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <p>No hay lotes registrados para este predio.</p>
      </div>
    );
  }

  const TIPO_LABELS_LOTES: Record<string, string> = {
    'producción': 'Producción',
    'levante': 'Levante',
    'engorde': 'Engorde',
    'cría': 'Cría',
  };

  return (
    <div className="space-y-4">
      {lotes.map((lote) => (
        <div
          key={lote.id}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {lote.nombre}
            </span>
            {lote.descripcion && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {lote.descripcion}
              </span>
            )}
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            {TIPO_LABELS_LOTES[lote.tipo] ?? lote.tipo}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Grupos tab — displays list of animal groups.
 */
function GruposTab({
  grupos,
  isLoading,
}: {
  grupos: ReturnType<typeof useGrupos>['grupos'];
  isLoading: boolean;
}): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (grupos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <p>No hay grupos registrados para este predio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grupos.map((grupo) => (
        <div
          key={grupo.id}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {grupo.nombre}
            </span>
            {grupo.descripcion && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {grupo.descripcion}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {grupo.animalCount} animales
            </span>
          </div>
        </div>
      ))}
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
