// apps/web/src/modules/productos/components/producto-detail.tsx
/**
 * ProductoDetail — detail view with inline ImageGallery.
 *
 * Features:
 * - Full product metadata display
 * - Stock indicator badge (green/red based on stockMinimo)
 * - Inline ImageGallery from modules/imagenes
 * - Action buttons: Edit, Delete
 *
 * @example
 * <ProductoDetail
 *   producto={data}
 *   onEdit={() => router.push(`/dashboard/maestros/productos/${id}/editar`)}
 *   onDelete={() => handleDelete(id)}
 * />
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Calendar, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/modal';
import { ImageGallery, ImageUploader } from '@/modules/imagenes';
import type { Producto } from '../types/producto.types';
import type { Imagen } from '@/modules/imagenes/types/imagen.types';

const TIPO_LABELS: Record<number, string> = {
  1: 'Medicamento',
  2: 'Suplemento',
  3: 'Insumo',
};

const ESTADO_LABELS: Record<number, string> = {
  1: 'Activo',
  2: 'Inactivo',
};

interface ProductoDetailProps {
  producto: Producto;
  imagenes?: Imagen[];
  isLoadingImages?: boolean;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function ProductoDetail({
  producto,
  imagenes = [],
  isLoadingImages = false,
  onDelete,
  isDeleting = false,
}: ProductoDetailProps): JSX.Element {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const threshold = producto.stockMinimo ?? 5;
  const isStockLow = producto.stockActual > 0 && producto.stockActual < threshold;
  const isOutOfStock = producto.stockActual === 0;

  const stockBadgeClass = isOutOfStock
    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
    : isStockLow
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
      : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';

  const estadoBadgeClass = producto.estadoKey === 1
    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
    : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {producto.nombre}
            </h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadgeClass}`}>
              {ESTADO_LABELS[producto.estadoKey] ?? 'Desconocido'}
            </span>
          </div>
          {producto.descripcion && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {producto.descripcion}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(`/dashboard/maestros/productos/${producto.id}/editar`)}
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            isLoading={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tipo */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Package className="h-4 w-4" />
            <span>Tipo</span>
          </div>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">
            {TIPO_LABELS[producto.tipoKey] ?? 'Desconocido'}
          </p>
        </div>

        {/* Stock */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-4 w-4" />
            <span>Stock</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-lg font-medium ${isOutOfStock || isStockLow ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {producto.stockActual} {producto.unidadMedida}
            </span>
            {(isStockLow || isOutOfStock) && (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass}`}>
                {isOutOfStock ? 'Agotado' : 'Stock bajo'}
              </span>
            )}
          </div>
          {producto.stockMinimo && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Mínimo: {producto.stockMinimo} {producto.unidadMedida}
            </p>
          )}
        </div>

        {/* Precio */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <DollarSign className="h-4 w-4" />
            <span>Precio Unitario</span>
          </div>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">
            {producto.precioUnitario
              ? `$${producto.precioUnitario.toLocaleString('es-CO')}`
              : 'No definido'}
          </p>
        </div>

        {/* Vencimiento */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Vencimiento</span>
          </div>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">
            {producto.fechaVencimiento
              ? new Date(producto.fechaVencimiento).toLocaleDateString('es-CO')
              : 'Sin fecha'}
          </p>
        </div>
      </div>

      {/* Images section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Imágenes
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUploader(true)}
          >
            Subir imagen
          </Button>
        </div>

        <ImageGallery
          imagenes={imagenes}
          isLoading={isLoadingImages}
          entidadTipo="producto"
          entidadId={producto.id}
          onUploadClick={() => setShowUploader(true)}
        />
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminar producto"
        description={`¿Está seguro que desea eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(producto.id);
                setShowDeleteConfirm(false);
              }}
              isLoading={isDeleting}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Todas las imágenes asociadas también serán eliminadas.
        </p>
      </Modal>

      {/* Image uploader modal */}
      <ImageUploader
        entidadTipo="producto"
        entidadId={producto.id}
        open={showUploader}
        onClose={() => setShowUploader(false)}
      />
    </div>
  );
}
