// apps/web/src/modules/servicios/components/index.ts
/**
 * Servicios Components — barrel export.
 */

export { AnimalSelector } from './animal-selector';
export { PalpacionesTable } from './palpaciones-table';
export { InseminacionesTable } from './inseminaciones-table';
export { PartosTable } from './partos-table';
export { ServicioGrupalWizard } from './servicio-grupal-wizard';
export {
  PalpacionEventoForm,
  PalpacionAnimalesStep,
  PalpacionResultadosStep,
  type PalpacionEventoFormRef,
  isDiagnosticoPositiva,
} from './palpacion-form';
export {
  InseminacionEventoForm,
  InseminacionResultadosStep,
  type InseminacionEventoFormRef,
} from './inseminacion-form';
export { PartoForm } from './parto-form';
