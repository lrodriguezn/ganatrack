import { injectable, inject } from 'tsyringe'
import type { ReporteTipo, ExportFormato, ReporteFiltros } from '../../domain/entities/reporte-exportacion.entity.js'
import { FILE_STORAGE } from '../../domain/services/file-storage.service.js'
import type { IFileStorage } from '../../domain/services/file-storage.service.js'
import { EXPORT_GENERATOR } from '../../domain/services/export-generator.service.js'
import type { IExportGenerator } from '../../domain/services/export-generator.service.js'
import { GetInventarioReportUseCase } from './get-inventario-report.use-case.js'
import { GetReproductivoReportUseCase } from './get-reproductivo-report.use-case.js'
import { GetMortalidadReportUseCase } from './get-mortalidad-report.use-case.js'
import { GetMovimientoReportUseCase } from './get-movimiento-report.use-case.js'
import { GetSanitarioReportUseCase } from './get-sanitario-report.use-case.js'

@injectable()
export class GenerateSyncExportUseCase {
  constructor(
    @inject(FILE_STORAGE) private readonly fileStorage: IFileStorage,
    @inject(EXPORT_GENERATOR) private readonly exportGenerator: IExportGenerator,
    private readonly getInventarioReport: GetInventarioReportUseCase,
    private readonly getReproductivoReport: GetReproductivoReportUseCase,
    private readonly getMortalidadReport: GetMortalidadReportUseCase,
    private readonly getMovimientoReport: GetMovimientoReportUseCase,
    private readonly getSanitarioReport: GetSanitarioReportUseCase,
  ) {}

  async execute(
    tipo: ReporteTipo,
    formato: ExportFormato,
    filtros: ReporteFiltros,
    usuarioId: number,
    filepath: string
  ): Promise<{ filePath: string; recordCount: number }> {
    // Get the report data based on type
    let data: unknown
    let recordCount = 0

    switch (tipo) {
      case 'inventario': {
        const report = await this.getInventarioReport.execute((filtros as any).predioId as number, filtros)
        data = report
        recordCount = report.detalle.length
        break
      }
      case 'reproductivo': {
        const report = await this.getReproductivoReport.execute((filtros as any).predioId as number, filtros)
        data = report
        recordCount = report.detallesServicio.length
        break
      }
      case 'mortalidad': {
        const report = await this.getMortalidadReport.execute((filtros as any).predioId as number, filtros)
        data = report
        recordCount = report.totalMuertes
        break
      }
      case 'movimiento': {
        const report = await this.getMovimientoReport.execute((filtros as any).predioId as number, filtros)
        data = report
        recordCount = report.detalles.length
        break
      }
      case 'sanitario': {
        const report = await this.getSanitarioReport.execute((filtros as any).predioId as number, filtros)
        data = report
        recordCount = report.tratamientosAplicados.length
        break
      }
      default:
        data = {}
    }

    // Generate the export file
    const buffer = await this.exportGenerator.generate(tipo, formato, filtros, data)

    // Save to file storage
    await this.fileStorage.save(filepath, buffer)

    return { filePath: filepath, recordCount }
  }
}
