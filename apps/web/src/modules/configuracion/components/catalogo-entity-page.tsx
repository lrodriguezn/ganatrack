// apps/web/src/modules/configuracion/components/catalogo-entity-page.tsx
/**
 * CatalogoEntityPage — generic CRUD page for any catalog entity.
 *
 * Provides a full CRUD UI:
 * - Header with title, description, and "New" button
 * - Data table with edit/delete actions
 * - Form modal for create/edit
 * - Delete confirmation modal
 *
 * Mirrors MaestroEntityPage but uses useCatalogo hook.
 *
 * Usage:
 *   <CatalogoEntityPage
 *     tipo="razas"
 *     config={CATALOGO_CONFIGS.razas}
 *   />
 */

'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useCatalogo } from '@/modules/configuracion/hooks';
import { MaestroTable, MaestroForm, MaestroDeleteModal } from '@/modules/maestros/components';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { useUiStore } from '@/store/ui.store';
import { ApiError } from '@/shared/lib/errors';
import type { CatalogoTipo, CatalogoBase, CatalogoConfig } from '../types/catalogo.types';
import { CatalogoSchemas } from '../types/catalogo.types';

interface CatalogoEntityPageProps {
  tipo: CatalogoTipo;
  config: CatalogoConfig;
}

export function CatalogoEntityPage({
  tipo,
  config,
}: CatalogoEntityPageProps): JSX.Element {
  const { items, isLoading, create, update, remove, isCreating, isUpdating, isRemoving } =
    useCatalogo(tipo);

  const addToast = useUiStore((s) => s.addToast);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogoBase | null>(null);
  const [deleteItem, setDeleteItem] = useState<CatalogoBase | null>(null);

  const columns: ColumnDef<CatalogoBase>[] = [
    ...config.columns.map((col) => ({
      accessorKey: col,
      header: col === 'nombre' ? 'Nombre'
        : col === 'codigo' ? 'Código'
        : col === 'descripcion' ? 'Descripción'
        : col,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const value = getValue() as string | undefined;
        return value || '—';
      },
    })),
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          getValue()
            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {getValue() ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  const schema = CatalogoSchemas[tipo];

  const handleNew = () => {
    setEditItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: CatalogoBase) => {
    setEditItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: CatalogoBase) => {
    setDeleteItem(item);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      if (editItem) {
        await update({ id: editItem.id, data });
        addToast({ message: `${config.singularName} actualizado correctamente`, type: 'success' });
      } else {
        await create(data);
        addToast({ message: `${config.singularName} creado correctamente`, type: 'success' });
      }
      setIsFormOpen(false);
      setEditItem(null);
    } catch (err) {
      if (ApiError.isApiError(err)) {
        addToast({ message: err.message, type: 'error' });
      } else if (err instanceof Error) {
        addToast({ message: `Error al guardar: ${err.message}`, type: 'error' });
      } else {
        addToast({ message: `Error al guardar el ${config.singularName.toLowerCase()}`, type: 'error' });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await remove(deleteItem.id);
      addToast({ message: `${config.singularName} eliminado correctamente`, type: 'success' });
      setDeleteItem(null);
    } catch (err) {
      if (ApiError.isApiError(err)) {
        addToast({ message: err.message, type: 'error' });
      } else if (err instanceof Error) {
        addToast({ message: `Error al eliminar: ${err.message}`, type: 'error' });
      } else {
        addToast({ message: `Error al eliminar el ${config.singularName.toLowerCase()}`, type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {config.title}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {config.description}
          </p>
        </div>
        <Button onClick={handleNew}>
          + Nueva {config.singularName}
        </Button>
      </div>

      {/* Tabla */}
      <MaestroTable<CatalogoBase>
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
        title={editItem ? `Editar ${config.singularName}` : `Nueva ${config.singularName}`}
        size="md"
      >
        <MaestroForm
          fields={config.fields}
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
