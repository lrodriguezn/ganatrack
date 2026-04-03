// apps/web/src/modules/animales/components/animal-detail-tabs.tsx
/**
 * AnimalDetailTabs — 4-tab detail view for an animal.
 *
 * Tabs: Información General, Genealogía, Historial Salud, Servicios
 * URL synced: ?tab=informacion|genealogia|salud|servicios
 * Lazy loads tab content.
 *
 * Usage:
 *   <AnimalDetailTabs animalId={123} />
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { Animal } from '../types/animal.types';

interface AnimalDetailTabsProps {
  animalId: number;
  animal: Animal | undefined;
  isLoading: boolean;
}

type TabId = 'informacion' | 'genealogia' | 'salud' | 'servicios';

const TABS: { id: TabId; label: string }[] = [
  { id: 'informacion', label: 'Información General' },
  { id: 'genealogia', label: 'Genealogía' },
  { id: 'salud', label: 'Historial Salud' },
  { id: 'servicios', label: 'Servicios' },
];

export function AnimalDetailTabs({
  animalId,
  animal,
  isLoading,
}: AnimalDetailTabsProps): JSX.Element {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;
  const activeTab: TabId = TABS.some((t) => t.id === tabParam) ? tabParam! : 'informacion';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        <div className="h-64 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-4" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <a
                key={tab.id}
                href={`?tab=${tab.id}`}
                className={`
                  whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium
                  ${isActive
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'informacion' && (
          <AnimalInfoTab animal={animal} />
        )}
        {activeTab === 'genealogia' && (
          <AnimalGenealogiaTab animalId={animalId} />
        )}
        {activeTab === 'salud' && (
          <AnimalSaludTab animalId={animalId} />
        )}
        {activeTab === 'servicios' && (
          <AnimalServiciosTab animalId={animalId} />
        )}
      </div>
    </div>
  );
}

// Placeholder components for each tab
function AnimalInfoTab({ animal }: { animal: Animal | undefined }) {
  if (!animal) return <p className="text-gray-500">Animal no encontrado</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Código</h3>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {animal.codigo}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h3>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {animal.nombre ?? '-'}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Raza</h3>
        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
          {animal.razaNombre ?? '-'}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Potrero</h3>
        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
          {animal.potreroNombre ?? '-'}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha Nacimiento</h3>
        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
          {new Date(animal.fechaNacimiento).toLocaleDateString('es-CO')}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</h3>
        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
          {animal.sexoKey === 0 ? 'Macho' : 'Hembra'}
        </p>
      </div>
    </div>
  );
}

function AnimalGenealogiaTab({ animalId }: { animalId: number }) {
  return (
    <div className="text-gray-500">
      <p>Genealogía para animal ID: {animalId}</p>
      <p className="text-sm mt-2">Componente de árbol genealógico en desarrollo</p>
    </div>
  );
}

function AnimalSaludTab({ animalId }: { animalId: number }) {
  return (
    <div className="text-gray-500">
      <p>Historial de salud para animal ID: {animalId}</p>
      <p className="text-sm mt-2">Eventos de salud y tratamientos</p>
    </div>
  );
}

function AnimalServiciosTab({ animalId }: { animalId: number }) {
  return (
    <div className="text-gray-500">
      <p>Servicios para animal ID: {animalId}</p>
      <p className="text-sm mt-2">Palpaciones, inseminaciones y partos</p>
    </div>
  );
}