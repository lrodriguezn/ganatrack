// apps/web/src/modules/servicios/index.ts
/**
 * Servicios Module — barrel export.
 *
 * Re-exports all public interfaces, hooks, services, and components.
 */

// Types
export type {
  EventoGrupal,
  PalpacionEvento,
  PalpacionAnimal,
  CreatePalpacionEventoDto,
  CreatePalpacionAnimalDto,
  InseminacionEvento,
  InseminacionAnimal,
  CreateInseminacionEventoDto,
  CreateInseminacionAnimalDto,
  Parto,
  CreatePartoDto,
  TipoParto,
  PaginationParams,
  PaginatedEventos,
  PalpacionesKPIs,
  PartosKPIs,
} from './types/servicios.types';

// Services
export { serviciosService } from './services';
export type { ServiciosService } from './services';

// Hooks
export { usePalpaciones } from './hooks/use-palpaciones';
export { usePalpacion } from './hooks/use-palpacion';
export { useCreatePalpacion } from './hooks/use-create-palpacion';
export { useInseminaciones } from './hooks/use-inseminaciones';
export { useInseminacion } from './hooks/use-inseminacion';
export { useCreateInseminacion } from './hooks/use-create-inseminacion';
export { usePartos } from './hooks/use-partos';
export { useCreateParto } from './hooks/use-create-parto';
export { useServiciosVeterinarios } from './hooks/use-servicios-veterinarios';
export { useServicioVeterinario } from './hooks/use-servicio-veterinario';
export { useCreateServicioVeterinario } from './hooks/use-create-servicio-veterinario';

// Components
export { AnimalSelector } from './components/animal-selector';
export { PalpacionesTable } from './components/palpaciones-table';
export { InseminacionesTable } from './components/inseminaciones-table';
export { PartosTable } from './components/partos-table';
export { ServiciosVeterinariosTable } from './components/servicios-veterinarios-table';
export { ServicioGrupalWizard } from './components/servicio-grupal-wizard';
export {
  PalpacionEventoForm,
  PalpacionAnimalesStep,
  PalpacionResultadosStep,
  type PalpacionEventoFormRef,
  isDiagnosticoPositiva,
} from './components/palpacion-form';
export {
  InseminacionEventoForm,
  InseminacionResultadosStep,
  type InseminacionEventoFormRef,
} from './components/inseminacion-form';
export { PartoForm } from './components/parto-form';
