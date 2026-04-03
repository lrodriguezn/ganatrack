// apps/web/src/modules/imagenes/types/imagen.types.ts
/**
 * Imagen types — image upload and gallery management.
 *
 * Images are associated polymorphically to entities (producto, animal)
 * via entidadTipo + entidadId.
 */

export type EntidadTipo = 'producto' | 'animal';

export interface Imagen {
  id: number;
  url: string;
  thumbnailUrl: string;
  entidadTipo: EntidadTipo;
  entidadId: number;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ImagenFilters {
  entidadTipo: EntidadTipo;
  entidadId: number;
}

// Upload queue state (Zustand)
export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error';

export interface UploadQueueItem {
  id: string;                    // crypto.randomUUID()
  file: File;
  preview: string;               // dataURL from FileReader
  status: UploadStatus;
  progress: number;              // 0-100
  error?: string;
  xhr?: XMLHttpRequest;          // reference for abort/cancel
}

// Gallery config
export interface GalleryConfig {
  columns?: number;              // default 3 (mobile: 2)
  maxPreviewSize?: number;       // bytes, default 5MB
  allowedTypes?: string[];       // default ['image/jpeg','image/png','image/webp']
}
