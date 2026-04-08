// apps/web/src/modules/predios/components/potreros-table.tsx
/**
 * PotrerosTable — DataTable wrapper for potreros list.
 *
 * Displays potreros with columns: Nombre, Hectáreas, Tipo Pasto, Capacidad, Estado, acciones.
 * Used within Predio detail tabs and global potreros page.
 */

'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/shared/components/ui/data-table';
import { Button } from '@/shared/components/ui/button';
import type { Potrero } from '@ganatrack/shared-types';

interface PotrerosTableProps {
  potreros: Potrero[];
  isLoading?: boolean;
  onEdit?: (potrero: Potrero) => void;
  onDelete?: (potrero: Potrero) => void;
}

export function PotrerosTable({
  potreros,
  isLoading = false,
  onEdit,
  onDelete,
}: PotrerosTableProps): JSX.Element {
  const columns: ColumnDef<Potrero>[] = [
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
      accessorKey: 'areaHectareas',
      header: 'Hectáreas',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.areaHectareas.toFixed(1)} ha
        </span>
      ),
    },
    {
      accessorKey: 'tipoPasto',
      header: 'Tipo Pasto',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.tipoPasto}
        </span>
      ),
    },
    {
      accessorKey: 'capacidadMaxima',
      header: 'Capacidad',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.capacidadMaxima} animales
        </span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.original.estado;
        const isActivo = estado === 'activo';
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActivo
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {isActivo ? 'Activo' : 'En descanso'}
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
              className="h-8 w-8 p-0"
              aria-label="Editar potrero"
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
              aria-label="Eliminar potrero"
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
      data={potreros}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hay potreros registrados</p>
          <p className="text-sm">Agregue un potrero para comenzar</p>
        </div>
      }
    />
  );
}
