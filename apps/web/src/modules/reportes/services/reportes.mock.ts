// apps/web/src/modules/reportes/services/reportes.mock.ts
/**
 * Mock Reportes Service — simulates reporting API for development.
 *
 * Returns realistic mock data for dashboard KPIs and all report types.
 * Simulated delays: ~300ms for KPIs, ~500ms for reports.
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
import type { ReportesService } from './reportes.service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockReportesService implements ReportesService {
  async getDashboardKPIs(predioId: number): Promise<DashboardKPIs> {
    await delay(300);
    return {
      totalAnimales: 245 + (predioId * 10),
      enOrdeno: 87,
      tasaPrenez: 62.5,
      mortalidadMensual: 1.8,
      comprasMes: 12,
      ventasMes: 5,
    };
  }

  async getInventario(filtros: ReporteFiltros): Promise<ReporteData<InventarioGraficos>> {
    await delay(500);
    return {
      resumen: {
        totalAnimales: 245,
        periodoAnalizado: `${filtros.fechaInicio} → ${filtros.fechaFin}`,
        predioNombre: 'Finca La Esperanza',
      },
      graficos: {
        porPredio: [
          { label: 'Potrero Norte', value: 85, color: '#10b981' },
          { label: 'Potrero Sur', value: 62, color: '#3b82f6' },
          { label: 'Potrero Este', value: 58, color: '#f59e0b' },
          { label: 'Potrero Oeste', value: 40, color: '#8b5cf6' },
        ],
        porRaza: [
          { label: 'Gyr', value: 78, color: '#10b981' },
          { label: 'Holstein', value: 65, color: '#3b82f6' },
          { label: 'Jersey', value: 52, color: '#f59e0b' },
          { label: 'Criollo', value: 30, color: '#8b5cf6' },
          { label: 'F1', value: 20, color: '#ec4899' },
        ],
        porEstado: [
          { label: 'Activo', value: 220, color: '#10b981' },
          { label: 'Vendido', value: 15, color: '#f59e0b' },
          { label: 'Muerto', value: 10, color: '#ef4444' },
        ],
        porSexo: [
          { label: 'Hembras', value: 145, color: '#ec4899' },
          { label: 'Machos', value: 100, color: '#3b82f6' },
        ],
      },
      generadoEn: new Date().toISOString(),
    };
  }

  async getReproductivo(filtros: ReporteFiltros): Promise<ReporteData<ReproductivoGraficos>> {
    await delay(500);
    return {
      resumen: {
        totalAnimales: 145,
        periodoAnalizado: `${filtros.fechaInicio} → ${filtros.fechaFin}`,
        predioNombre: 'Finca La Esperanza',
      },
      graficos: {
        tasaConcepcion: [
          { label: 'IA', value: 58, color: '#3b82f6' },
          { label: 'Monta natural', value: 72, color: '#10b981' },
        ],
        serviciosPorMes: [
          { date: '2025-01', values: { ia: 12, monta: 8 } },
          { date: '2025-02', values: { ia: 15, monta: 6 } },
          { date: '2025-03', values: { ia: 10, monta: 11 } },
          { date: '2025-04', values: { ia: 18, monta: 5 } },
          { date: '2025-05', values: { ia: 14, monta: 9 } },
          { date: '2025-06', values: { ia: 16, monta: 7 } },
        ],
        intervaloPartos: [
          { label: '< 12 meses', value: 25, color: '#10b981' },
          { label: '12-14 meses', value: 45, color: '#3b82f6' },
          { label: '15-16 meses', value: 20, color: '#f59e0b' },
          { label: '> 16 meses', value: 10, color: '#ef4444' },
        ],
        tasaPrenezMensual: [
          { date: '2025-01', values: { prenez: 55 } },
          { date: '2025-02', values: { prenez: 58 } },
          { date: '2025-03', values: { prenez: 60 } },
          { date: '2025-04', values: { prenez: 62 } },
          { date: '2025-05', values: { prenez: 61 } },
          { date: '2025-06', values: { prenez: 63 } },
        ],
      },
      generadoEn: new Date().toISOString(),
    };
  }

  async getMortalidad(filtros: ReporteFiltros): Promise<ReporteData<MortalidadGraficos>> {
    await delay(500);
    return {
      resumen: {
        totalAnimales: 245,
        periodoAnalizado: `${filtros.fechaInicio} → ${filtros.fechaFin}`,
        predioNombre: 'Finca La Esperanza',
      },
      graficos: {
        porCausa: [
          { label: 'Enfermedad', value: 4, color: '#ef4444' },
          { label: 'Accidente', value: 2, color: '#f59e0b' },
          { label: 'Parto', value: 1, color: '#8b5cf6' },
          { label: 'Otras', value: 3, color: '#6b7280' },
        ],
        porRangoEdad: [
          { label: '0-3 meses', value: 4, color: '#ef4444' },
          { label: '3-12 meses', value: 2, color: '#f59e0b' },
          { label: '1-3 años', value: 1, color: '#3b82f6' },
          { label: '> 3 años', value: 3, color: '#6b7280' },
        ],
        tendenciaMensual: [
          { date: '2025-01', values: { muertes: 2 } },
          { date: '2025-02', values: { muertes: 1 } },
          { date: '2025-03', values: { muertes: 3 } },
          { date: '2025-04', values: { muertes: 1 } },
          { date: '2025-05', values: { muertes: 2 } },
          { date: '2025-06', values: { muertes: 1 } },
        ],
      },
      generadoEn: new Date().toISOString(),
    };
  }

  async getMovimiento(filtros: ReporteFiltros): Promise<ReporteData<MovimientoGraficos>> {
    await delay(500);
    return {
      resumen: {
        totalAnimales: 245,
        periodoAnalizado: `${filtros.fechaInicio} → ${filtros.fechaFin}`,
        predioNombre: 'Finca La Esperanza',
      },
      graficos: {
        comprasVsVentas: [
          { date: '2025-01', values: { compras: 5, ventas: 2 } },
          { date: '2025-02', values: { compras: 3, ventas: 4 } },
          { date: '2025-03', values: { compras: 8, ventas: 1 } },
          { date: '2025-04', values: { compras: 2, ventas: 3 } },
          { date: '2025-05', values: { compras: 6, ventas: 2 } },
          { date: '2025-06', values: { compras: 4, ventas: 1 } },
        ],
        saldoAnimales: [
          { date: '2025-01', values: { saldo: 230 } },
          { date: '2025-02', values: { saldo: 229 } },
          { date: '2025-03', values: { saldo: 236 } },
          { date: '2025-04', values: { saldo: 235 } },
          { date: '2025-05', values: { saldo: 239 } },
          { date: '2025-06', values: { saldo: 245 } },
        ],
        costosPorMes: [
          { date: '2025-01', values: { costos: 15000000 } },
          { date: '2025-02', values: { costos: 12000000 } },
          { date: '2025-03', values: { costos: 22000000 } },
          { date: '2025-04', values: { costos: 8000000 } },
          { date: '2025-05', values: { costos: 18000000 } },
          { date: '2025-06', values: { costos: 14000000 } },
        ],
      },
      generadoEn: new Date().toISOString(),
    };
  }

  async getSanitario(filtros: ReporteFiltros): Promise<ReporteData<SanitarioGraficos>> {
    await delay(500);
    return {
      resumen: {
        totalAnimales: 245,
        periodoAnalizado: `${filtros.fechaInicio} → ${filtros.fechaFin}`,
        predioNombre: 'Finca La Esperanza',
      },
      graficos: {
        eventosPorTipo: [
          { label: 'Vacunación', value: 45, color: '#10b981' },
          { label: 'Desparasitación', value: 30, color: '#3b82f6' },
          { label: 'Tratamiento', value: 12, color: '#ef4444' },
          { label: 'Cirugía', value: 3, color: '#f59e0b' },
        ],
        vacunaciones: [
          { date: '2025-01', values: { aplicadas: 15 } },
          { date: '2025-02', values: { aplicadas: 8 } },
          { date: '2025-03', values: { aplicadas: 12 } },
          { date: '2025-04', values: { aplicadas: 20 } },
          { date: '2025-05', values: { aplicadas: 5 } },
          { date: '2025-06', values: { aplicadas: 10 } },
        ],
        tratamientos: [
          { date: '2025-01', values: { tratamientos: 3 } },
          { date: '2025-02', values: { tratamientos: 2 } },
          { date: '2025-03', values: { tratamientos: 5 } },
          { date: '2025-04', values: { tratamientos: 1 } },
          { date: '2025-05', values: { tratamientos: 4 } },
          { date: '2025-06', values: { tratamientos: 2 } },
        ],
      },
      generadoEn: new Date().toISOString(),
    };
  }

  async exportar(
    tipo: string,
    request: ExportRequest,
  ): Promise<{ jobId: string }> {
    await delay(400);
    return { jobId: `mock-job-${Date.now()}` };
  }

  async getExportStatus(jobId: string): Promise<ExportJob> {
    await delay(200);
    // Simulate progress over time
    const jobNum = parseInt(jobId.split('-').pop() || '0', 10);
    const elapsed = Date.now() - jobNum;
    const progress = Math.min(100, Math.floor(elapsed / 30));

    if (progress >= 100) {
      return {
        jobId,
        status: 'completed',
        progress: 100,
        downloadUrl: `/api/v1/exportar/${jobId}/download`,
      };
    }

    return {
      jobId,
      status: progress > 50 ? 'processing' : 'pending',
      progress,
      estimatedTime: Math.max(0, Math.floor((100 - progress) / 10)),
    };
  }

  async downloadExport(_downloadUrl: string): Promise<Blob> {
    await delay(300);
    // Return a mock blob
    return new Blob(['mock-export-data'], { type: 'application/octet-stream' });
  }
}

// ============================================================================
// Reset helper — for testing
// ============================================================================

/**
 * Reset mock state to initial values.
 * MockReportesService has no mutable state — this is a no-op for consistency
 * with the reset pattern used by other mock services.
 */
export function resetReportesMock(): void {
  // No mutable state to reset — all data is returned inline
}
