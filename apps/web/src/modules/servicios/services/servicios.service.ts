// apps/web/src/modules/servicios/services/servicios.service.ts
/**
 * ServiciosService — interface + factory.
 *
 * Swaps between MockServiciosService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealServiciosService (production).
 *
 * Base API path: /servicios
 */

import type {
  PalpacionEvento,
  PalpacionAnimal,
  CreatePalpacionEventoDto,
  InseminacionEvento,
  InseminacionAnimal,
  CreateInseminacionEventoDto,
  Parto,
  CreatePartoDto,
  PaginationParams,
  PaginatedEventos,
  ServicioVeterinarioEvento,
  CreateServicioVeterinarioEventoDto,
  PaginatedServiciosVeterinarios,
} from '../types/servicios.types';

// ============================================================================
// ServiciosService Interface
// ============================================================================

export interface ServiciosService {
  // Palpaciones
  getPalpaciones(params: PaginationParams): Promise<PaginatedEventos<PalpacionEvento>>;
  getPalpacionById(id: number): Promise<PalpacionEvento>;
  createPalpacion(data: CreatePalpacionEventoDto): Promise<PalpacionEvento>;

  // Inseminaciones
  getInseminaciones(params: PaginationParams): Promise<PaginatedEventos<InseminacionEvento>>;
  getInseminacionById(id: number): Promise<InseminacionEvento>;
  createInseminacion(data: CreateInseminacionEventoDto): Promise<InseminacionEvento>;

  // Partos
  getPartos(params: PaginationParams): Promise<PaginatedEventos<Parto>>;
  getPartoById(id: number): Promise<Parto>;
  createParto(data: CreatePartoDto): Promise<Parto>;

  // Servicios Veterinarios
  getServiciosVeterinarios(filters: { predioId: number; page: number; limit: number }): Promise<PaginatedServiciosVeterinarios>;
  getServicioVeterinarioById(id: number): Promise<ServicioVeterinarioEvento>;
  createServicioVeterinario(data: CreateServicioVeterinarioEventoDto): Promise<ServicioVeterinarioEvento>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): ServiciosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockServiciosService } = require('./servicios.mock');
  return new MockServiciosService();
}

function createRealService(): ServiciosService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealServiciosService } = require('./servicios.api');
  return new RealServiciosService();
}

/**
 * Servicios service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real service when env var is not set.
 */
export const serviciosService: ServiciosService = USE_MOCKS
  ? createMockService()
  : createRealService();
