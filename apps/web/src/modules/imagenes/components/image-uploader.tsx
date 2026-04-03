// apps/web/src/modules/imagenes/components/image-uploader.tsx
/**
 * ImageUploader — orchestrator component for image uploads.
 *
 * Combines DropzoneArea + UploadProgress into a single flow:
 * 1. User drops/selects files → DropzoneArea validates
 * 2. Files are added to Zustand queue with FileReader previews
 * 3. User clicks "Subir" → useUploadImagen hook uploads each file
 * 4. Progress bars update in real-time via XHR upload events
 * 5. On success, gallery refreshes via query invalidation
 *
 * @example
 * <ImageUploader
 *   entidadTipo="producto"
 *   entidadId={productoId}
 *   onComplete={() => setShowUploader(false)}
 * />
 */

'use client';

import { useCallback, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { DropzoneArea } from './dropzone-area';
import { UploadProgress } from './upload-progress';
import { useImagenStore } from '@/store/imagen.store';
import { useUploadImagen } from '../hooks/use-upload-imagen';
import type { EntidadTipo } from '../types/imagen.types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

interface ImageUploaderProps {
  entidadTipo: EntidadTipo;
  entidadId: number;
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function ImageUploader({
  entidadTipo,
  entidadId,
  open,
  onClose,
  onComplete,
}: ImageUploaderProps): JSX.Element {
  const { queue, addFiles, removeFile, clearAll, clearCompleted } = useImagenStore();
  const [uploadStarted, setUploadStarted] = useState(false);

  const { uploadAll, uploadFile, cancelUpload, isUploading } = useUploadImagen({
    entidadTipo,
    entidadId,
    onComplete: () => {
      clearCompleted();
      onComplete?.();
      onClose();
    },
  });

  const handleFilesAccepted = useCallback(
    async (files: File[]) => {
      await addFiles(files);
      setUploadStarted(false);
    },
    [addFiles],
  );

  const handleUpload = useCallback(async () => {
    setUploadStarted(true);
    await uploadAll();
  }, [uploadAll]);

  const handleRetry = useCallback(
    (id: string) => {
      uploadFile(id);
    },
    [uploadFile],
  );

  const handleCancel = useCallback(
    (id: string) => {
      cancelUpload(id);
    },
    [cancelUpload],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile],
  );

  const handleClose = useCallback(() => {
    clearAll();
    setUploadStarted(false);
    onClose();
  }, [clearAll, onClose]);

  const hasPendingFiles = queue.some(
    (q) => q.status === 'pending' || q.status === 'error'
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Subir imágenes"
      description={`Agregar imágenes al ${entidadTipo === 'producto' ? 'producto' : 'animal'}`}
      size="lg"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          {queue.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={!hasPendingFiles || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Subiendo...' : `Subir ${queue.length} archivo${queue.length !== 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Dropzone — only show if no uploads in progress */}
        {!isUploading && (
          <DropzoneArea
            onFilesAccepted={handleFilesAccepted}
            maxSize={MAX_FILE_SIZE}
            acceptedTypes={ACCEPTED_TYPES}
            disabled={isUploading}
          />
        )}

        {/* Queue progress */}
        {queue.length > 0 && (
          <UploadProgress
            onRetry={handleRetry}
            onCancel={handleCancel}
            onRemove={handleRemove}
          />
        )}

        {/* Empty state */}
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Arrastra imágenes al área de arriba o haz clic para seleccionar
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
