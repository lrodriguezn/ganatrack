import { injectable } from 'tsyringe'
import type { ICsvGenerator } from '../../domain/services/export-generator.service.js'

@injectable()
export class CsvGeneratorService implements ICsvGenerator {
  async generate(data: unknown): Promise<Buffer> {
    if (Array.isArray(data)) {
      return this.generateFromArray(data)
    }
    return this.generateFromObject(data)
  }

  private generateFromArray(data: unknown[]): Buffer {
    if (data.length === 0) {
      return Buffer.from('')
    }

    const rows: string[] = []

    // Get headers from first object
    const firstItem = data[0]
    if (typeof firstItem === 'object' && firstItem !== null) {
      const headers = Object.keys(firstItem)
      rows.push(headers.join(','))

      // Generate CSV rows
      for (const item of data) {
        if (typeof item === 'object' && item !== null) {
          const values = headers.map(h => {
            const value = (item as Record<string, unknown>)[h]
            return this.escapeValue(value)
          })
          rows.push(values.join(','))
        }
      }
    } else {
      // Primitive array
      rows.push('value')
      for (const item of data) {
        rows.push(String(item))
      }
    }

    return Buffer.from(rows.join('\n'))
  }

  private generateFromObject(data: unknown): Buffer {
    const lines: string[] = []

    if (typeof data === 'object' && data !== null) {
      // Flatten nested objects
      const flatData = this.flattenObject(data)
      for (const [key, value] of Object.entries(flatData)) {
        lines.push(`${this.escapeValue(key)},${this.escapeValue(value)}`)
      }
    }

    return Buffer.from(lines.join('\n'))
  }

  private flattenObject(obj: unknown, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(result, this.flattenObject(value, newKey))
        } else {
          result[newKey] = value
        }
      }
    } else {
      result[prefix] = obj
    }

    return result
  }

  private escapeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return ''
    }
    const str = String(value)
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
}
