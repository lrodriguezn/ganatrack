// apps/web/src/modules/imagenes/components/lightbox.tsx
/**
 * Lightbox — Radix Dialog-based full image viewer.
 *
 * Features:
 * - Full-resolution image display
 * - Navigation arrows (prev/next)
 * - Image counter (3/12)
 * - Keyboard support (← → Esc)
 * - Optional delete button with confirmation
 * - Reuses existing Modal component
 *
 * @example
 * <Lightbox
 *   imagenes={imagenes}
 *   currentIndex={2}
 *   onClose={() => setIndex(null)}
 *   onNavigate={(i) => setIndex(i)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import type { Imagen } from '../types/imagen.types';

interface LightboxProps {
  imagenes: Imagen[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDelete?: (id: number) => void;
}

export function Lightbox({
  imagenes,
  currentIndex,
  onClose,
  onNavigate,
  onDelete,
}: LightboxProps): JSX.Element {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentImage = imagenes[currentIndex];
  const hasMultiple = imagenes.length > 1;

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % imagenes.length;
    onNavigate(nextIndex);
  }, [currentIndex, imagenes.length, onNavigate]);

  const goPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + imagenes.length) % imagenes.length;
    onNavigate(prevIndex);
  }, [currentIndex, imagenes.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDeleteConfirm) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose, showDeleteConfirm]);

  const handleDelete = () => {
    if (currentImage && onDelete) {
      onDelete(currentImage.id);
      setShowDeleteConfirm(false);

      // Navigate to previous image if we deleted the last one
      if (currentIndex >= imagenes.length - 1 && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="xl"
      closeButton={false}
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentImage?.filename}
          </p>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      }
    >
      {/* Delete confirmation */}
      {showDeleteConfirm ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-center text-base font-medium text-gray-900 dark:text-gray-100">
            ¿Eliminar esta imagen?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta acción no se puede deshacer
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Image */}
          <div className="flex items-center justify-center min-h-[300px]">
            {currentImage && (
              <img
                src={currentImage.url}
                alt={currentImage.filename}
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
            )}
          </div>

          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Cerrar lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
              {currentIndex + 1} de {imagenes.length}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
