// apps/web/src/modules/maestros/index.ts
/**
 * Maestros Module — barrel export.
 *
 * Re-exports service, hooks, components, and types.
 *
 * Usage:
 *   import { maestrosService, useMaestro, MaestroTable } from '@/modules/maestros';
 */

export { maestrosService } from './services';
export type { MaestrosService } from './services';

export * from './hooks';
export * from './components';
export * from './types/maestro.types';
