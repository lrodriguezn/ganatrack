import { injectable } from 'tsyringe'
import { eq, and, gte, lte } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosInseminacionAnimales, serviciosInseminacionGrupal, serviciosPartosAnimales, animales } from '@ganatrack/database/schema'
import type { ReproductivoReportDto, ReporteFiltrosDto } from '../dtos/reportes.dto.js'

@injectable()
export class GetReproductivoReportUseCase {
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async execute(predioId: number, filtros?: ReporteFiltrosDto): Promise<ReproductivoReportDto> {
    const fechaInicio = filtros?.fechaInicio ? new Date(filtros.fechaInicio) : new Date(new Date().getFullYear(), 0, 1)
    const fechaFin = filtros?.fechaFin ? new Date(filtros.fechaFin) : new Date()

    // Get inseminaciones via grupal join
    const inseminaciones = await this.db
      .select({
        id: serviciosInseminacionAnimales.id,
        fecha: serviciosInseminacionAnimales.fecha,
        diagnosticoId: serviciosInseminacionAnimales.diagnosticoId,
        animalId: serviciosInseminacionAnimales.animalId,
        inseminacionGrupalId: serviciosInseminacionAnimales.inseminacionGrupalId,
      })
      .from(serviciosInseminacionAnimales)
      .innerJoin(
        serviciosInseminacionGrupal,
        eq(serviciosInseminacionGrupal.id, serviciosInseminacionAnimales.inseminacionGrupalId)
      )
      .where(
        and(
          eq(serviciosInseminacionGrupal.predioId, predioId),
          gte(serviciosInseminacionAnimales.fecha, fechaInicio),
          lte(serviciosInseminacionAnimales.fecha, fechaFin)
        )
      )

    // Get partos directly by predio
    const partos = await this.db
      .select({
        id: serviciosPartosAnimales.id,
        fecha: serviciosPartosAnimales.fecha,
        animalId: serviciosPartosAnimales.animalId,
      })
      .from(serviciosPartosAnimales)
      .where(
        and(
          eq(serviciosPartosAnimales.predioId, predioId),
          gte(serviciosPartosAnimales.fecha, fechaInicio),
          lte(serviciosPartosAnimales.fecha, fechaFin)
        )
      )

    // Get animal codes
    const animalIds = [...new Set(inseminaciones.map((i: any) => i.animalId).filter(Boolean) as number[])]
    const animalsMap = new Map<number, string>()
    if (animalIds.length > 0) {
      const animalsData = await this.db
        .select({ id: animales.id, codigo: animales.codigo })
        .from(animales)
        .where(eq(animales.predioId, predioId))
      animalsData.forEach((a: any) => animalsMap.set(a.id, a.codigo))
    }

    // Calculate conception rate: diagnosticoId present indicates positive result
    const inseminacionesExitosas = inseminaciones.filter((i: any) => i.diagnosticoId != null).length
    const tasaConcepcion = inseminaciones.length > 0
      ? Math.round((inseminacionesExitosas / inseminaciones.length) * 100 * 100) / 100
      : 0

    // Group by month
    const serviciosPorMesMap = new Map<string, { servicios: number; concepciones: number }>()
    for (const ins of inseminaciones as any[]) {
      const mes = ins.fecha.toISOString().substring(0, 7)
      const current = serviciosPorMesMap.get(mes) ?? { servicios: 0, concepciones: 0 }
      current.servicios++
      if (ins.diagnosticoId != null) {
        current.concepciones++
      }
      serviciosPorMesMap.set(mes, current)
    }

    const serviciosPorMes = Array.from(serviciosPorMesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, data]) => ({ mes, ...data }))

    // Calculate average calving interval
    const partosPorAnimal = new Map<number, Date[]>()
    for (const parto of partos as any[]) {
      if (parto.animalId) {
        const lista = partosPorAnimal.get(parto.animalId) ?? []
        lista.push(parto.fecha)
        partosPorAnimal.set(parto.animalId, lista)
      }
    }

    let intervaloPartosPromedio = 0
    let totalIntervalos = 0
    let sumaIntervalos = 0
    for (const fechas of partosPorAnimal.values()) {
      fechas.sort((a: Date, b: Date) => a.getTime() - b.getTime())
      for (let i = 1; i < fechas.length; i++) {
        const fechaActual = fechas[i]
        const fechaAnterior = fechas[i - 1]
        if (!fechaActual || !fechaAnterior) continue
        const diffMonths = (fechaActual.getTime() - fechaAnterior.getTime()) / (1000 * 60 * 60 * 24 * 30)
        sumaIntervalos += diffMonths
        totalIntervalos++
      }
    }
    if (totalIntervalos > 0) {
      intervaloPartosPromedio = Math.round((sumaIntervalos / totalIntervalos) * 100) / 100
    }

    // Build details
    const detallesServicio = (inseminaciones as any[]).slice(0, 100).map((ins: any) => ({
      fecha: ins.fecha.toISOString(),
      tipo: 'Inseminación',
      animalCodigo: ins.animalId ? (animalsMap.get(ins.animalId) ?? `Animal ${ins.animalId}`) : 'N/A',
      resultado: ins.diagnosticoId != null ? 'Preñado' : 'Vacío',
    }))

    return {
      tasaConcepcion,
      serviciosPorMes,
      intervaloPartosPromedio,
      detallesServicio,
    }
  }
}
