// apps/web/src/modules/predios/components/grupos-table.tsx
/**
 * GruposTable — DataTable wrapper for grupos list.
 *
 * Displays grupos with columns: Nombre, Descripción, Animal Count, acciones.
 * Used within Predio detail tabs and global grupos page.
 */

'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Users } from 'lucide-react';
import { DataTable } from '@/shared/components/ui/data-table';
import { Button } from '@/shared/components/ui/button';
import type { Grupo } from '@ganatrack/shared-types';

interface GruposTableProps {
  grupos: Grupo[];
  isLoading?: boolean;
  onEdit?: (grupo: Grupo) => void;
  onDelete?: (grupo: Grupo) => void;
}

export function GruposTable({
  grupos,
  isLoading = false,
  onEdit,
  onDelete,
}: GruposTableProps): JSX.Element {
  const columns: ColumnDef<Grupo>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.nombre}
        </div>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.descripcion || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'animalCount',
      header: 'Animales',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{row.original.animalCount}</span>
        </div>
      ),
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
              className="h-8 w-8 p-0"
              aria-label="Editar grupo"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/10"
              aria-label="Eliminar grupo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={grupos}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hay grupos registrados</p>
          <p className="text-sm">Agregue un grupo para comenzar</p>
        </div>
      }
    />
  );
}
