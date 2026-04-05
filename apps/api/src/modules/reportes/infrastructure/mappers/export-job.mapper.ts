import type { ReporteExportacionEntity } from '../../domain/entities/reporte-exportacion.entity.js'
import type { ExportJobResponseDto } from '../../application/dtos/reportes.dto.js'

export class ExportJobMapper {
  static toResponse(entity: ReporteExportacionEntity): ExportJobResponseDto {
    return {
      jobId: entity.id,
      tipo: entity.tipo as ExportJobResponseDto['tipo'],
      formato: entity.formato as ExportJobResponseDto['formato'],
      estado: entity.estado as ExportJobResponseDto['estado'],
      progreso: entity.estado === 'completado' ? 100 : entity.estado === 'procesando' ? 50 : 0,
      rutaArchivo: entity.rutaArchivo,
      createdAt: entity.createdAt?.toISOString() ?? new Date().toISOString(),
    }
  }

  static toParams(entity: ReporteExportacionEntity): Record<string, unknown> {
    if (!entity.parametros) return {}
    try {
      return JSON.parse(entity.parametros)
    } catch {
      return {}
    }
  }
}
