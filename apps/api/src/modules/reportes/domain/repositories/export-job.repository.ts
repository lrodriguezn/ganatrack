import type { ReporteExportacionEntity, ReporteFiltros, ExportEstado } from '../entities/reporte-exportacion.entity.js'

export interface IExportJobRepository {
  // Create a new export job
  create(data: {
    tipo: string
    formato: string
    parametros: string | null
    predioId: number
    usuarioId: number
  }): Promise<ReporteExportacionEntity>

  // Find by ID with tenant isolation
  findById(id: number, predioId: number): Promise<ReporteExportacionEntity | null>

  // Find by ID with user ownership check
  findByIdAndUsuario(id: number, usuarioId: number): Promise<ReporteExportacionEntity | null>

  // List all jobs for a user (with pagination)
  findByUsuarioId(
    usuarioId: number,
    opts: { page: number; limit: number }
  ): Promise<{ data: ReporteExportacionEntity[]; total: number }>

  // List all jobs for a tenant (with pagination)
  findByPredioId(
    predioId: number,
    opts: { page: number; limit: number }
  ): Promise<{ data: ReporteExportacionEntity[]; total: number }>

  // Update job status
  updateStatus(id: number, estado: ExportEstado, rutaArchivo?: string): Promise<void>

  // Soft delete a job
  softDelete(id: number, usuarioId: number): Promise<boolean>
}

export const EXPORT_JOB_REPOSITORY = Symbol('IExportJobRepository')
