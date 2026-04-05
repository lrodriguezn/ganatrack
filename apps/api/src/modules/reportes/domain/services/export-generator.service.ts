import type { ReporteTipo, ExportFormato, ReporteFiltros } from '../entities/reporte-exportacion.entity.js'

// Result of generating an export - contains the raw data to be formatted
export interface ExportDataResult {
  tipo: ReporteTipo
  filtros: ReporteFiltros
  data: unknown
  generatedAt: Date
}

// Interface for export generators (adapters pattern)
export interface IExportGenerator {
  // Generate export in the specified format
  generate(tipo: ReporteTipo, formato: ExportFormato, filtros: ReporteFiltros, data: unknown): Promise<Buffer>

  // Get the file extension for a format
  getFileExtension(formato: ExportFormato): string

  // Get the MIME type for a format
  getMimeType(formato: ExportFormato): string
}

export const EXPORT_GENERATOR = Symbol('IExportGenerator')

// Specific generator interfaces for each format
export interface IPdfGenerator {
  generate(data: unknown): Promise<Buffer>
}

export interface IExcelGenerator {
  generate(tipo: ReporteTipo, formato: 'xlsx', filtros: ReporteFiltros, data: unknown): Promise<Buffer>
}

export interface ICsvGenerator {
  generate(data: unknown): Promise<Buffer>
}

export const PDF_GENERATOR = Symbol('IPdfGenerator')
export const EXCEL_GENERATOR = Symbol('IExcelGenerator')
export const CSV_GENERATOR = Symbol('ICsvGenerator')
