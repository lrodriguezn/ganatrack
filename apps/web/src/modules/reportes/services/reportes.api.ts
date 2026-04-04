// apps/web/src/modules/reportes/services/reportes.api.ts
/**
 * Real Reportes Service — production API calls.
 *
 * All endpoints are relative to /api/v1
 * Uses apiClient from @/shared/lib/api-client
 */

import { apiClient } from '@/shared/lib/api-client';
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
import type { ReportesService } from './reportes.service';

export class RealReportesService implements ReportesService {
  async getDashboardKPIs(predioId: number): Promise<DashboardKPIs> {
    const response = await apiClient.get('dashboard/kpi', {
      searchParams: { predio_id: predioId },
    });
    return response.json() as Promise<DashboardKPIs>;
  }

  async getInventario(filtros: ReporteFiltros): Promise<ReporteData<InventarioGraficos>> {
    const response = await apiClient.get('reportes/inventario', {
      searchParams: filtros,
    });
    return response.json() as Promise<ReporteData<InventarioGraficos>>;
  }

  async getReproductivo(filtros: ReporteFiltros): Promise<ReporteData<ReproductivoGraficos>> {
    const response = await apiClient.get('reportes/reproductivo', {
      searchParams: filtros,
    });
    return response.json() as Promise<ReporteData<ReproductivoGraficos>>;
  }

  async getMortalidad(filtros: ReporteFiltros): Promise<ReporteData<MortalidadGraficos>> {
    const response = await apiClient.get('reportes/mortalidad', {
      searchParams: filtros,
    });
    return response.json() as Promise<ReporteData<MortalidadGraficos>>;
  }

  async getMovimiento(filtros: ReporteFiltros): Promise<ReporteData<MovimientoGraficos>> {
    const response = await apiClient.get('reportes/movimiento', {
      searchParams: filtros,
    });
    return response.json() as Promise<ReporteData<MovimientoGraficos>>;
  }

  async getSanitario(filtros: ReporteFiltros): Promise<ReporteData<SanitarioGraficos>> {
    const response = await apiClient.get('reportes/sanitario', {
      searchParams: filtros,
    });
    return response.json() as Promise<ReporteData<SanitarioGraficos>>;
  }

  async exportar(
    tipo: string,
    request: ExportRequest,
  ): Promise<{ jobId: string }> {
    const response = await apiClient.post(`reportes/${tipo}/exportar`, {
      json: request,
    });
    return response.json() as Promise<{ jobId: string }>;
  }

  async getExportStatus(jobId: string): Promise<ExportJob> {
    const response = await apiClient.get(`exportar/${jobId}/status`);
    return response.json() as Promise<ExportJob>;
  }

  async downloadExport(downloadUrl: string): Promise<Blob> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  }
}
