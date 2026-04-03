// apps/web/src/modules/servicios/schemas/parto.schema.ts
/**
 * Zod schema for parto form.
 *
 * Formulario simple (NO wizard) — un animal por registro.
 */

import { z } from 'zod';

const TIPO_PARTO_VALUES = ['Normal', 'Con Ayuda', 'Distocico', 'Mortinato'] as const;

export const partoSchema = z
  .object({
    predioId: z.number().min(1, 'El predio es requerido'),
    animalesId: z.number().min(1, 'Debe seleccionar un animal'),
    fecha: z.string().min(1, 'La fecha del parto es requerida'),
    machos: z.number().min(0, 'No puede ser negativo'),
    hembras: z.number().min(0, 'No puede ser negativo'),
    muertos: z.number().min(0, 'No puede ser negativo'),
    tipoParto: z.enum(TIPO_PARTO_VALUES, {
      required_error: 'El tipo de parto es requerido',
    }),
    observaciones: z.string().optional(),
  })
  .refine(
    (data) => data.machos + data.hembras + data.muertos > 0,
    {
      message: 'Debe registrar al menos una cría (viva o muerta)',
      path: ['machos'],
    },
  );

export type PartoFormValues = z.infer<typeof partoSchema>;

export const TIPO_PARTO_OPTIONS: { value: typeof TIPO_PARTO_VALUES[number]; label: string }[] = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Con Ayuda', label: 'Con Ayuda' },
  { value: 'Distocico', label: 'Distócico' },
  { value: 'Mortinato', label: 'Mortinato' },
];
