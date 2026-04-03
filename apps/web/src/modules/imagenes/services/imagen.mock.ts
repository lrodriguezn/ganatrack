// apps/web/src/modules/imagenes/services/imagen.mock.ts
/**
 * Mock Imagen Service — simulates API for development.
 *
 * Provides mock image data with upload simulation (progress events).
 * Simulated delay: 300ms + progress simulation.
 */

import type {
  Imagen,
  ImagenFilters,
  EntidadTipo,
} from '../types/imagen.types';
import type { ImagenService } from './imagen.service';
import { ApiError } from '@/shared/lib/errors';

// ============================================================================
// Seed Data
// ============================================================================

const now = new Date().toISOString();

const SEED_IMAGENES: Imagen[] = [
  {
    id: 1, url: '/placeholder-product-1.jpg', thumbnailUrl: '/placeholder-product-1-thumb.jpg',
    entidadTipo: 'producto', entidadId: 1, filename: 'ivermectina-frasco.jpg',
    size: 245000, mimeType: 'image/jpeg', createdAt: now,
  },
  {
    id: 2, url: '/placeholder-product-2.jpg', thumbnailUrl: '/placeholder-product-2-thumb.jpg',
    entidadTipo: 'producto', entidadId: 1, filename: 'ivermectina-caja.jpg',
    size: 189000, mimeType: 'image/jpeg', createdAt: now,
  },
  {
    id: 3, url: '/placeholder-product-3.jpg', thumbnailUrl: '/placeholder-product-3-thumb.jpg',
    entidadTipo: 'producto', entidadId: 2, filename: 'mineral-premix.jpg',
    size: 312000, mimeType: 'image/jpeg', createdAt: now,
  },
];

let idCounter = SEED_IMAGENES.length + 1;

// ============================================================================
// Helpers
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// MockImagenService
// ============================================================================

export class MockImagenService implements ImagenService {
  async listByEntity(filters: ImagenFilters): Promise<Imagen[]> {
    await delay(300);
    return seedData.filter(
      img => img.entidadTipo === filters.entidadTipo && img.entidadId === filters.entidadId
    );
  }

  async getById(id: number): Promise<Imagen> {
    await delay(300);
    const imagen = seedData.find(img => img.id === id);
    if (!imagen) {
      throw new ApiError(404, 'NOT_FOUND', `Imagen con ID ${id} no encontrada`);
    }
    return { ...imagen };
  }

  async upload(
    file: File,
    entidadTipo: EntidadTipo,
    entidadId: number,
    onProgress?: (pct: number) => void,
    onXhr?: (xhr: XMLHttpRequest) => void,
  ): Promise<Imagen> {
    // Simulate upload progress
    for (let pct = 0; pct <= 100; pct += 20) {
      await delay(100);
      onProgress?.(pct);
    }

    // Use placeholder URLs instead of blob URLs to avoid memory leaks
    const newImagen: Imagen = {
      id: idCounter++,
      url: `/mock/imagenes/${file.name}`,
      thumbnailUrl: `/mock/imagenes/thumb_${file.name}`,
      entidadTipo,
      entidadId,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
    };
    seedData.push(newImagen);
    return { ...newImagen };
  }

  async delete(id: number): Promise<void> {
    await delay(300);
    const index = seedData.findIndex(img => img.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Imagen con ID ${id} no encontrada`);
    }
    seedData.splice(index, 1);
  }
}

// In-memory store
const seedData = SEED_IMAGENES.map(img => ({ ...img }));

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetImagenMock(): void {
  seedData.length = 0;
  seedData.push(...SEED_IMAGENES.map(img => ({ ...img })));
  idCounter = SEED_IMAGENES.length + 1;
}
