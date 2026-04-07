// apps/web/src/modules/maestros/types/maestro.types.ts
/**
 * Maestros types — all entity interfaces, Zod schemas, and shared types.
 *
 * Covers 8 maestro entities:
 * veterinarios, propietarios, hierros, diagnosticos,
 * motivos-ventas, causas-muerte, lugares-compras, lugares-ventas
 *
 * IMPORTANT: These types match the backend DTOs for seamless integration.
 * Field names are aligned with backend response format.
 */

import { z } from 'zod';

// ============================================================================
// MaestroTipo union — used as the discriminant for all generic operations
// ============================================================================

export type MaestroTipo =
  | 'veterinarios'
  | 'propietarios'
  | 'hierros'
  | 'diagnosticos'
  | 'motivos-ventas'
  | 'causas-muerte'
  | 'lugares-compras'
  | 'lugares-ventas';

// ============================================================================
// Base interface — all maestros share id, nombre, activo
// Backend returns activo as number (0/1), frontend converts to boolean
// ============================================================================

export interface MaestroBase {
  id: number;
  nombre: string;
  activo: boolean; // Converted from backend number (0/1)
}

// ============================================================================
// Entity interfaces — aligned with backend Response DTOs
// ============================================================================

export interface Veterinario extends MaestroBase {
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  numeroRegistro: string | null;
  especialidad: string | null;
}

export interface Propietario extends MaestroBase {
  tipoDocumento: string | null;
  numeroDocumento: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
}

export interface Hierro extends MaestroBase {
  descripcion: string | null;
}

export interface Diagnostico extends MaestroBase {
  descripcion: string | null;
  categoria: string | null;
}

export interface MotivoVenta extends MaestroBase {
  descripcion: string | null;
}

export interface CausaMuerte extends MaestroBase {
  descripcion: string | null;
}

export interface LugarCompra extends MaestroBase {
  tipo: string | null;
  ubicacion: string | null;
  contacto: string | null;
  telefono: string | null;
}

export interface LugarVenta extends MaestroBase {
  tipo: string | null;
  ubicacion: string | null;
  contacto: string | null;
  telefono: string | null;
}

// ============================================================================
// Zod schemas for all 8 entities — aligned with backend schemas
// ============================================================================

export const VeterinarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  telefono: z.string().max(20).optional(),
  email: z.string().max(100).email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  numeroRegistro: z.string().max(50).optional(),
  especialidad: z.string().max(100).optional(),
});

export const PropietarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipoDocumento: z.string().max(20).optional(),
  numeroDocumento: z.string().max(50).optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().max(100).email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
});

export const HierroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

export const DiagnosticoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  categoria: z.string().max(50).optional(),
});

export const MotivoVentaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

export const CausaMuerteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

export const LugarCompraSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.string().max(50).optional(),
  ubicacion: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().max(20).optional(),
});

export const LugarVentaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.string().max(50).optional(),
  ubicacion: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().max(20).optional(),
});

// ============================================================================
// DTO types inferred from Zod schemas
// ============================================================================

export type VeterinarioDto = z.infer<typeof VeterinarioSchema>;
export type PropietarioDto = z.infer<typeof PropietarioSchema>;
export type HierroDto = z.infer<typeof HierroSchema>;
export type DiagnosticoDto = z.infer<typeof DiagnosticoSchema>;
export type MotivoVentaDto = z.infer<typeof MotivoVentaSchema>;
export type CausaMuerteDto = z.infer<typeof CausaMuerteSchema>;
export type LugarCompraDto = z.infer<typeof LugarCompraSchema>;
export type LugarVentaDto = z.infer<typeof LugarVentaSchema>;

// ============================================================================
// Union DTO type for create operations (without id, activo)
// ============================================================================

export type CreateMaestroDto =
  | VeterinarioDto
  | PropietarioDto
  | HierroDto
  | DiagnosticoDto
  | MotivoVentaDto
  | CausaMuerteDto
  | LugarCompraDto
  | LugarVentaDto;

// ============================================================================
// Partial DTO for update operations
// ============================================================================

export type UpdateMaestroDto =
  | Partial<VeterinarioDto>
  | Partial<PropietarioDto>
  | Partial<HierroDto>
  | Partial<DiagnosticoDto>
  | Partial<MotivoVentaDto>
  | Partial<CausaMuerteDto>
  | Partial<LugarCompraDto>
  | Partial<LugarVentaDto>;

// ============================================================================
// Schema map for Zod validation
// ============================================================================

export const MaestroSchemas: Record<MaestroTipo, z.ZodSchema> = {
  veterinarios: VeterinarioSchema,
  propietarios: PropietarioSchema,
  hierros: HierroSchema,
  diagnosticos: DiagnosticoSchema,
  'motivos-ventas': MotivoVentaSchema,
  'causas-muerte': CausaMuerteSchema,
  'lugares-compras': LugarCompraSchema,
  'lugares-ventas': LugarVentaSchema,
};

// ============================================================================
// Field definition for generic MaestroForm
// ============================================================================

export type MaestroFieldDef = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  required?: boolean;
};

// ============================================================================
// Type map — maps MaestroTipo to entity interface
// ============================================================================

export type MaestroEntityMap = {
  veterinarios: Veterinario;
  propietarios: Propietario;
  hierros: Hierro;
  diagnosticos: Diagnostico;
  'motivos-ventas': MotivoVenta;
  'causas-muerte': CausaMuerte;
  'lugares-compras': LugarCompra;
  'lugares-ventas': LugarVenta;
};

// ============================================================================
// DTO type map — maps MaestroTipo to create DTO
// ============================================================================

export type MaestroDtoMap = {
  veterinarios: VeterinarioDto;
  propietarios: PropietarioDto;
  hierros: HierroDto;
  diagnosticos: DiagnosticoDto;
  'motivos-ventas': MotivoVentaDto;
  'causas-muerte': CausaMuerteDto;
  'lugares-compras': LugarCompraDto;
  'lugares-ventas': LugarVentaDto;
};

// ============================================================================
// Utility: Convert backend activo (number 0/1) to frontend boolean
// ============================================================================

export function parseActivo(value: number | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  return true;
}

// ============================================================================
// Utility: Convert frontend boolean to backend activo (number 0/1)
// ============================================================================

export function toBackendActivo(value: boolean): number {
  return value ? 1 : 0;
}
