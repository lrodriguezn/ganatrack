// apps/web/src/modules/predios/services/predios.service.ts
/**
 * Predios Service — interface + factory.
 *
 * Provides a swap between MockPrediosService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealPrediosService (production placeholder).
 *
 * All predios operations go through this service interface.
 */

import type {
  Predio,
  CreatePredioDto,
  UpdatePredioDto,
  Potrero,
  CreatePotreroDto,
  UpdatePotreroDto,
  Lote,
  CreateLoteDto,
  UpdateLoteDto,
  Grupo,
  CreateGrupoDto,
  UpdateGrupoDto,
  Sector,
  CreateSectorDto,
  UpdateSectorDto,
} from '@ganatrack/shared-types';

// ============================================================================
// PrediosService Interface
// ============================================================================

export interface PrediosService {
  // Predios CRUD
  getPredios(): Promise<Predio[]>;
  getPredio(id: number): Promise<Predio>;
  createPredio(data: CreatePredioDto): Promise<Predio>;
  updatePredio(id: number, data: UpdatePredioDto): Promise<Predio>;
  deletePredio(id: number): Promise<void>;

  // Potreros CRUD (sub-recurso)
  getPotreros(predioId: number): Promise<Potrero[]>;
  getPotrero(predioId: number, id: number): Promise<Potrero>;
  createPotrero(predioId: number, data: CreatePotreroDto): Promise<Potrero>;
  updatePotrero(predioId: number, id: number, data: UpdatePotreroDto): Promise<Potrero>;
  deletePotrero(predioId: number, id: number): Promise<void>;

  // Lotes CRUD (sub-recurso)
  getLotes(predioId: number): Promise<Lote[]>;
  getLote(predioId: number, id: number): Promise<Lote>;
  createLote(predioId: number, data: CreateLoteDto): Promise<Lote>;
  updateLote(predioId: number, id: number, data: UpdateLoteDto): Promise<Lote>;
  deleteLote(predioId: number, id: number): Promise<void>;

  // Grupos CRUD (sub-recurso)
  getGrupos(predioId: number): Promise<Grupo[]>;
  getGrupo(predioId: number, id: number): Promise<Grupo>;
  createGrupo(predioId: number, data: CreateGrupoDto): Promise<Grupo>;
  updateGrupo(predioId: number, id: number, data: UpdateGrupoDto): Promise<Grupo>;
  deleteGrupo(predioId: number, id: number): Promise<void>;

  // Sectores CRUD (sub-recurso)
  getSectores(predioId: number): Promise<Sector[]>;
  getSector(predioId: number, id: number): Promise<Sector>;
  createSector(predioId: number, data: CreateSectorDto): Promise<Sector>;
  updateSector(predioId: number, id: number, data: UpdateSectorDto): Promise<Sector>;
  deleteSector(predioId: number, id: number): Promise<void>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): PrediosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockPrediosService } = require('./predios.mock');
  return new MockPrediosService();
}

function createRealService(): PrediosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealPrediosService } = require('./predios.api');
  return new RealPrediosService();
}

/**
 * Predios service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to mock when env var is not set (falsy).
 */
export const prediosService: PrediosService = USE_MOCKS
  ? createMockService()
  : createRealService();
