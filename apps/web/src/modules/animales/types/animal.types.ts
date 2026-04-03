// apps/web/src/modules/animales/types/animal.types.ts
/**
 * Animal module types — interfaces, DTOs, and pagination types.
 *
 * All IDs are number (not string/UUID) per project standards.
 * All dates are ISO strings from the API.
 */

import type { z } from 'zod';
import { createAnimalSchema } from '@ganatrack/shared-types';

// Re-export schema types
export type { CreateAnimalDto } from '@ganatrack/shared-types';
export type UpdateAnimalDto = Partial<z.infer<typeof createAnimalSchema>>;

// ============================================================================
// Core interfaces
// ============================================================================

export interface Animal {
  id: number;
  predioId: number;
  codigo: string;
  nombre?: string;
  fechaNacimiento: string; // ISO string from API
  sexoKey: number;
  tipoIngresoId: number;
  configRazasId: number;
  potreroId?: number;
  madreId?: number | null;
  padreId?: number | null;
  codigoMadre?: string;
  codigoPadre?: string;
  tipoPadreKey: number;
  precioCompra?: number;
  pesoCompra?: number;
  codigoRfid?: string;
  codigoArete?: string;
  estadoAnimalKey: number;
  saludAnimalKey: number;
  // Joined fields
  razaNombre?: string;
  potreroNombre?: string;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginatedAnimales {
  data: Animal[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AnimalFilters {
  predioId: number;
  page: number;
  limit: number;
  search?: string;
  sexoKey?: number;
  estadoAnimalKey?: number;
  potreroId?: number;
}

// ============================================================================
// Estadísticas
// ============================================================================

export interface AnimalEstadisticas {
  total: number;
  activos: number;
  vendidos: number;
  muertos: number;
  machos: number;
  hembras: number;
}

// ============================================================================
// Cambio de estado
// ============================================================================

export interface CambioEstadoDto {
  estadoAnimalKey: number;
  fecha: string;
  motivoId?: number;
  causaId?: number;
  lugarVentaId?: number;
  precioVenta?: number;
}

// ============================================================================
// Genealogía
// ============================================================================

export interface Genealogia {
  id: number;
  codigo: string;
  nombre?: string;
  sexoKey: number;
  razaNombre?: string;
  madre?: Genealogia;
  padre?: Genealogia;
}

// ============================================================================
// Historial
// ============================================================================

export interface HistorialEvento {
  id: number;
  tipo: string;
  fecha: string;
  descripcion: string;
}