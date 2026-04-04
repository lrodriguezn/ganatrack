// apps/web/src/modules/animales/components/animal-table.tsx
/**
 * AnimalTable — displays animals with pagination, sorting, and row selection.
 *
 * Columns: código, nombre, raza, sexo, potrero, estado, fechaNacimiento, acciones
 * Supports row selection for bulk actions.
 * Row click navigates to detail page.
 *
 * Usage:
 *   <AnimalTable
 *     animals={data?.data ?? []}
 *     isLoading={isLoading}
 *     pageIndex={page}
 *     pageSize={limit}
 *     totalRows={data?.total ?? 0}
 *     pageCount={data?.totalPages ?? 1}
 *     onPaginationChange={handlePaginationChange}
 *     onRowClick={handleRowClick}
 *     rowSelection={rowSelection}
 *     onRowSelectionChange={setRowSelection}
 *   />
 */

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import type { Animal } from '../types/animal.types';
import { DataTable } from '@/shared/components/ui/data-table';
import { SexoEnum, EstadoAnimalEnum } from '@ganatrack/shared-types';

// Sexo label helper
const sexoLabel = (key: number): string => {
  switch (key) {
    case SexoEnum.MASCULINO:
      return 'Macho';
    case SexoEnum.FEMENINO:
      return 'Hembra';
    default:
      return 'Desconocido';
  }
};

// Estado animal label helper
const estadoLabel = (key: number): string => {
  switch (key) {
    case EstadoAnimalEnum.ACTIVO:
      return 'Activo';
    case EstadoAnimalEnum.VENDIDO:
      return 'Vendido';
    case EstadoAnimalEnum.MUERTO:
      return 'Muerto';
    default:
      return 'Desconocido';
  }
};

// Sexo badge color
const sexoBadgeColor = (key: number): string => {
  switch (key) {
    case SexoEnum.MASCULINO:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
    case SexoEnum.FEMENINO:
      return 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
  }
};

// Estado badge color
const estadoBadgeColor = (key: number): string => {
  switch (key) {
    case EstadoAnimalEnum.ACTIVO:
      return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
    case EstadoAnimalEnum.VENDIDO:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300';
    case EstadoAnimalEnum.MUERTO:
      return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
  }
};

interface AnimalTableProps {
  animals: Animal[];
  isLoading?: boolean;
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  pageCount: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onRowClick?: (animal: Animal) => void;
  onDelete?: (animal: Animal) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
}

export function AnimalTable({
  animals,
  isLoading = false,
  pageIndex,
  pageSize,
  totalRows,
  pageCount,
  onPaginationChange,
  onRowClick,
  onDelete,
  rowSelection,
  onRowSelectionChange,
}: AnimalTableProps): JSX.Element {
  const router = useRouter();

  const columns: ColumnDef<Animal>[] = useMemo(() => [
    {
      id: 'codigo',
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.codigo}
        </span>
      ),
    },
    {
      id: 'nombre',
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.nombre ?? '-'}
        </span>
      ),
    },
    {
      id: 'raza',
      accessorKey: 'razaNombre',
      header: 'Raza',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.razaNombre ?? '-'}
        </span>
      ),
    },
    {
      id: 'sexo',
      accessorKey: 'sexoKey',
      header: 'Sexo',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${sexoBadgeColor(row.original.sexoKey)}`}
        >
          {sexoLabel(row.original.sexoKey)}
        </span>
      ),
    },
    {
      id: 'potrero',
      accessorKey: 'potreroNombre',
      header: 'Potrero',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.potreroNombre ?? '-'}
        </span>
      ),
    },
    {
      id: 'estado',
      accessorKey: 'estadoAnimalKey',
      header: 'Estado',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadgeColor(row.original.estadoAnimalKey)}`}
        >
          {estadoLabel(row.original.estadoAnimalKey)}
        </span>
      ),
    },
    {
      id: 'fechaNacimiento',
      accessorKey: 'fechaNacimiento',
      header: 'Fecha Nac.',
      cell: ({ row }) => {
        if (!row.original.fechaNacimiento) {
          return <span className="text-gray-400 dark:text-gray-500">—</span>;
        }
        const date = new Date(row.original.fechaNacimiento);
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {date.toLocaleDateString('es-CO')}
          </span>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/animales/${row.original.id}/editar`); }}
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-md px-2.5 py-1.5 text-sm font-medium
              text-blue-600 hover:bg-blue-50
              dark:text-blue-400 dark:hover:bg-blue-500/10
              transition-colors
            "
            aria-label={`Editar ${row.original.nombre || row.original.codigo}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/dashboard/animales/${row.original.id}/editar`);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete?.(row.original); }}
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-md px-2.5 py-1.5 text-sm font-medium
              text-red-600 hover:bg-red-50
              dark:text-red-400 dark:hover:bg-red-500/10
              transition-colors
            "
            aria-label={`Eliminar ${row.original.nombre || row.original.codigo}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDelete?.(row.original);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Eliminar
          </button>
        </div>
      ),
    },
  ], [router, onDelete]);

  const handleRowClick = (animal: Animal) => {
    if (onRowClick) {
      onRowClick(animal);
    } else {
      router.push(`/dashboard/animales/${animal.id}`);
    }
  };

  return (
    <DataTable
      columns={columns}
      data={animals}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      isLoading={isLoading}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hay animales registrados</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Crea tu primer animal para comenzar
          </p>
        </div>
      }
    />
  );
}