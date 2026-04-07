// apps/web/src/modules/maestros/services/maestros.service.ts
/**
 * MaestrosService — interface + factory.
 *
 * Generic CRUD service for all 8 maestro entities.
 * Swaps between MockMaestrosService (dev) and RealMaestrosService (production).
 */

import type { CreateMaestroDto, MaestroBase, MaestroTipo } from '../types/maestro.types';

// ============================================================================
// MaestrosService Interface
// ============================================================================

export interface MaestrosService {
  getAll(tipo: MaestroTipo): Promise<MaestroBase[]>;
  getById(tipo: MaestroTipo, id: number): Promise<MaestroBase>;
  create(tipo: MaestroTipo, data: CreateMaestroDto): Promise<MaestroBase>;
  update(tipo: MaestroTipo, id: number, data: Partial<CreateMaestroDto>): Promise<MaestroBase>;
  remove(tipo: MaestroTipo, id: number): Promise<void>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): MaestrosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockMaestrosService } = require('./maestros.mock');
  return new MockMaestrosService();
}

function createRealService(): MaestrosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealMaestrosService } = require('./maestros.api');
  return new RealMaestrosService();
}

/**
 * Maestros service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real when env var is not set (falsy).
 */
export const maestrosService: MaestrosService = USE_MOCKS
  ? createMockService()
  : createRealService();
