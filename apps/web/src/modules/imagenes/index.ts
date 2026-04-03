// apps/web/src/modules/imagenes/index.ts
/**
 * Imagen Module — barrel export.
 */

// Types
export type {
  Imagen,
  ImagenFilters,
  EntidadTipo,
  UploadQueueItem,
  UploadStatus,
  GalleryConfig,
} from './types/imagen.types';

// Services
export { imagenService } from './services';
export type { ImagenService } from './services';

// Hooks
export { useImagenes, useUploadImagen, useDeleteImagen } from './hooks';

// Components
export { DropzoneArea } from './components/dropzone-area';
export { ImageUploader } from './components/image-uploader';
export { ImageGallery } from './components/image-gallery';
export { ImageThumbnail } from './components/image-thumbnail';
export { Lightbox } from './components/lightbox';
export { UploadProgress } from './components/upload-progress';
