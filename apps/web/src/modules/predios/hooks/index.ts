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

// Sub-recurso query hooks
export { usePotreros } from './use-potreros';
export { useLotes } from './use-lotes';
export { useGrupos } from './use-grupos';
export { useSectores } from './use-sectores';
