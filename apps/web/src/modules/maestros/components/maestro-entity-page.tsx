// apps/web/src/modules/maestros/components/maestro-entity-page.tsx
/**
 * MaestroEntityPage — generic CRUD page for any maestro entity.
 *
 * Reduces boilerplate by providing a full CRUD UI:
 * - Header with title, description, and "New" button
 * - Search bar and pagination controls
 * - Data table with edit/delete actions
 * - Form modal for create/edit
 * - Delete confirmation modal
 *
 * All 8 maestro entity pages are thin wrappers around this component.
 *
 * Usage:
 *   <MaestroEntityPage
 *     tipo="veterinarios"
 *     title="Veterinarios"
 *     description="Gestiona los veterinarios..."
 *     singularName="Veterinario"
 *     fields={VETERINARIO_FIELDS}
 *     columns={VETERINARIO_COLUMNS}
 *     schema={VeterinarioSchema}
 *   />
 */

'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMaestro } from '@/modules/maestros/hooks';
import { MaestroTable, MaestroForm, MaestroDeleteModal } from '@/modules/maestros/components';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { useUiStore } from '@/store/ui.store';
import { ApiError } from '@/shared/lib/errors';
import type { MaestroTipo, MaestroBase, MaestroFieldDef } from '@/modules/maestros/types/maestro.types';
import type { z } from 'zod';

interface MaestroEntityPageProps<T extends z.ZodSchema> {
  tipo: MaestroTipo;
  title: string;
  description: string;
  singularName: string;
  fields: MaestroFieldDef[];
  columns: ColumnDef<MaestroBase>[];
  schema: T;
}

export function MaestroEntityPage<T extends z.ZodSchema>({
  tipo,
  title,
  description,
  singularName,
  fields,
  columns,
  schema,
}: MaestroEntityPageProps<T>): JSX.Element {
  const [searchInput, setSearchInput] = useState('');
  const {
    items,
    isLoading,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isRemoving,
    page,
    limit,
    total,
    setPage,
    setLimit,
    setSearch,
  } = useMaestro(tipo);

  const addToast = useUiStore((s) => s.addToast);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<MaestroBase | null>(null);
  const [deleteItem, setDeleteItem] = useState<MaestroBase | null>(null);

  const handleNew = () => {
    setEditItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: MaestroBase) => {
    setEditItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: MaestroBase) => {
    setDeleteItem(item);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchChange = (e: any) => {
    setSearchInput(e.target.value);
  };

  const handleLimitChange = (e: any) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleFormSubmit = async (data: z.infer<T>) => {
    console.log('[MaestroEntityPage] handleFormSubmit called with data:', data);
    console.log('[MaestroEntityPage] editItem:', editItem);
    try {
      if (editItem) {
        await update({ id: editItem.id, data });
        addToast({ message: `${singularName} actualizado correctamente`, type: 'success' });
      } else {
        console.log('[MaestroEntityPage] Calling create with:', data);
        await create(data);
        addToast({ message: `${singularName} creado correctamente`, type: 'success' });
      }
      setIsFormOpen(false);
      setEditItem(null);
    } catch (err) {
      console.log('[MaestroEntityPage] Error caught:', err);
      if (ApiError.isApiError(err)) {
        addToast({ message: err.message, type: 'error' });
      } else if (err instanceof Error) {
        addToast({ message: `Error al guardar: ${err.message}`, type: 'error' });
      } else {
        addToast({ message: `Error al guardar el ${singularName.toLowerCase()}`, type: 'error' });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await remove(deleteItem.id);
      addToast({ message: `${singularName} eliminado correctamente`, type: 'success' });
      setDeleteItem(null);
    } catch (err) {
      if (ApiError.isApiError(err)) {
        addToast({ message: err.message, type: 'error' });
      } else if (err instanceof Error) {
        addToast({ message: `Error al eliminar: ${err.message}`, type: 'error' });
      } else {
        addToast({ message: `Error al eliminar el ${singularName.toLowerCase()}`, type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <Button onClick={handleNew}>
          + Nuevo {singularName}
        </Button>
      </div>

      {/* Barra de búsqueda y controles */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre..."
            className="
              w-full rounded-md border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800 px-3 py-2 text-sm
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </form>
        <select
          value={limit}
          onChange={handleLimitChange}
          className="
            rounded-md border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 px-3 py-2 text-sm
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        >
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
      </div>

      {/* Tabla */}
      <MaestroTable<MaestroBase>
        columns={columns}
        data={items}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Mostrando {items.length} de {total} registros
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="
              rounded-md px-3 py-1.5 text-sm font-medium
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors
            "
          >
            Anterior
          </button>
          <span className="px-2">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="
              rounded-md px-3 py-1.5 text-sm font-medium
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors
            "
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal formulario */}
      <Modal
        open={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditItem(null); }}
        title={editItem ? `Editar ${singularName}` : `Nuevo ${singularName}`}
        size="md"
      >
        <MaestroForm
          fields={fields}
          schema={schema}
          defaultValues={editItem ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditItem(null); }}
          isLoading={isCreating || isUpdating}
        />
      </Modal>

      {/* Modal confirmación eliminación */}
      <MaestroDeleteModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteItem?.nombre ?? ''}
        isLoading={isRemoving}
      />
    </div>
  );
}
