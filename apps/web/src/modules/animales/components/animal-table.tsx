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
  rowSelection,
  onRowSelectionChange,
}: AnimalTableProps): JSX.Element {
  const router = useRouter();

  const columns: ColumnDef<Animal>[] = [
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
        const date = new Date(row.original.fechaNacimiento);
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {date.toLocaleDateString('es-CO')}
          </span>
        );
      },
    },
  ];

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