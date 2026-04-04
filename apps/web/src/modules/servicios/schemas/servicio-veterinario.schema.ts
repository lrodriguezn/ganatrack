// apps/web/src/modules/servicios/schemas/servicio-veterinario.schema.ts
/**
 * Zod schemas for servicio veterinario forms.
 *
 * Step 1: evento (predio, código, fecha, veterinario)
 * Step 2: animales (array, min 1)
 * Step 3: resultados por animal (medicamentos, dosis, próxima aplicación)
 */

import { z } from 'zod';

export const servicioVeterinarioAnimalSchema = z.object({
  animalesId: z.number().int().positive('Animal requerido'),
  diagnosticosVeterinariosId: z.number().int().positive('Diagnóstico requerido').nullable().optional(),
  medicamentos: z.string().max(200).optional(),
  dosis: z.string().max(100).optional(),
  proximaAplicacion: z.string().optional(),
  observaciones: z.string().max(500).optional(),
});

export type ServicioVeterinarioAnimalFormData = z.infer<typeof servicioVeterinarioAnimalSchema>;

export const servicioVeterinarioEventoSchema = z.object({
  predioId: z.number().int().positive('Predio requerido'),
  codigo: z.string().min(1, 'Código requerido').max(50),
  fecha: z.coerce.date({ required_error: 'Fecha requerida' }),
  veterinariosId: z.number().int().positive('Veterinario requerido'),
  observaciones: z.string().max(500).optional(),
  animales: z.array(servicioVeterinarioAnimalSchema).min(1, 'Al menos un animal requerido'),
});

export type ServicioVeterinarioEventoFormData = z.infer<typeof servicioVeterinarioEventoSchema>;
