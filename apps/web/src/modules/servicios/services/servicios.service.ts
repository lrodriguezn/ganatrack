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
  CreatePalpacionEventoDto,
  InseminacionEvento,
  CreateInseminacionEventoDto,
  Parto,
  CreatePartoDto,
  PaginatedEventos,
  ServicioVeterinarioEvento,
  CreateServicioVeterinarioEventoDto,
  PaginatedServiciosVeterinarios,
  PaginationParams,
} from '../types/servicios.types';

// ============================================================================
// ServiciosService Interface
// ============================================================================

export interface ServiciosService {
  // Palpaciones
  getPalpaciones(params: PaginationParams): Promise<PaginatedEventos<PalpacionEvento>>;
  getPalpacionById(id: number): Promise<PalpacionEvento>;
  createPalpacion(data: CreatePalpacionEventoDto, headers?: Record<string, string>): Promise<PalpacionEvento>;
  updatePalpacion(id: number, data: Partial<CreatePalpacionEventoDto>, version: number): Promise<PalpacionEvento>;

  // Inseminaciones
  getInseminaciones(params: PaginationParams): Promise<PaginatedEventos<InseminacionEvento>>;
  getInseminacionById(id: number): Promise<InseminacionEvento>;
  createInseminacion(data: CreateInseminacionEventoDto): Promise<InseminacionEvento>;
  updateInseminacion(id: number, data: Partial<CreateInseminacionEventoDto>, version: number): Promise<InseminacionEvento>;

  // Partos
  getPartos(params: PaginationParams): Promise<PaginatedEventos<Parto>>;
  getPartoById(id: number): Promise<Parto>;
  createParto(data: CreatePartoDto, headers?: Record<string, string>): Promise<Parto>;
  updateParto(id: number, data: Partial<CreatePartoDto>, version: number): Promise<Parto>;

  // Servicios Veterinarios
  getServiciosVeterinarios(filters: { predioId: number; page: number; limit: number }): Promise<PaginatedServiciosVeterinarios>;
  getServicioVeterinarioById(id: number): Promise<ServicioVeterinarioEvento>;
  createServicioVeterinario(data: CreateServicioVeterinarioEventoDto): Promise<ServicioVeterinarioEvento>;
  updateServicioVeterinario(id: number, data: Partial<CreateServicioVeterinarioEventoDto>, version: number): Promise<ServicioVeterinarioEvento>;
}

import { MockServiciosService } from './servicios.mock';
import { RealServiciosService } from './servicios.api';

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): ServiciosService {
  return new MockServiciosService();
}

function createRealService(): ServiciosService {
  return new RealServiciosService();
}

/**
 * Servicios service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real service when env var is not set.
 */
export const serviciosService: ServiciosService = USE_MOCKS
  ? createMockService()
  : createRealService();
