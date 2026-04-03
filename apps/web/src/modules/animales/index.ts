// apps/web/src/modules/animales/index.ts
/**
 * Animales Module — barrel export.
 *
 * Re-exports all public interfaces, hooks, services, and components.
 */

// Types
export type {
  Animal,
  CreateAnimalDto,
  UpdateAnimalDto,
  AnimalEstadisticas,
  CambioEstadoDto,
  Genealogia,
  HistorialEvento,
  PaginatedAnimales,
  AnimalFilters,
} from './types/animal.types';

// Services
export { animalService } from './services';
export type { AnimalService } from './services';

// Hooks
export { useAnimales } from './hooks/use-animales';
export { useAnimal } from './hooks/use-animal';
export { useCreateAnimal } from './hooks/use-create-animal';
export { useGenealogia } from './hooks/use-genealogia';

// Components
export { AnimalForm } from './components/animal-form';
export { AnimalTable } from './components/animal-table';
export { AnimalDetailTabs } from './components/animal-detail-tabs';
export { GenealogiaTree } from './components/genealogia-tree';
export { EstadoChangeModal } from './components/estado-change-modal';
export { BulkActionsBar } from './components/bulk-actions-bar';