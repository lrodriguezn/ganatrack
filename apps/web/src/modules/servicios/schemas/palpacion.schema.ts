// apps/web/src/modules/servicios/schemas/palpacion.schema.ts
/**
 * Zod schemas for palpación forms.
 *
 * Step 1: evento (predio, código, fecha, veterinario)
 * Step 2: animales (array, min 1)
 * Step 3: resultados por animal
 */

import { z } from 'zod';

// ============================================================================
// Step 3 — Resultado por animal
// ============================================================================

export const palpacionAnimalSchema = z.object({
  animalesId: z.number().min(1, 'Debe seleccionar un animal'),
  diagnosticosVeterinariosId: z.number().min(1, 'El diagnóstico es requerido'),
  configCondicionesCorporalesId: z.number().min(1, 'La condición corporal es requerida'),
  diasGestacion: z.number().optional(),
  fechaParto: z.string().optional(),
  comentarios: z.string().optional(),
});

export type PalpacionAnimalFormValues = z.infer<typeof palpacionAnimalSchema>;

// ============================================================================
// Step 1 — Evento
// ============================================================================

export const palpacionEventoSchema = z.object({
  predioId: z.number().min(1, 'El predio es requerido'),
  codigo: z.string().min(1, 'El código del evento es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  veterinariosId: z.number().min(1, 'El veterinario es requerido'),
  observaciones: z.string().optional(),
});

export type PalpacionEventoFormValues = z.infer<typeof palpacionEventoSchema>;

// ============================================================================
// Form completo (wizard)
// ============================================================================

export const palpacionWizardSchema = z.object({
  evento: palpacionEventoSchema,
  animales: z
    .array(palpacionAnimalSchema)
    .min(1, 'Debe agregar al menos un animal'),
});

export type PalpacionWizardFormValues = z.infer<typeof palpacionWizardSchema>;
