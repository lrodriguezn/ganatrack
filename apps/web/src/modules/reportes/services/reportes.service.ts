// apps/web/src/modules/reportes/services/reportes.service.ts
/**
 * Reportes Service — API calls for dashboard KPIs, reports, and exports.
 *
 * All endpoints are relative to /api/v1
 * Uses apiClient from @/shared/lib/api-client
 *
 * Swaps between MockReportesService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealReportesService (production).
 */

import type {
  DashboardKPIs,
  ReporteData,
  ReporteFiltros,
  InventarioGraficos,
  ReproductivoGraficos,
  MortalidadGraficos,
  MovimientoGraficos,
  SanitarioGraficos,
  ExportRequest,
  ExportJob,
} from '../types/reportes.types';

// ============================================================================
// ReportesService Interface
// ============================================================================

export interface ReportesService {
  getDashboardKPIs(predioId: number): Promise<DashboardKPIs>;
  getInventario(filtros: ReporteFiltros): Promise<ReporteData<InventarioGraficos>>;
  getReproductivo(filtros: ReporteFiltros): Promise<ReporteData<ReproductivoGraficos>>;
  getMortalidad(filtros: ReporteFiltros): Promise<ReporteData<MortalidadGraficos>>;
  getMovimiento(filtros: ReporteFiltros): Promise<ReporteData<MovimientoGraficos>>;
  getSanitario(filtros: ReporteFiltros): Promise<ReporteData<SanitarioGraficos>>;
  exportar(tipo: string, request: ExportRequest): Promise<{ jobId: string }>;
  getExportStatus(jobId: string): Promise<ExportJob>;
  downloadExport(downloadUrl: string): Promise<Blob>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): ReportesService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockReportesService } = require('./reportes.mock');
  return new MockReportesService();
}

function createRealService(): ReportesService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealReportesService } = require('./reportes.api');
  return new RealReportesService();
}

/**
 * Reportes service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real when env var is not set (falsy).
 */
export const reportesService: ReportesService = USE_MOCKS
  ? createMockService()
  : createRealService();
