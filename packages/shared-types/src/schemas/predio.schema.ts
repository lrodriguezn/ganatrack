// packages/shared-types/src/schemas/predio.schema.ts
/**
 * Predio Schema — Zod schemas for Predios and sub-recursos.
 *
 * Provides:
 * - PredioSchema: base entity type (mirrors backend Drizzle schema)
 * - CreatePredioSchema / UpdatePredioSchema: form-level validation
 * - PotreroSchema + CRUD schemas
 * - LoteSchema + CRUD schemas
 * - GrupoSchema + CRUD schemas
 *
 * Design: IDs are number (int) — aligned with backend Drizzle autoIncrement.
 * This differs from auth.schema.ts which uses UUIDs for User.
 */

import { z } from 'zod';

// ============================================================================
// Predio Types
// ============================================================================

/**
 * Predio tipo enum — classification of farm type.
 * Per PRD §4.2: lechería, cría, doble propósito, engorde
 */
export const PredioTipoSchema = z.enum(['lechería', 'cría', 'doble propósito', 'engorde']);

export type PredioTipo = z.infer<typeof PredioTipoSchema>;

/**
 * Predio base schema — shared between list and detail views.
 */
export const PredioSchema = z.object({
  id: z.number().int(),
  nombre: z.string().min(1).max(100),
  departamento: z.string().min(1),
  municipio: z.string().min(1),
  vereda: z.string().optional(),
  hectares: z.number().positive(),
  tipo: PredioTipoSchema,
  estado: z.enum(['activo', 'inactivo']).default('activo'),
});

export type Predio = z.infer<typeof PredioSchema>;

/**
 * Create Predio DTO — all fields required except vereda.
 */
export const CreatePredioSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  departamento: z.string().min(1, 'Departamento requerido'),
  municipio: z.string().min(1, 'Municipio requerido'),
  vereda: z.string().optional(),
  hectares: z.number().positive('Hectáreas debe ser un número positivo'),
  tipo: PredioTipoSchema,
});

export type CreatePredioDto = z.infer<typeof CreatePredioSchema>;

/**
 * Update Predio DTO — partial, all fields optional.
 */
export const UpdatePredioSchema = CreatePredioSchema.partial();

export type UpdatePredioDto = z.infer<typeof UpdatePredioSchema>;

// ============================================================================
// Potrero Types
// ============================================================================

/**
 * Potrero estado enum.
 * activo: available for grazing
 * en_descanso: resting/regrowing
 */
export const PotreroEstadoSchema = z.enum(['activo', 'en_descanso']);

export type PotreroEstado = z.infer<typeof PotreroEstadoSchema>;

/**
 * Potrero base schema.
 */
export const PotreroSchema = z.object({
  id: z.number().int(),
  predioId: z.number().int(),
  codigo: z.string().min(1).max(20),
  nombre: z.string().min(1).max(100),
  hectares: z.number().positive(),
  tipoPasto: z.string().min(1),
  capacidadMaxima: z.number().int().nonnegative(),
  estado: PotreroEstadoSchema.default('activo'),
});

export type Potrero = z.infer<typeof PotreroSchema>;

/**
 * Create Potrero DTO.
 */
export const CreatePotreroSchema = z.object({
  codigo: z.string().min(1, 'Código requerido').max(20, 'Máximo 20 caracteres'),
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  hectares: z.number().positive('Hectáreas debe ser un número positivo'),
  tipoPasto: z.string().min(1, 'Tipo de pasto requerido'),
  capacidadMaxima: z.number().int().nonnegative('Capacidad debe ser un número entero positivo'),
  estado: PotreroEstadoSchema.default('activo'),
});

export type CreatePotreroDto = z.infer<typeof CreatePotreroSchema>;

/**
 * Update Potrero DTO.
 */
export const UpdatePotreroSchema = CreatePotreroSchema.partial();

export type UpdatePotreroDto = z.infer<typeof UpdatePotreroSchema>;

// ============================================================================
// Lote Types
// ============================================================================

/**
 * Lote tipo enum.
 */
export const LoteTipoSchema = z.enum(['producción', 'levante', 'engorde', 'cría']);

export type LoteTipo = z.infer<typeof LoteTipoSchema>;

/**
 * Lote base schema.
 */
export const LoteSchema = z.object({
  id: z.number().int(),
  predioId: z.number().int(),
  nombre: z.string().min(1).max(100),
  descripcion: z.string().optional(),
  tipo: LoteTipoSchema,
});

export type Lote = z.infer<typeof LoteSchema>;

/**
 * Create Lote DTO.
 */
export const CreateLoteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().optional(),
  tipo: LoteTipoSchema,
});

export type CreateLoteDto = z.infer<typeof CreateLoteSchema>;

/**
 * Update Lote DTO.
 */
export const UpdateLoteSchema = CreateLoteSchema.partial();

export type UpdateLoteDto = z.infer<typeof UpdateLoteSchema>;

// ============================================================================
// Grupo Types
// ============================================================================

/**
 * Grupo base schema.
 */
export const GrupoSchema = z.object({
  id: z.number().int(),
  predioId: z.number().int(),
  nombre: z.string().min(1).max(100),
  descripcion: z.string().optional(),
  animalCount: z.number().int().nonnegative().default(0),
});

export type Grupo = z.infer<typeof GrupoSchema>;

/**
 * Create Grupo DTO.
 */
export const CreateGrupoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().optional(),
});

export type CreateGrupoDto = z.infer<typeof CreateGrupoSchema>;

/**
 * Update Grupo DTO.
 */
export const UpdateGrupoSchema = CreateGrupoSchema.partial();

export type UpdateGrupoDto = z.infer<typeof UpdateGrupoSchema>;

// ============================================================================
// Sector Types
// ============================================================================

/**
 * Sector estado enum (same as Potrero).
 */
export const SectorEstadoSchema = z.enum(['activo', 'en_descanso']);

export type SectorEstado = z.infer<typeof SectorEstadoSchema>;

/**
 * Sector base schema — follows the same pattern as Potrero.
 * Sectores are administrative divisions within a Predio.
 */
export const SectorSchema = z.object({
  id: z.number().int(),
  predioId: z.number().int(),
  codigo: z.string().min(1).max(20),
  nombre: z.string().min(1).max(100),
  hectares: z.number().positive(),
  tipoPasto: z.string().min(1),
  capacidadMaxima: z.number().int().nonnegative(),
  estado: SectorEstadoSchema.default('activo'),
});

export type Sector = z.infer<typeof SectorSchema>;

/**
 * Create Sector DTO.
 */
export const CreateSectorSchema = z.object({
  codigo: z.string().min(1, 'Código requerido').max(20, 'Máximo 20 caracteres'),
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  hectares: z.number().positive('Hectáreas debe ser un número positivo'),
  tipoPasto: z.string().min(1, 'Tipo de pasto requerido'),
  capacidadMaxima: z.number().int().nonnegative('Capacidad debe ser un número entero positivo'),
  estado: SectorEstadoSchema.default('activo'),
});

export type CreateSectorDto = z.infer<typeof CreateSectorSchema>;

/**
 * Update Sector DTO.
 */
export const UpdateSectorSchema = CreateSectorSchema.partial();

export type UpdateSectorDto = z.infer<typeof UpdateSectorSchema>;

// ============================================================================
// Array schemas (for API responses)
// ============================================================================

export const PredioArraySchema = z.array(PredioSchema);
export const PotreroArraySchema = z.array(PotreroSchema);
export const LoteArraySchema = z.array(LoteSchema);
export const GrupoArraySchema = z.array(GrupoSchema);
export const SectorArraySchema = z.array(SectorSchema);
