// apps/web/src/modules/imagenes/services/imagen.api.ts
/**
 * Real Imagen Service — production API calls.
 *
 * Upload uses XMLHttpRequest (not ky/fetch) because ky does NOT support
 * upload progress events. XHR's upload.onprogress is the only reliable
 * way to track multipart upload progress in browsers.
 *
 * All other endpoints use apiClient from @/shared/lib/api-client.
 */

import { apiClient, ApiError } from '@/shared/lib/api-client';
import type {
  Imagen,
  ImagenFilters,
  EntidadTipo,
} from '../types/imagen.types';
import type { ImagenService } from './imagen.service';

export class RealImagenService implements ImagenService {
  async listByEntity(filters: ImagenFilters): Promise<Imagen[]> {
    const params = new URLSearchParams();
    params.set('entidad_tipo', filters.entidadTipo);
    params.set('entidad_id', String(filters.entidadId));

    const response = await apiClient.get(`imagenes?${params.toString()}`);
    return response.json() as Promise<Imagen[]>;
  }

  async getById(id: number): Promise<Imagen> {
    const response = await apiClient.get(`imagenes/${id}`);
    return response.json() as Promise<Imagen>;
  }

  async upload(
    file: File,
    entidadTipo: EntidadTipo,
    entidadId: number,
    onProgress?: (pct: number) => void,
    onXhr?: (xhr: XMLHttpRequest) => void,
  ): Promise<Imagen> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entidad_tipo', entidadTipo);
    formData.append('entidad_id', String(entidadId));

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${baseUrl}/api/v1/imagenes/upload`;

    // Get auth token from the store for XHR
    const { useAuthStore } = await import('@/store/auth.store');
    const token = useAuthStore.getState().accessToken;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Notify caller of XHR reference so they can abort
      onXhr?.(xhr);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as Imagen);
          } catch {
            reject(new ApiError(xhr.status, 'PARSE_ERROR', 'Error al procesar respuesta del servidor'));
          }
        } else {
          let message = 'Error al subir imagen';
          try {
            const body = JSON.parse(xhr.responseText);
            message = body.message || message;
          } catch {
            // Use default message
          }
          reject(new ApiError(xhr.status, 'UPLOAD_FAILED', message));
        }
      };

      xhr.onerror = () => {
        reject(new ApiError(0, 'NETWORK_ERROR', 'Error de red al subir imagen'));
      };

      xhr.onabort = () => {
        reject(new ApiError(0, 'UPLOAD_ABORTED', 'Upload cancelado por el usuario'));
      };

      xhr.open('POST', url);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Get predio_id from store
      const { usePredioStore } = await import('@/store/predio.store');
      const predioActivo = usePredioStore.getState().predioActivo;
      if (predioActivo?.id) {
        xhr.setRequestHeader('X-Predio-Id', predioActivo.id);
      }

      xhr.setRequestHeader('Accept-Language', 'es');

      xhr.send(formData);
    });
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`imagenes/${id}`);
  }
}
