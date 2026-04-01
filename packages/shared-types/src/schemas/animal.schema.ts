// packages/shared-types/src/schemas/animal.schema.ts
import { z } from 'zod';
// Enums imported per PRD §5.2 — consumed by extended schemas and form validation consumers.
import { SexoEnum, EstadoAnimalEnum, OrigenAnimalEnum } from '../enums';

// Re-export for consumers who import from this schema module directly
export { SexoEnum, EstadoAnimalEnum, OrigenAnimalEnum };

// NOTE: Todos los campos usan camelCase (no snake_case)
// NOTE: Todos los IDs usan z.number().int() (no z.string().uuid())
export const createAnimalSchema = z.object({
  // predioId: valor de.predioActivo.id del store
  predioId: z.number().int({ message: 'Predio requerido' }),
  codigo: z.string().min(1, 'Código requerido').max(50),
  nombre: z.string().max(100).optional(),
  fechaNacimiento: z.coerce.date({ required_error: 'Fecha de nacimiento requerida' }),
  sexoKey: z.number().int().default(0),
  tipoIngresoId: z.number().int().default(0),
  configRazasId: z.number().int({ message: 'Raza requerida' }),
  potreroId: z.number().int().optional(),
  madreId: z.number().int().nullish(),
  padreId: z.number().int().nullish(),
  codigoMadre: z.string().max(50).optional(),
  codigoPadre: z.string().max(50).optional(),
  tipoPadreKey: z.number().int().default(0),
  precioCompra: z.coerce.number().nonnegative().optional(),
  pesoCompra: z.coerce.number().nonnegative().optional(),
  codigoRfid: z.string().max(50).optional(),
  codigoArete: z.string().max(50).optional(),
  estadoAnimalKey: z.number().int().default(0),
  saludAnimalKey: z.number().int().default(0),
  // Validación equivalente al backend: dominio valida lugar_compra_id cuando tipoIngresoId indica COMPRADO
});

export type CreateAnimalDto = z.infer<typeof createAnimalSchema>;
