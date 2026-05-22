// apps/web/src/modules/animales/services/animal.service.ts
/**
 * AnimalService — interface + factory.
 *
 * Swaps between MockAnimalService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealAnimalService (production).
 *
 * Base API path: /animales
 */

import type {
  Animal,
  CreateAnimalDto,
  UpdateAnimalDto,
  AnimalEstadisticas,
  CambioEstadoDto,
  Genealogia,
  HistorialEvento,
  PaginatedAnimales,
  AnimalFilters,
} from '../types/animal.types';

// ============================================================================
// AnimalService Interface
// ============================================================================

export interface AnimalService {
  // CRUD
  getAll(filters: AnimalFilters): Promise<PaginatedAnimales>;
  getById(id: number): Promise<Animal>;
  create(data: CreateAnimalDto, headers?: Record<string, string>): Promise<Animal>;
  update(id: number, data: UpdateAnimalDto, version: number): Promise<Animal>;
  delete(id: number): Promise<void>;

  // Estado
  cambiarEstado(id: number, data: CambioEstadoDto): Promise<Animal>;

  // Genealogía
  getGenealogia(id: number): Promise<Genealogia>;

  // Historial
  getHistorial(id: number, tipo: string): Promise<HistorialEvento[]>;

  // Estadísticas
  getEstadisticas(predioId: number): Promise<AnimalEstadisticas>;
}

import { MockAnimalService } from './animal.mock';
import { RealAnimalService } from './animal.api';

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): AnimalService {
  return new MockAnimalService();
}

function createRealService(): AnimalService {
  return new RealAnimalService();
}

/**
 * Animal service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real when env var is not set (falsy).
 */
export const animalService: AnimalService = USE_MOCKS
  ? createMockService()
  : createRealService();