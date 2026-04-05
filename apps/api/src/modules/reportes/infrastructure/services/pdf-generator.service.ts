import { injectable } from 'tsyringe'
import PDFDocument from 'pdfkit'
import type { IPdfGenerator } from '../../domain/services/export-generator.service.js'
import type { ReporteTipo, ReporteFiltros } from '../../domain/entities/reporte-exportacion.entity.js'

@injectable()
export class PdfGeneratorService implements IPdfGenerator {
  async generate(data: unknown): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 })
        const chunks: Buffer[] = []

        doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        this.buildDocument(doc, data)
        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private buildDocument(doc: PDFKit.PDFDocument, data: unknown): void {
    // Title
    doc.fontSize(20).text('GanaTrack - Reporte', { align: 'center' })
    doc.moveDown()

    // Generation date
    doc.fontSize(10).fillColor('gray')
    doc.text(`Generado: ${new Date().toISOString()}`, { align: 'right' })
    doc.moveDown()
    doc.fillColor('black')

    if (typeof data === 'object' && data !== null) {
      this.renderObject(doc, data, 0)
    }
  }

  private renderObject(doc: PDFKit.PDFDocument, obj: unknown, depth: number): void {
    if (depth > 3) return // Prevent infinite recursion

    const indent = '  '.repeat(depth)

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          this.renderObject(doc, item, depth)
        } else {
          doc.text(`${indent}${item}`)
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
          continue
        }

        if (typeof value === 'object') {
          doc.fontSize(12).font('Helvetica-Bold').text(`${indent}${key}:`)
          this.renderObject(doc, value, depth + 1)
        } else {
          doc.fontSize(10).font('Helvetica').text(`${indent}${key}: ${String(value)}`)
        }
      }
    } else {
      doc.text(`${indent}${String(obj)}`)
    }
  }
}
