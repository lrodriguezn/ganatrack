// apps/web/src/modules/maestros/components/maestro-table.tsx
/**
 * MaestroTable — generic table component for any maestro entity.
 *
 * Accepts typed columns + data, adds "Acciones" column with
 * Editar (pencil) and Eliminar (trash) buttons.
 *
 * Usage:
 *   <MaestroTable
 *     columns={columns}
 *     data={items}
 *     isLoading={isLoading}
 *     onEdit={(item) => openEditModal(item)}
 *     onDelete={(item) => openDeleteModal(item)}
 *   />
 */

'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/ui/data-table';

interface MaestroTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

/**
 * Pencil icon (edit) — inline SVG, 16x16.
 */
function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/**
 * Trash icon (delete) — inline SVG, 16x16.
 */
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function MaestroTable<T>({
  columns,
  data,
  isLoading = false,
  onEdit,
  onDelete,
}: MaestroTableProps<T>): JSX.Element {
  const actionsColumn: ColumnDef<T> = {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-md px-2.5 py-1.5 text-sm font-medium
              text-blue-600 hover:bg-blue-50
              dark:text-blue-400 dark:hover:bg-blue-500/10
              transition-colors
            "
            aria-label="Editar"
          >
            <PencilIcon />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-md px-2.5 py-1.5 text-sm font-medium
              text-red-600 hover:bg-red-50
              dark:text-red-400 dark:hover:bg-red-500/10
              transition-colors
            "
            aria-label="Eliminar"
          >
            <TrashIcon />
            Eliminar
          </button>
        </div>
      );
    },
  };

  const allColumns = [...columns, actionsColumn];

  return (
    <DataTable
      columns={allColumns}
      data={data}
      isLoading={isLoading}
      emptyState={
        <p className="text-gray-500 dark:text-gray-400">No hay registros</p>
      }
    />
  );
}
