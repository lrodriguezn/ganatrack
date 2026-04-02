// apps/web/src/modules/predios/components/lotes-table.tsx
/**
 * LotesTable — DataTable wrapper for lotes list.
 *
 * Displays lotes with columns: Nombre, Descripción, Tipo, acciones.
 * Used within Predio detail tabs and global lotes page.
 */

'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/shared/components/ui/data-table';
import { Button } from '@/shared/components/ui/button';
import type { Lote, LoteTipo } from '@ganatrack/shared-types';

interface LotesTableProps {
  lotes: Lote[];
  isLoading?: boolean;
  onEdit?: (lote: Lote) => void;
  onDelete?: (lote: Lote) => void;
}

const TIPO_LABELS: Record<LoteTipo, string> = {
  producción: 'Producción',
  levante: 'Levante',
  engorde: 'Engorde',
  cría: 'Cría',
};

const TIPO_STYLES: Record<LoteTipo, string> = {
  producción: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  levante: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  engorde: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  cría: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export function LotesTable({
  lotes,
  isLoading = false,
  onEdit,
  onDelete,
}: LotesTableProps): JSX.Element {
  const columns: ColumnDef<Lote>[] = [
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
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipo = row.original.tipo;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TIPO_STYLES[tipo]}`}
          >
            {TIPO_LABELS[tipo]}
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
              aria-label="Editar lote"
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
              aria-label="Eliminar lote"
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
      data={lotes}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hay lotes registrados</p>
          <p className="text-sm">Agregue un lote para comenzar</p>
        </div>
      }
    />
  );
}
