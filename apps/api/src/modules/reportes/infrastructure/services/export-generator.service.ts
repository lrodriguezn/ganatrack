import { injectable, inject } from 'tsyringe'
import type { IExportGenerator } from '../../domain/services/export-generator.service.js'
import type { ReporteTipo, ExportFormato, ReporteFiltros } from '../../domain/entities/reporte-exportacion.entity.js'
import { PDF_GENERATOR } from '../../domain/services/export-generator.service.js'
import type { IPdfGenerator as IPdfGen } from '../../domain/services/export-generator.service.js'
import { EXCEL_GENERATOR } from '../../domain/services/export-generator.service.js'
import type { IExcelGenerator as IExcelGen } from '../../domain/services/export-generator.service.js'
import { CSV_GENERATOR } from '../../domain/services/export-generator.service.js'
import type { ICsvGenerator as ICsvGen } from '../../domain/services/export-generator.service.js'

@injectable()
export class ExportGeneratorService implements IExportGenerator {
  constructor(
    @inject(PDF_GENERATOR) private readonly pdfGenerator: IPdfGen,
    @inject(EXCEL_GENERATOR) private readonly excelGenerator: IExcelGen,
    @inject(CSV_GENERATOR) private readonly csvGenerator: ICsvGen,
  ) {}

  async generate(
    tipo: ReporteTipo,
    formato: ExportFormato,
    _filtros: ReporteFiltros,
    data: unknown
  ): Promise<Buffer> {
    switch (formato) {
      case 'pdf':
        return this.pdfGenerator.generate(data)
      case 'xlsx':
        return this.excelGenerator.generate(tipo, formato, _filtros, data)
      case 'csv':
        return this.csvGenerator.generate(data)
      case 'json':
        return Buffer.from(JSON.stringify(data, null, 2))
      default:
        return Buffer.from(JSON.stringify(data, null, 2))
    }
  }

  getFileExtension(formato: ExportFormato): string {
    switch (formato) {
      case 'pdf':
        return 'pdf'
      case 'xlsx':
        return 'xlsx'
      case 'csv':
        return 'csv'
      case 'json':
        return 'json'
      default:
        return 'json'
    }
  }

  getMimeType(formato: ExportFormato): string {
    switch (formato) {
      case 'pdf':
        return 'application/pdf'
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'csv':
        return 'text/csv'
      case 'json':
        return 'application/json'
      default:
        return 'application/json'
    }
  }
}
