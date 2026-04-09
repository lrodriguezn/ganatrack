// apps/web/src/modules/predios/hooks/index.ts
/**
 * Predios Hooks — barrel export for all predios-related hooks.
 *
 * Usage:
 *   import { usePredios, usePredio, useCreatePredio } from '@/modules/predios/hooks';
 */

// Query hooks
export { usePredios } from './use-predios';
export { usePredio } from './use-predio';

// Mutation hooks
export { useCreatePredio } from './use-create-predio';
export { useUpdatePredio } from './use-update-predio';
export { useDeletePredio } from './use-delete-predio';

// Sub-recurso query hooks (list)
export { usePotreros } from './use-potreros';
export { useLotes } from './use-lotes';
export { useGrupos } from './use-grupos';
export { useSectores } from './use-sectores';

// Sub-recurso query hooks (single)
export { usePotrero } from './use-potrero';
export { useSector } from './use-sector';
export { useLote } from './use-lote';
export { useGrupo } from './use-grupo';

// Potrero mutation hooks
export { useCreatePotrero } from './use-create-potrero';
export { useUpdatePotrero } from './use-update-potrero';
export { useDeletePotrero } from './use-delete-potrero';

// Sector mutation hooks
export { useCreateSector } from './use-create-sector';
export { useUpdateSector } from './use-update-sector';
export { useDeleteSector } from './use-delete-sector';

// Lote mutation hooks
export { useCreateLote } from './use-create-lote';
export { useUpdateLote } from './use-update-lote';
export { useDeleteLote } from './use-delete-lote';

// Grupo mutation hooks
export { useCreateGrupo } from './use-create-grupo';
export { useUpdateGrupo } from './use-update-grupo';
export { useDeleteGrupo } from './use-delete-grupo';
