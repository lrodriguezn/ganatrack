// apps/web/src/modules/maestros/components/maestro-entity-page.tsx
/**
 * MaestroEntityPage — generic CRUD page for any maestro entity.
 *
 * Reduces boilerplate by providing a full CRUD UI:
 * - Header with title, description, and "New" button
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
  const { items, isLoading, create, update, remove, isCreating, isUpdating, isRemoving } =
    useMaestro(tipo);

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

  const handleFormSubmit = async (data: z.infer<T>) => {
    try {
      if (editItem) {
        await update({ id: editItem.id, data });
        addToast({ message: `${singularName} actualizado correctamente`, type: 'success' });
      } else {
        await create(data);
        addToast({ message: `${singularName} creado correctamente`, type: 'success' });
      }
      setIsFormOpen(false);
      setEditItem(null);
    } catch (err) {
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

      {/* Tabla */}
      <MaestroTable<MaestroBase>
        columns={columns}
        data={items}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
