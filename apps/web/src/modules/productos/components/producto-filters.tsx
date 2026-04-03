// apps/web/src/modules/productos/components/producto-filters.tsx
/**
 * ProductoFilters — filter panel for producto list.
 *
 * Features:
 * - Search input with debounce
 * - Tipo filter (Medicamento, Suplemento, Insumo)
 * - Estado filter (Activo, Inactivo)
 *
 * @example
 * <ProductoFilters
 *   onSearch={(value) => setSearch(value)}
 *   onTipoChange={(key) => setTipoKey(key)}
 *   onEstadoChange={(key) => setEstadoKey(key)}
 * />
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

const TIPOS = [
  { key: 1, label: 'Medicamento' },
  { key: 2, label: 'Suplemento' },
  { key: 3, label: 'Insumo' },
];

const ESTADOS = [
  { key: 1, label: 'Activo' },
  { key: 2, label: 'Inactivo' },
];

interface ProductoFiltersProps {
  onSearch: (value: string) => void;
  onTipoChange: (key: number | undefined) => void;
  onEstadoChange: (key: number | undefined) => void;
  tipoKey?: number;
  estadoKey?: number;
}

export function ProductoFilters({
  onSearch,
  onTipoChange,
  onEstadoChange,
  tipoKey,
  estadoKey,
}: ProductoFiltersProps): JSX.Element {
  const [searchInput, setSearchInput] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearch]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />

        {/* Tipo filter */}
        <select
          value={tipoKey ?? ''}
          onChange={(e) =>
            onTipoChange(e.target.value ? Number(e.target.value) : undefined)
          }
          className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((tipo) => (
            <option key={tipo.key} value={tipo.key}>
              {tipo.label}
            </option>
          ))}
        </select>

        {/* Estado filter */}
        <select
          value={estadoKey ?? ''}
          onChange={(e) =>
            onEstadoChange(e.target.value ? Number(e.target.value) : undefined)
          }
          className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((estado) => (
            <option key={estado.key} value={estado.key}>
              {estado.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
