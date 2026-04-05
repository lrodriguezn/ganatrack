import { injectable, inject } from 'tsyringe'
import { eq, and, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { animales, serviciosInseminacionAnimales, serviciosInseminacionGrupal, serviciosVeterinariosAnimales, serviciosVeterinariosGrupal } from '@ganatrack/database/schema'
import type { ReporteTipo } from '../../domain/entities/reporte-exportacion.entity.js'
import type { ReporteFiltrosDto, CountReportDataDto } from '../dtos/reportes.dto.js'

// Threshold for determining if export should be async
const ASYNC_THRESHOLD = 1000

@injectable()
export class CountReportDataUseCase {
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async execute(tipo: ReporteTipo, predioId: number, filtros?: ReporteFiltrosDto): Promise<CountReportDataDto> {
    let count = 0

    switch (tipo) {
      case 'inventario':
        count = await this.countInventario(predioId, filtros)
        break
      case 'reproductivo':
        count = await this.countReproductivo(predioId, filtros)
        break
      case 'mortalidad':
        count = await this.countMortalidad(predioId, filtros)
        break
      case 'movimiento':
        count = await this.countMovimiento(predioId, filtros)
        break
      case 'sanitario':
        count = await this.countSanitario(predioId, filtros)
        break
      default:
        count = 0
    }

    // Estimate time based on count (rough estimate: 100 records per second)
    const estimatedTime = Math.ceil(count / 100)
    const requiresAsync = count >= ASYNC_THRESHOLD

    return {
      tipo,
      count,
      estimatedTime,
      requiresAsync,
    }
  }

  private async countInventario(predioId: number, filtros?: ReporteFiltrosDto): Promise<number> {
    const conditions = [eq(animales.predioId, predioId), eq(animales.activo, 1)]
    if (filtros?.potreroId) {
      conditions.push(eq(animales.potreroId, filtros.potreroId))
    }
    if (filtros?.razaId) {
      conditions.push(eq(animales.configRazasId, filtros.razaId))
    }

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(animales)
      .where(and(...conditions))
    return total
  }

  private async countReproductivo(predioId: number, _filtros?: ReporteFiltrosDto): Promise<number> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(serviciosInseminacionAnimales)
      .innerJoin(
        serviciosInseminacionGrupal,
        eq(serviciosInseminacionGrupal.id, serviciosInseminacionAnimales.inseminacionGrupalId)
      )
      .where(eq(serviciosInseminacionGrupal.predioId,predioId))
    return total
  }

  private async countMortalidad(predioId: number, _filtros?: ReporteFiltrosDto): Promise<number> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(animales)
      .where(and(eq(animales.predioId, predioId), eq(animales.indDescartado, 1)))
    return total
  }

  private async countMovimiento(predioId: number, _filtros?: ReporteFiltrosDto): Promise<number> {
    // Count animals with purchases
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(animales)
      .where(eq(animales.predioId, predioId))
    return total
  }

  private async countSanitario(predioId: number, _filtros?: ReporteFiltrosDto): Promise<number> {
    // serviciosVeterinariosAnimales no tiene predicado directamente, se filtra via grupal
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(serviciosVeterinariosAnimales)
      .innerJoin(
        serviciosVeterinariosGrupal,
        eq(serviciosVeterinariosGrupal.id, serviciosVeterinariosAnimales.servicioGrupalId)
      )
      .where(eq(serviciosVeterinariosGrupal.predioId,predioId))
    return total
  }
}
