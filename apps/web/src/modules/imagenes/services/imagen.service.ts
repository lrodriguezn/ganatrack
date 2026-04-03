// apps/web/src/modules/imagenes/services/imagen.service.ts
/**
 * ImagenService — interface + factory.
 *
 * Swaps between MockImagenService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealImagenService (production).
 *
 * Base API path: /imagenes
 */

import type {
  Imagen,
  ImagenFilters,
  EntidadTipo,
} from '../types/imagen.types';

// ============================================================================
// ImagenService Interface
// ============================================================================

export interface ImagenService {
  listByEntity(filters: ImagenFilters): Promise<Imagen[]>;
  getById(id: number): Promise<Imagen>;
  upload(
    file: File,
    entidadTipo: EntidadTipo,
    entidadId: number,
    onProgress?: (pct: number) => void,
    onXhr?: (xhr: XMLHttpRequest) => void,
  ): Promise<Imagen>;
  delete(id: number): Promise<void>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): ImagenService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockImagenService } = require('./imagen.mock');
  return new MockImagenService();
}

function createRealService(): ImagenService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealImagenService } = require('./imagen.api');
  return new RealImagenService();
}

/**
 * Imagen service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Defaults to real (production) when env var is not set.
 */
export const imagenService: ImagenService = USE_MOCKS
  ? createMockService()
  : createRealService();
