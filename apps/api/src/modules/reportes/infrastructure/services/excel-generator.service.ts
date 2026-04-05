import { injectable } from 'tsyringe'
import ExcelJS from 'exceljs'
import type { IExcelGenerator } from '../../domain/services/export-generator.service.js'
import type { ReporteTipo, ReporteFiltros } from '../../domain/entities/reporte-exportacion.entity.js'

@injectable()
export class ExcelGeneratorService implements IExcelGenerator {
  async generate(tipo: ReporteTipo, formato: 'xlsx', filtros: ReporteFiltros, data: unknown): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'GanaTrack'
    workbook.created = new Date()

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Resumen')
    this.addSummarySheet(summarySheet, tipo, filtros)

    // Add data sheet based on report type
    this.addDataSheet(workbook, tipo, data)

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer as ArrayBuffer)
  }

  private addSummarySheet(sheet: ExcelJS.Worksheet, tipo: ReporteTipo, filtros: ReporteFiltros): void {
    sheet.columns = [
      { header: 'Campo', key: 'campo', width: 25 },
      { header: 'Valor', key: 'valor', width: 40 },
    ]

    sheet.addRow({ campo: 'Tipo de Reporte', valor: this.getReportTypeLabel(tipo) })
    sheet.addRow({ campo: 'Fecha Generación', valor: new Date().toISOString() })
    
    if (filtros.fechaInicio) {
      sheet.addRow({ campo: 'Fecha Inicio', valor: filtros.fechaInicio })
    }
    if (filtros.fechaFin) {
      sheet.addRow({ campo: 'Fecha Fin', valor: filtros.fechaFin })
    }

    // Style header row
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    }
  }

  private addDataSheet(workbook: ExcelJS.Workbook, tipo: ReporteTipo, data: unknown): void {
    const sheetName = this.getSheetName(tipo)
    const sheet = workbook.addWorksheet(sheetName)

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>
      
      // Handle arrays
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          this.addArrayAsTable(sheet, key, value)
        } else {
          sheet.addRow({ campo: key, valor: String(value) })
        }
      }
    }

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = Math.max(15, column.width ?? 15)
    })
  }

  private addArrayAsTable(sheet: ExcelJS.Worksheet, name: string, rows: unknown[]): void {
    if (rows.length === 0) return

    // Add section header
    const headerRow = sheet.addRow([name])
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    }

    // If rows are objects, add them as table
    const firstRow = rows[0]
    if (typeof firstRow === 'object' && firstRow !== null) {
      const headers = Object.keys(firstRow as object)
      
      // Add headers
      const headerCols = headers.map(h => ({ header: h, key: h, width: 15 }))
      headerCols.forEach(col => sheet.columns.push(col as ExcelJS.Column))
      sheet.addRow(headers as unknown as ExcelJS.Row)

      // Add data rows
      for (const row of rows) {
        const values = headers.map(h => (row as Record<string, unknown>)[h])
        sheet.addRow(values as unknown as ExcelJS.Row)
      }
    } else {
      // Primitive array
      for (const item of rows) {
        sheet.addRow([item])
      }
    }
  }

  private getSheetName(tipo: ReporteTipo): string {
    const names: Record<ReporteTipo, string> = {
      inventario: 'Inventario',
      reproductivo: 'Reproductivo',
      mortalidad: 'Mortalidad',
      movimiento: 'Movimiento',
      sanitario: 'Sanitario',
    }
    return names[tipo] ?? 'Datos'
  }

  private getReportTypeLabel(tipo: ReporteTipo): string {
    const labels: Record<ReporteTipo, string> = {
      inventario: 'Reporte de Inventario',
      reproductivo: 'Reporte Reproductivo',
      mortalidad: 'Reporte de Mortalidad',
      movimiento: 'Reporte de Movimiento',
      sanitario: 'Reporte Sanitario',
    }
    return labels[tipo] ?? 'Reporte'
  }
}
