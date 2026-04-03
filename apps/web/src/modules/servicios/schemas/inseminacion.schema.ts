// apps/web/src/modules/servicios/schemas/inseminacion.schema.ts
/**
 * Zod schemas for inseminación forms.
 *
 * Step 1: evento (predio, código, fecha, veterinario)
 * Step 2: animales (array, min 1)
 * Step 3: resultados por animal
 */

import { z } from 'zod';

// ============================================================================
// Step 3 — Resultado por animal
// ============================================================================

export const inseminacionAnimalSchema = z.object({
  animalesId: z.number().min(1, 'Debe seleccionar un animal'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  toro: z.string().optional(),
  pajuela: z.string().optional(),
  dosis: z.number().optional(),
  observaciones: z.string().optional(),
});

export type InseminacionAnimalFormValues = z.infer<typeof inseminacionAnimalSchema>;

// ============================================================================
// Step 1 — Evento
// ============================================================================

export const inseminacionEventoSchema = z.object({
  predioId: z.number().min(1, 'El predio es requerido'),
  codigo: z.string().min(1, 'El código del evento es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  veterinariosId: z.number().min(1, 'El veterinario es requerido'),
  observaciones: z.string().optional(),
});

export type InseminacionEventoFormValues = z.infer<typeof inseminacionEventoSchema>;

// ============================================================================
// Form completo (wizard)
// ============================================================================

export const inseminacionWizardSchema = z.object({
  evento: inseminacionEventoSchema,
  animales: z
    .array(inseminacionAnimalSchema)
    .min(1, 'Debe agregar al menos un animal'),
});

export type InseminacionWizardFormValues = z.infer<typeof inseminacionWizardSchema>;
