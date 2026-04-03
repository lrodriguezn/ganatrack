// apps/web/src/modules/imagenes/components/image-gallery.tsx
/**
 * ImageGallery — CSS Grid gallery with thumbnails.
 *
 * Features:
 * - Responsive CSS Grid (2 cols mobile, 3-4 cols desktop)
 * - Click thumbnail to open Lightbox
 * - Empty state with "Upload first image" button
 * - Optional "Upload more" button
 * - Optional delete capability per image
 *
 * @example
 * <ImageGallery
 *   imagenes={data ?? []}
 *   entidadTipo="producto"
 *   entidadId={productoId}
 *   onUploadClick={() => setShowUploader(true)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */

'use client';

import { useState } from 'react';
import { ImagePlus, ImageOff } from 'lucide-react';
import type { Imagen, EntidadTipo } from '../types/imagen.types';
import { ImageThumbnail } from './image-thumbnail';
import { Lightbox } from './lightbox';

const PAGINATION_THRESHOLD = 20;

interface ImageGalleryProps {
  imagenes: Imagen[];
  entidadTipo: EntidadTipo;
  entidadId: number;
  onUploadClick?: () => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export function ImageGallery({
  imagenes,
  entidadTipo,
  entidadId,
  onUploadClick,
  onDelete,
  isLoading = false,
}: ImageGalleryProps): JSX.Element {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayImages = showAll ? imagenes : imagenes.slice(0, PAGINATION_THRESHOLD);
  const hasMore = imagenes.length > PAGINATION_THRESHOLD;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  if (imagenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-12">
        <ImageOff className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-base font-medium text-gray-600 dark:text-gray-400">
          Sin imágenes
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
          Sube la primera imagen para este producto
        </p>
        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <ImagePlus className="h-4 w-4" />
            Subir primera imagen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {displayImages.map((imagen, index) => (
          <ImageThumbnail
            key={imagen.id}
            imagen={imagen}
            onClick={() => setLightboxIndex(index)}
            onDelete={onDelete ? () => onDelete(imagen.id) : undefined}
            showDelete={!!onDelete}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            Cargar más ({imagenes.length - PAGINATION_THRESHOLD} restantes)
          </button>
        </div>
      )}

      {onUploadClick && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ImagePlus className="h-4 w-4" />
            Subir más imágenes
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          imagenes={imagenes}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
          onDelete={onDelete ? (id) => onDelete(id) : undefined}
        />
      )}
    </div>
  );
}
