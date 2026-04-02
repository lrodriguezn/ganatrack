// apps/web/src/modules/predios/index.ts
/**
 * Predios Module — barrel export for the entire predios module.
 *
 * Re-exports:
 * - Service instance (prediosService)
 * - All hooks (query + mutation + sub-recurso)
 * - All components (tables + forms)
 *
 * Usage:
 *   import { prediosService, usePredios, PredioTable } from '@/modules/predios';
 */

export { prediosService } from './services';
export type { PrediosService } from './services';

export * from './hooks';
export * from './components';
