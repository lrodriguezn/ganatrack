// apps/web/src/modules/predios/components/predio-table.tsx
/**
 * PredioTable — DataTable wrapper for Predios list.
 *
 * Displays a paginated, searchable list of predios with columns:
 * Nombre, Departamento, Municipio, Hectáreas, Tipo, Acciones.
 *
 * Features:
 * - Server-side pagination (delegates to parent via onPaginationChange)
 * - Client-side search filtering
 * - Edit/Delete action buttons per row
 * - Loading and empty states
 *
 * Usage:
 *   <PredioTable
 *     predios={data}
 *     isLoading={isLoading}
 *     pageCount={totalPages}
 *     totalRows={totalCount}
 *     onPaginationChange={handlePagination}
 *     onEdit={handleEdit}
 *     onDelete={handleDelete}
 *     searchValue={search}
 *     onSearchChange={setSearch}
 *   />
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/shared/components/ui/data-table';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { Predio } from '@ganatrack/shared-types';

interface PredioTableProps {
  predios: Predio[];
  isLoading?: boolean;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalRows?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  onEdit?: (predio: Predio) => void;
  onDelete?: (predio: Predio) => void;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
}

export function PredioTable({
  predios,
  isLoading = false,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  totalRows,
  onPaginationChange,
  onEdit,
  onDelete,
  searchValue = '',
  onSearchChange,
}: PredioTableProps): JSX.Element {
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  // Filter predios by search term (client-side)
  const filteredPredios = useMemo(() => {
    if (!localSearch.trim()) return predios;
    const searchLower = localSearch.toLowerCase().trim();
    return predios.filter((predio) =>
      predio.nombre.toLowerCase().includes(searchLower),
    );
  }, [predios, localSearch]);

  // Calculate pagination info
  const displayedPredios = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredPredios.slice(start, start + pageSize);
  }, [filteredPredios, pageIndex, pageSize]);

  const columns: ColumnDef<Predio>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.nombre}
        </span>
      ),
    },
    {
      accessorKey: 'departamento',
      header: 'Departamento',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.departamento}
        </span>
      ),
    },
    {
      accessorKey: 'municipio',
      header: 'Municipio',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.municipio}
        </span>
      ),
    },
    {
      accessorKey: 'hectares',
      header: 'Hectáreas',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.hectares.toLocaleString('es-CO')}
        </span>
      ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipoLabels: Record<string, string> = {
          'lechería': 'Lechería',
          'cría': 'Cría',
          'doble propósito': 'Doble Propósito',
          'engorde': 'Engorde',
        };
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {tipoLabels[row.original.tipo] ?? row.original.tipo}
          </span>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
              aria-label="Editar"
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              aria-label="Eliminar"
              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    onPaginationChange?.(newPageIndex, newPageSize);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={displayedPredios}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalRows={totalRows ?? filteredPredios.length}
        onPaginationChange={({ pageIndex: pi, pageSize: ps }) =>
          handlePaginationChange(pi, ps)
        }
        isLoading={isLoading}
        emptyState={
          localSearch.trim() ? (
            <p>No se encontraron predios con "{localSearch}"</p>
          ) : (
            <p>No hay predios registrados</p>
          )
        }
      />
    </div>
  );
}
