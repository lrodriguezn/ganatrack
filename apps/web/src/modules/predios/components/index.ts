// apps/web/src/modules/predios/components/index.ts
/**
 * Predios Components — barrel export for all predios-related components.
 *
 * Includes:
 * - Phase 4: PredioTable, PredioForm, PredioDetail, PredioDeleteModal
 * - Phase 5: PotrerosTable, PotreroForm, LotesTable, LoteForm,
 *            GruposTable, GrupoForm, SectoresTable, SectorForm
 *
 * Usage:
 *   import { PredioTable, PredioForm, PredioDetail, PredioDeleteModal } from '@/modules/predios/components';
 */

// Phase 4 — Predio Components
export { PredioTable } from './predio-table';
export { PredioForm, predioToFormDefaults } from './predio-form';
export { PredioDetail } from './predio-detail';
export { PredioDeleteModal } from './predio-delete-modal';

// Phase 5 — Sub-recursos Tables
export { PotrerosTable } from './potreros-table';
export { LotesTable } from './lotes-table';
export { GruposTable } from './grupos-table';
export { SectoresTable } from './sectores-table';

// Phase 5 — Sub-recursos Forms
export { PotreroForm } from './potrero-form';
export { LoteForm } from './lote-form';
export { GrupoForm } from './grupo-form';
export { SectorForm } from './sector-form';
