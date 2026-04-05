// ReporteExportacion entity - represents an export job
export interface ReporteExportacionEntity {
  id: number
  tipo: ReporteTipo        // inventario|reproductivo|mortalidad|movimiento|sanitario
  formato: ExportFormato    // json|pdf|xlsx|csv
  estado: ExportEstado     // pendiente|procesando|completado|fallido
  rutaArchivo: string | null
  parametros: string | null  // JSON string with applied filters
  // Tenant isolation
  predioId: number
  usuarioId: number
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}

export type ReporteTipo = 'inventario' | 'reproductivo' | 'mortalidad' | 'movimiento' | 'sanitario'
export type ExportFormato = 'json' | 'pdf' | 'xlsx' | 'csv'
export type ExportEstado = 'pendiente' | 'procesando' | 'completado' | 'fallido'

// Filter options for reports
export interface ReporteFiltros {
  fechaInicio?: string  // YYYY-MM-DD
  fechaFin?: string     // YYYY-MM-DD
  potreroId?: number
  categoriaId?: number
  razaId?: number
  predioId?: number     // predio ID for export jobs
}
