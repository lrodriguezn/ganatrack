// apps/web/src/modules/imagenes/components/image-thumbnail.tsx
/**
 * ImageThumbnail — single thumbnail with lazy load.
 *
 * Renders a 1:1 aspect ratio thumbnail with object-cover.
 * Clicking opens the lightbox.
 *
 * @example
 * <ImageThumbnail
 *   imagen={imagen}
 *   onClick={() => openLightbox(index)}
 *   onDelete={() => handleDelete(imagen.id)}
 * />
 */

'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import type { Imagen } from '../types/imagen.types';

interface ImageThumbnailProps {
  imagen: Imagen;
  onClick: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function ImageThumbnail({
  imagen,
  onClick,
  onDelete,
  showDelete = false,
}: ImageThumbnailProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver imagen: ${imagen.filename}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <span className="text-xs">Error al cargar</span>
        </div>
      ) : (
        <img
          src={imagen.thumbnailUrl || imagen.url}
          alt={imagen.filename}
          className="h-full w-full object-cover transition-opacity"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

      {/* Delete button */}
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          aria-label={`Eliminar imagen: ${imagen.filename}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Filename overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="truncate text-xs text-white">{imagen.filename}</p>
      </div>
    </div>
  );
}
