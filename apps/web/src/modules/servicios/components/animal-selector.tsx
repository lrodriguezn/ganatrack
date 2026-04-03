// apps/web/src/modules/servicios/components/animal-selector.tsx
/**
 * AnimalSelector — multi-select for choosing animals in service events.
 *
 * Filters by predio activo, sexo (hembras), and estado (activo).
 * Uses the existing animalService for fetching.
 *
 * Usage:
 *   <AnimalSelector predioId={1} selected={selected} onChange={setSelected} />
 */

'use client';

import { useState, useMemo } from 'react';
import { useAnimales } from '@/modules/animales';
import type { Animal } from '@/modules/animales';

interface AnimalSelectorProps {
  predioId: number;
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function AnimalSelector({ predioId, selected, onChange }: AnimalSelectorProps): JSX.Element {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAnimales({
    predioId,
    page: 1,
    limit: 100,
    sexoKey: 1, // Solo hembras
    estadoAnimalKey: 0, // Solo activas
    search: search || undefined,
  });

  const animals = data?.data ?? [];

  const toggleAnimal = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    onChange(animals.map((a) => a.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
          "
        />
        <button
          type="button"
          onClick={selectAll}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Todas
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Limpiar
        </button>
      </div>

      {/* Selected count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {selected.length} animal(es) seleccionado(s)
      </p>

      {/* Animal list */}
      <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">Cargando animales...</div>
        ) : animals.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No se encontraron hembras activas
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {animals.map((animal) => (
              <li
                key={animal.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleAnimal(animal.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAnimal(animal.id); }}}
                className={`
                  flex cursor-pointer items-center gap-3 px-4 py-3
                  transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                  ${selected.includes(animal.id) ? 'bg-blue-50 dark:bg-blue-500/10' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(animal.id)}
                  onChange={() => toggleAnimal(animal.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {animal.codigo}
                  </span>
                  {animal.nombre && (
                    <span className="ml-2 text-gray-500 dark:text-gray-400">{animal.nombre}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {animal.razaNombre ?? '-'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
