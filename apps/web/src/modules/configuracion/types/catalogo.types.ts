// apps/web/src/modules/configuracion/types/catalogo.types.ts
/**
 * Catalogo types — editable catalog entity interfaces, Zod schemas, and shared types.
 *
 * Covers 5 editable catalogs from the backend config module:
 * razas, condiciones-corporales, tipos-explotacion, calidad-animal, colores
 */

import { z } from 'zod';

// ============================================================================
// CatalogoTipo union
// ============================================================================

export type CatalogoTipo =
  | 'razas'
  | 'condiciones-corporales'
  | 'tipos-explotacion'
  | 'calidad-animal'
  | 'colores';

// ============================================================================
// Base interface
// ============================================================================

export interface CatalogoBase {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  activo: boolean;
}

// ============================================================================
// Entity interfaces
// ============================================================================

export interface CatalogoRaza extends CatalogoBase {
  // razas use base fields only
}

export interface CatalogoCondiciones extends CatalogoBase {
  // condiciones corporales use base fields only
}

export interface CatalogoTiposExplotacion extends CatalogoBase {
  // tipos explotacion use base fields only
}

export interface CatalogoCalidad extends CatalogoBase {
  // calidad animal use base fields only
}

export interface CatalogoColor extends CatalogoBase {
  // colores use base fields only
}

// ============================================================================
// Zod schemas
// ============================================================================

const baseCatalogoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().optional(),
  descripcion: z.string().optional(),
});

export const CatalogoRazaSchema = baseCatalogoSchema;
export const CatalogoCondicionesSchema = baseCatalogoSchema;
export const CatalogoTiposExplotacionSchema = baseCatalogoSchema;
export const CatalogoCalidadSchema = baseCatalogoSchema;
export const CatalogoColorSchema = baseCatalogoSchema;

// ============================================================================
// DTO types
// ============================================================================

export type CreateCatalogoDto = z.infer<typeof baseCatalogoSchema>;
export type UpdateCatalogoDto = Partial<CreateCatalogoDto>;

// ============================================================================
// Schema map
// ============================================================================

export const CatalogoSchemas: Record<CatalogoTipo, z.ZodSchema> = {
  razas: CatalogoRazaSchema,
  'condiciones-corporales': CatalogoCondicionesSchema,
  'tipos-explotacion': CatalogoTiposExplotacionSchema,
  'calidad-animal': CatalogoCalidadSchema,
  colores: CatalogoColorSchema,
};

// ============================================================================
// Field definition for generic form (same shape as MaestroFieldDef)
// ============================================================================

export interface CatalogoFieldDef {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  required?: boolean;
}

// ============================================================================
// Display config per catalog
// ============================================================================

export interface CatalogoConfig {
  title: string;
  singularName: string;
  description: string;
  columns: string[];
  fields: CatalogoFieldDef[];
}

export const CATALOGO_CONFIGS: Record<CatalogoTipo, CatalogoConfig> = {
  razas: {
    title: 'Razas',
    singularName: 'Raza',
    description: 'Catálogo de razas de ganado bovino',
    columns: ['nombre', 'codigo', 'descripcion'],
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'codigo', label: 'Código', type: 'text' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    ],
  },
  'condiciones-corporales': {
    title: 'Condiciones Corporales',
    singularName: 'Condición Corporal',
    description: 'Catálogo de condiciones corporales del ganado',
    columns: ['nombre', 'descripcion'],
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    ],
  },
  'tipos-explotacion': {
    title: 'Tipos de Explotación',
    singularName: 'Tipo de Explotación',
    description: 'Catálogo de tipos de explotación ganadera',
    columns: ['nombre', 'descripcion'],
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    ],
  },
  'calidad-animal': {
    title: 'Calidad Animal',
    singularName: 'Calidad',
    description: 'Catálogo de niveles de calidad animal',
    columns: ['nombre', 'descripcion'],
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    ],
  },
  colores: {
    title: 'Colores',
    singularName: 'Color',
    description: 'Catálogo de colores y pelaje del ganado',
    columns: ['nombre', 'codigo'],
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'codigo', label: 'Código', type: 'text' },
    ],
  },
};
