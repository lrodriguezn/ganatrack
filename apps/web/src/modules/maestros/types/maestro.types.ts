// apps/web/src/modules/maestros/types/maestro.types.ts
/**
 * Maestros types — all entity interfaces, Zod schemas, and shared types.
 *
 * Covers 8 maestro entities:
 * veterinarios, propietarios, hierros, diagnosticos,
 * motivos-ventas, causas-muerte, lugares-compras, lugares-ventas
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
// ============================================================================

export interface MaestroBase {
  id: number;
  nombre: string;
  activo: boolean;
}

// ============================================================================
// Entity interfaces
// ============================================================================

export interface Veterinario extends MaestroBase {
  especialidad?: string;
  telefono?: string;
  email?: string;
}

export interface Propietario extends MaestroBase {
  documento?: string;
  telefono?: string;
  email?: string;
}

export interface Hierro extends MaestroBase {
  codigo: string;
  descripcion?: string;
  imagen_url?: string;
}

export interface Diagnostico extends MaestroBase {
  descripcion?: string;
  tipo?: string;
}

export interface MotivoVenta extends MaestroBase {
  descripcion?: string;
}

export interface CausaMuerte extends MaestroBase {
  descripcion?: string;
}

export interface LugarCompra extends MaestroBase {
  municipio?: string;
  departamento?: string;
}

export interface LugarVenta extends MaestroBase {
  municipio?: string;
  departamento?: string;
}

// ============================================================================
// Zod schemas for all 8 entities
// ============================================================================

export const VeterinarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  especialidad: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export const PropietarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  documento: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export const HierroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().min(1, 'El código es requerido'),
  descripcion: z.string().optional(),
  imagen_url: z.string().optional(),
});

export const DiagnosticoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  tipo: z.string().optional(),
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
  municipio: z.string().optional(),
  departamento: z.string().optional(),
});

export const LugarVentaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  municipio: z.string().optional(),
  departamento: z.string().optional(),
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
