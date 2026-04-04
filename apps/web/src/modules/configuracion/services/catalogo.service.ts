// apps/web/src/modules/configuracion/services/catalogo.service.ts
/**
 * CatalogoService — interface + factory.
 *
 * Generic CRUD service for all editable catalog entities.
 * Swaps between MockCatalogoService (dev) and RealCatalogoService (production).
 *
 * API path pattern: /config/{tipo} (matches backend endpoints)
 */

import type { CatalogoBase, CatalogoTipo, CreateCatalogoDto } from '../types/catalogo.types';

// ============================================================================
// CatalogoService Interface
// ============================================================================

export interface CatalogoService {
  getAll(tipo: CatalogoTipo): Promise<CatalogoBase[]>;
  create(tipo: CatalogoTipo, data: CreateCatalogoDto): Promise<CatalogoBase>;
  update(tipo: CatalogoTipo, id: number, data: Partial<CreateCatalogoDto>): Promise<CatalogoBase>;
  remove(tipo: CatalogoTipo, id: number): Promise<void>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): CatalogoService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockCatalogoService } = require('./catalogo.mock');
  return new MockCatalogoService();
}

function createRealService(): CatalogoService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealCatalogoService } = require('./catalogo.api');
  return new RealCatalogoService();
}

/**
 * Catalogo service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real when env var is not set (falsy).
 */
export const catalogoService: CatalogoService = USE_MOCKS
  ? createMockService()
  : createRealService();
