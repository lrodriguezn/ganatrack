// apps/web/src/modules/imagenes/hooks/use-upload-imagen.ts
/**
 * useUploadImagen — mutation hook for uploading images with progress tracking.
 *
 * Integrates with the Zustand imagen store to track upload queue state.
 * Each file is uploaded individually via XMLHttpRequest for progress events.
 *
 * @example
 * const { uploadFile, isUploading } = useUploadImagen({
 *   entidadTipo: 'producto',
 *   entidadId: 123,
 *   onComplete: () => { /* refresh gallery *\/ },
 * });
 *
 * // Upload files from the queue
 * await uploadFile(queueItem);
 */

'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { imagenService } from '../services';
import { useImagenStore } from '@/store/imagen.store';
import { queryKeys } from '@/shared/lib/query-keys';
import type { EntidadTipo } from '../types/imagen.types';

interface UseUploadImagenOptions {
  entidadTipo: EntidadTipo;
  entidadId: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useUploadImagen({
  entidadTipo,
  entidadId,
  onComplete,
  onError,
}: UseUploadImagenOptions) {
  const queryClient = useQueryClient();
  const { queue, updateProgress, markComplete, markError, setXhr } = useImagenStore();
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (itemId: string) => {
      const item = queue.find((q) => q.id === itemId);
      if (!item) return;

      setIsUploading(true);

      try {
        await imagenService.upload(
          item.file,
          entidadTipo,
          entidadId,
          (pct) => updateProgress(itemId, pct),
          (xhr) => setXhr(itemId, xhr),
        );

        markComplete(itemId);

        // Invalidate the image list for this entity
        queryClient.invalidateQueries({
          queryKey: queryKeys.imagenes.byEntity(entidadTipo, entidadId),
        });

        // Don't call onComplete here — it's a batch-level callback.
        // onComplete is called by uploadAll when ALL files finish.
        // For single-file upload, the caller can react to markComplete in the store.
      } catch (error) {
        const err = error as Error;
        markError(itemId, err.message);
        onError?.(err);
      } finally {
        setIsUploading(false);
      }
    },
    [queue, entidadTipo, entidadId, updateProgress, markComplete, markError, setXhr, queryClient, onError],
  );

  const uploadAll = useCallback(async () => {
    const pendingItems = queue.filter((q) => q.status === 'pending' || q.status === 'error');

    if (pendingItems.length === 0) return;

    setIsUploading(true);

    let anyFailed = false;

    for (const item of pendingItems) {
      try {
        await imagenService.upload(
          item.file,
          entidadTipo,
          entidadId,
          (pct) => updateProgress(item.id, pct),
          (xhr) => setXhr(item.id, xhr),
        );

        markComplete(item.id);
        queryClient.invalidateQueries({
          queryKey: queryKeys.imagenes.byEntity(entidadTipo, entidadId),
        });
      } catch (error) {
        const err = error as Error;
        markError(item.id, err.message);
        onError?.(err);
        anyFailed = true;
      }
    }

    setIsUploading(false);

    // Only call onComplete if all uploads succeeded
    if (!anyFailed) {
      onComplete?.();
    }
  }, [queue, entidadTipo, entidadId, updateProgress, markComplete, markError, setXhr, queryClient, onComplete, onError]);

  const cancelUpload = useCallback(
    (itemId: string) => {
      const item = queue.find((q) => q.id === itemId);
      if (item?.xhr) {
        item.xhr.abort();
      }
    },
    [queue],
  );

  return {
    uploadFile,
    uploadAll,
    cancelUpload,
    isUploading,
  };
}
