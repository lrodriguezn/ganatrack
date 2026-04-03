// apps/web/src/modules/animales/components/genealogia-tree.tsx
/**
 * GenealogiaTree — displays up to 3 generations of animal ancestry.
 *
 * - Registered ancestors (in DB) are links to /dashboard/animales/:id
 * - External ancestors just show text
 * - Shows padre and madre trees with gender indicators
 *
 * Usage:
 *   <GenealogiaTree genealogia={data} />
 */

'use client';

import Link from 'next/link';
import type { Genealogia } from '../types/animal.types';

interface GenealogiaTreeProps {
  genealogia: Genealogia;
}

export function GenealogiaTree({ genealogia }: GenealogiaTreeProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Current animal */}
      <div className="rounded-lg border-2 border-brand-200 dark:border-brand-500/50 bg-brand-50/30 dark:bg-brand-500/10 p-4">
        <AnimalNode animal={genealogia} isRoot />
      </div>

      {/* Parents */}
      {(genealogia.madre || genealogia.padre) && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Madre side */}
          {genealogia.madre && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-pink-600 dark:text-pink-400 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-pink-400" />
                Madre
              </h4>
              <div className="pl-4 border-l-2 border-pink-200 dark:border-pink-500/50">
                <GenealogiaSubTree animal={genealogia.madre} depth={1} />
              </div>
            </div>
          )}

          {/* Padre side */}
          {genealogia.padre && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-400" />
                Padre
              </h4>
              <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-500/50">
                <GenealogiaSubTree animal={genealogia.padre} depth={1} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* No parents message */}
      {!genealogia.madre && !genealogia.padre && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No hay información de genealogía registrada
        </p>
      )}
    </div>
  );
}

interface AnimalNodeProps {
  animal: Genealogia;
  isRoot?: boolean;
  depth?: number;
}

function AnimalNode({ animal, isRoot = false, depth = 0 }: AnimalNodeProps): JSX.Element {
  const isMale = animal.sexoKey === 0;
  const colorClass = isMale
    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/50'
    : 'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/50';

  return (
    <div
      className={`
        rounded-lg border p-3 ${colorClass}
        ${isRoot ? 'border-2' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {animal.codigo}
          </p>
          {animal.nombre && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {animal.nombre}
            </p>
          )}
          {animal.razaNombre && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {animal.razaNombre}
            </p>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {isMale ? '♂' : '♀'}
        </div>
      </div>
      {depth < 3 && (animal.madre || animal.padre) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3">
          {animal.madre && (
            <div className="space-y-1">
              <p className="text-xs text-pink-500">Madre:</p>
              <AnimalNode animal={animal.madre} depth={depth + 1} />
            </div>
          )}
          {animal.padre && (
            <div className="space-y-1">
              <p className="text-xs text-blue-500">Padre:</p>
              <AnimalNode animal={animal.padre} depth={depth + 1} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface GenealogiaSubTreeProps {
  animal: Genealogia;
  depth: number;
}

function GenealogiaSubTree({ animal, depth }: GenealogiaSubTreeProps): JSX.Element {
  if (depth >= 3) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {animal.codigo} {animal.nombre && `— ${animal.nombre}`}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimalNode animal={animal} depth={depth} />
      {(animal.madre || animal.padre) && (
        <div className="pl-4 grid grid-cols-1 gap-2">
          {animal.madre && (
            <div className="space-y-1">
              <p className="text-xs text-pink-500">Abuela materna:</p>
              <GenealogiaSubTree animal={animal.madre} depth={depth + 1} />
            </div>
          )}
          {animal.padre && (
            <div className="space-y-1">
              <p className="text-xs text-blue-500">Abuelo paterno:</p>
              <GenealogiaSubTree animal={animal.padre} depth={depth + 1} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}