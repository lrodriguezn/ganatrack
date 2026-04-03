// apps/web/src/modules/imagenes/components/dropzone-area.tsx
/**
 * DropzoneArea — react-dropzone wrapper with validation.
 *
 * Features:
 * - Drag & drop with visual feedback
 * - Click to browse files
 * - File type validation (JPEG, PNG, WebP)
 * - File size validation (default max 5MB)
 * - Inline error messages for rejected files
 *
 * @example
 * <DropzoneArea
 *   onFilesAccepted={(files) => handleFiles(files)}
 *   maxSize={5 * 1024 * 1024}
 *   accept={['image/jpeg', 'image/png', 'image/webp']}
 * />
 */

'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const DEFAULT_ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface DropzoneAreaProps {
  onFilesAccepted: (files: File[]) => void;
  maxSize?: number;
  acceptedTypes?: Record<string, string[]>;
  disabled?: boolean;
  className?: string;
}

export function DropzoneArea({
  onFilesAccepted,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className,
}: DropzoneAreaProps): JSX.Element {
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const newErrors: string[] = [];

      for (const rejection of fileRejections) {
        const file = rejection.file;
        const error = rejection.errors[0];

        if (error.code === 'file-too-large') {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
          newErrors.push(
            `Archivo muy grande (${sizeMB}MB). Máximo ${maxMB}MB.`
          );
        } else if (error.code === 'file-invalid-type') {
          newErrors.push(
            `Formato no soportado para "${file.name}". Usa JPEG, PNG o WebP.`
          );
        } else {
          newErrors.push(`Error con "${file.name}": ${error.message}`);
        }
      }

      setErrors(newErrors);

      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
    },
    [onFilesAccepted, maxSize],
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const hasError = isDragReject || errors.length > 0;

  const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);

  return (
    <div className={twMerge('space-y-2', className)}>
      <div
        {...getRootProps()}
        className={twMerge(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          'hover:border-brand-400 hover:bg-brand-50/50 dark:hover:border-brand-500 dark:hover:bg-brand-500/5',
          disabled && 'cursor-not-allowed opacity-50 pointer-events-none',
          isDragActive && 'border-brand-500 bg-brand-50 dark:bg-brand-500/10',
          hasError && 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-500/10',
          !isDragActive && !hasError && 'border-gray-300 dark:border-gray-600',
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          {isDragActive ? (
            <>
              <ImageIcon className="h-12 w-12 text-brand-500 mb-3" />
              <p className="text-lg font-medium text-brand-600 dark:text-brand-400">
                Suelta las imágenes aquí
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                Arrastra imágenes aquí o{' '}
                <span className="text-brand-600 dark:text-brand-400 underline">
                  selecciona archivos
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                JPEG, PNG o WebP — Máximo {maxSizeMB}MB por archivo
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
            >
              <X className="h-4 w-4 flex-shrink-0" />
              <span>{err}</span>
              <button
                type="button"
                onClick={() => setErrors((prev) => prev.filter((_, idx) => idx !== i))}
                className="ml-auto text-red-400 hover:text-red-600"
                aria-label="Cerrar error"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
