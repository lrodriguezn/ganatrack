// apps/web/src/modules/servicios/types/servicios.types.ts
/**
 * Servicios module types — interfaces, DTOs, and pagination types.
 *
 * Palpaciones e inseminaciones son EVENTOS GRUPALES (un evento tiene N animales).
 * Partos son REGISTROS INDIVIDUALES (uno por animal).
 *
 * All IDs are number. All dates are ISO strings from the API.
 */

// ============================================================================
// Evento Grupal (base para palpaciones e inseminaciones)
// ============================================================================

export interface EventoGrupal {
  id: number;
  predioId: number;
  codigo: string;
  fecha: string; // ISO string
  veterinariosId: number;
  observaciones?: string;
  // Joined fields
  veterinarioNombre?: string;
  totalAnimales?: number;
  createdAt: string;
}

// ============================================================================
// Palpaciones
// ============================================================================

export interface PalpacionAnimal {
  id: number;
  eventoId: number;
  animalesId: number;
  diagnosticosVeterinariosId: number;
  configCondicionesCorporalesId: number;
  diasGestacion?: number;
  fechaParto?: string; // ISO string
  comentarios?: string;
  // Joined fields
  animalCodigo?: string;
  animalNombre?: string;
  diagnosticoNombre?: string;
  condicionCorporalNombre?: string;
}

export interface PalpacionEvento extends EventoGrupal {
  animales: PalpacionAnimal[];
}

export interface CreatePalpacionEventoDto {
  predioId: number;
  codigo: string;
  fecha: string;
  veterinariosId: number;
  observaciones?: string;
  animales: CreatePalpacionAnimalDto[];
}

export interface CreatePalpacionAnimalDto {
  animalesId: number;
  diagnosticosVeterinariosId: number;
  configCondicionesCorporalesId: number;
  diasGestacion?: number;
  fechaParto?: string;
  comentarios?: string;
}

// ============================================================================
// Inseminaciones
// ============================================================================

export interface InseminacionAnimal {
  id: number;
  eventoId: number;
  animalesId: number;
  fecha: string;
  toro?: string;
  pajuela?: string;
  dosis?: number;
  observaciones?: string;
  // Joined fields
  animalCodigo?: string;
  animalNombre?: string;
}

export interface InseminacionEvento extends EventoGrupal {
  animales: InseminacionAnimal[];
}

export interface CreateInseminacionEventoDto {
  predioId: number;
  codigo: string;
  fecha: string;
  veterinariosId: number;
  observaciones?: string;
  animales: CreateInseminacionAnimalDto[];
}

export interface CreateInseminacionAnimalDto {
  animalesId: number;
  fecha: string;
  toro?: string;
  pajuela?: string;
  dosis?: number;
  observaciones?: string;
}

// ============================================================================
// Partos (registro individual)
// ============================================================================

export interface Parto {
  id: number;
  predioId: number;
  animalesId: number;
  fecha: string; // ISO string
  machos: number;
  hembras: number;
  muertos: number;
  tipoParto: TipoParto;
  observaciones?: string;
  // Joined fields
  animalCodigo?: string;
  animalNombre?: string;
  totalCrias: number;
}

export type TipoParto = 'Normal' | 'Con Ayuda' | 'Distocico' | 'Mortinato';

export interface CreatePartoDto {
  predioId: number;
  animalesId: number;
  fecha: string;
  machos: number;
  hembras: number;
  muertos: number;
  tipoParto: TipoParto;
  observaciones?: string;
}

// ============================================================================
// Pagination (reutiliza el patrón de animales)
// ============================================================================

export interface PaginationParams {
  predioId: number;
  page: number;
  limit: number;
}

export interface PaginatedEventos<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// KPIs
// ============================================================================

export interface PalpacionesKPIs {
  total: number;
  positivas: number;
  negativas: number;
  tasaPrenez: number; // porcentaje
}

export interface PartosKPIs {
  total: number;
  totalMachos: number;
  totalHembras: number;
  totalMuertos: number;
  totalCriasVivas: number;
}
