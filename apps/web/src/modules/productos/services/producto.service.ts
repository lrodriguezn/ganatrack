// apps/web/src/modules/productos/services/producto.service.ts
/**
 * ProductoService — interface + factory.
 *
 * Swaps between MockProductoService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealProductoService (production).
 *
 * Base API path: /productos
 */

import type {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  PaginatedProductos,
  ProductoFilters,
} from '../types/producto.types';

// ============================================================================
// ProductoService Interface
// ============================================================================

export interface ProductoService {
  getAll(filters: ProductoFilters): Promise<PaginatedProductos>;
  getById(id: number): Promise<Producto>;
  create(data: CreateProductoDto): Promise<Producto>;
  update(id: number, data: UpdateProductoDto): Promise<Producto>;
  delete(id: number): Promise<void>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): ProductoService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockProductoService } = require('./producto.mock');
  return new MockProductoService();
}

function createRealService(): ProductoService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealProductoService } = require('./producto.api');
  return new RealProductoService();
}

/**
 * Producto service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Defaults to real (production) when env var is not set.
 */
export const productoService: ProductoService = USE_MOCKS
  ? createMockService()
  : createRealService();
