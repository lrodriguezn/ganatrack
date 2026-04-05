// Reportes DTOs - All filter and response DTOs for 5 report types + export

import type { ExportFormato, ReporteFiltros, ReporteTipo } from '../../domain/entities/reporte-exportacion.entity.js'

// ============================================================================
// Filter DTOs
// ============================================================================

export interface ReporteFiltrosDto {
  fechaInicio?: string  // YYYY-MM-DD
  fechaFin?: string     // YYYY-MM-DD
  potreroId?: number
  categoriaId?: number
  razaId?: number
}

export interface ExportRequestDto {
  tipo: ReporteTipo
  formato: ExportFormato
  filtros?: ReporteFiltrosDto
}

// ============================================================================
// Inventario Report DTOs
// ============================================================================

export interface InventarioReportResumenDto {
  totalAnimales: number
  porCategoria: Array<{ categoria: string; cantidad: number }>
  porRaza: Array<{ raza: string; cantidad: number }>
  porPotrero: Array<{ potrero: string; cantidad: number }>
}

export interface InventarioDetalleDto {
  animalId: number
  codigo: string
  nombre: string
  categoria: string
  raza: string
  potrero: string
  estado: string
}

export interface InventarioReportDto {
  resumen: InventarioReportResumenDto
  detalle: InventarioDetalleDto[]
}

// ============================================================================
// Reproductivo Report DTOs
// ============================================================================

export interface ReproductivoReportDto {
  tasaConcepcion: number
  serviciosPorMes: Array<{ mes: string; servicios: number; concepciones: number }>
  intervaloPartosPromedio: number
  detallesServicio: Array<{
    fecha: string
    tipo: string
    animalCodigo: string
    resultado: string
  }>
}

// ============================================================================
// Mortalidad Report DTOs
// ============================================================================

export interface MortalidadReportDto {
  totalMuertes: number
  porCausa: Array<{ causa: string; cantidad: number; porcentaje: number }>
  porRangoEdad: Array<{ rango: string; cantidad: number; porcentaje: number }>
  tendenciaMensual: Array<{ mes: string; muertes: number }>
}

// ============================================================================
// Movimiento Report DTOs
// ============================================================================

export interface MovimientoReportDto {
  totalCompras: number
  totalVentas: number
  saldoNeto: number
  porMes: Array<{ mes: string; compras: number; ventas: number; saldo: number }>
  detalles: Array<{
    fecha: string
    tipo: 'compra' | 'venta'
    animalCodigo: string
    precio: number
    peso: number
  }>
}

// ============================================================================
// Sanitario Report DTOs
// ============================================================================

export interface SanitarioReportDto {
  eventosPorTipo: Array<{ tipo: string; cantidad: number }>
  vacunacionesPendientes: Array<{
    animalCodigo: string
    vacuna: string
    fechaUltima: string
    proximaFecha: string
  }>
  tratamientosAplicados: Array<{
    fecha: string
    animalCodigo: string
    diagnostico: string
    tratamiento: string
    producto: string
  }>
}

// ============================================================================
// Dashboard KPI DTO
// ============================================================================

export interface DashboardKpisDto {
  totalAnimales: number
  enOrdeno: number
  tasaPrenez: number
  mortalidadMensual: number
  comprasMes: number
  ventasMes: number
}

// ============================================================================
// Export Job DTOs
// ============================================================================

export interface ExportJobResponseDto {
  jobId: number
  tipo: ReporteTipo
  formato: ExportFormato
  estado: 'pendiente' | 'procesando' | 'completado' | 'fallido'
  progreso: number
  rutaArchivo: string | null
  createdAt: string
  error?: string
}

export interface ExportJobListDto {
  jobs: ExportJobResponseDto[]
  page: number
  limit: number
  total: number
}

export interface ExportStatusDto {
  jobId: number
  status: 'pendiente' | 'procesando' | 'completado' | 'fallido'
  progress: number
  downloadUrl?: string
  error?: string
}

// ============================================================================
// Count Report Data DTO
// ============================================================================

export interface CountReportDataDto {
  tipo: ReporteTipo
  count: number
  estimatedTime: number  // seconds
  requiresAsync: boolean  // true if count >= 1000
}

// ============================================================================
// Generic Report Response
// ============================================================================

export interface ReporteResponseDto {
  tipo: ReporteTipo
  resumen: {
    totalAnimales: number
    periodoAnalizado: string
    predioNombre: string
  }
  generadoEn: string
  data: InventarioReportDto | ReproductivoReportDto | MortalidadReportDto | MovimientoReportDto | SanitarioReportDto
}
