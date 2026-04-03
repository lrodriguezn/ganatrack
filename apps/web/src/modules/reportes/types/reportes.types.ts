// apps/web/src/modules/reportes/types/reportes.types.ts
/**
 * Reportes Types — TypeScript interfaces for the reporting module.
 *
 * Covers: filters, KPIs, report data shapes, chart primitives, export jobs.
 */

// ============================================================================
// Filtros compartidos
// ============================================================================

export interface ReporteFiltros {
  predioId: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;
}

// ============================================================================
// KPI Dashboard
// ============================================================================

export interface DashboardKPIs {
  totalAnimales: number;
  enOrdeno: number;
  tasaPrenez: number;        // porcentaje
  mortalidadMensual: number; // porcentaje
  comprasMes: number;
  ventasMes: number;
}

// ============================================================================
// Respuesta genérica de reporte
// ============================================================================

export interface ReporteResumen {
  totalAnimales: number;
  periodoAnalizado: string;
  predioNombre: string;
}

export interface ReporteData<T> {
  resumen: ReporteResumen;
  graficos: T;
  generadoEn: string; // ISO timestamp
}

// ============================================================================
// Chart data primitives
// ============================================================================

export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesItem {
  date: string;
  values: Record<string, number>;
}

// ============================================================================
// Inventario
// ============================================================================

export interface InventarioGraficos {
  porPredio: ChartDataItem[];
  porRaza: ChartDataItem[];
  porEstado: ChartDataItem[];
  porSexo: ChartDataItem[];
}

// ============================================================================
// Reproductivo
// ============================================================================

export interface ReproductivoGraficos {
  tasaConcepcion: ChartDataItem[];
  serviciosPorMes: TimeSeriesItem[];
  intervaloPartos: ChartDataItem[];
  tasaPrenezMensual: TimeSeriesItem[];
}

// ============================================================================
// Mortalidad
// ============================================================================

export interface MortalidadGraficos {
  porCausa: ChartDataItem[];
  porRangoEdad: ChartDataItem[];
  tendenciaMensual: TimeSeriesItem[];
}

// ============================================================================
// Movimiento
// ============================================================================

export interface MovimientoGraficos {
  comprasVsVentas: TimeSeriesItem[];
  saldoAnimales: TimeSeriesItem[];
  costosPorMes: TimeSeriesItem[];
}

// ============================================================================
// Sanitario
// ============================================================================

export interface SanitarioGraficos {
  eventosPorTipo: ChartDataItem[];
  vacunaciones: TimeSeriesItem[];
  tratamientos: TimeSeriesItem[];
}

// ============================================================================
// Exportación
// ============================================================================

export type ExportFormato = 'pdf' | 'excel' | 'csv';

export interface ExportRequest {
  formato: ExportFormato;
  filtros: ReporteFiltros;
}

export interface ExportJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;         // 0-100
  downloadUrl?: string;
  error?: string;
  estimatedTime?: number;   // segundos
}

// ============================================================================
// Exportación interna — estado de polling
// ============================================================================

export interface ExportacionState {
  jobId: string;
  tipo: string;
  formato: ExportFormato;
  status: ExportJob['status'];
  progress: number;
  attempts: number;
  startedAt: number;
  error?: string;
  filtros?: ReporteFiltros;
}
