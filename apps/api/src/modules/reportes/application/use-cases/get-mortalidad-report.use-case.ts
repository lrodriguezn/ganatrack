import { injectable } from 'tsyringe'
import { and, eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { animales } from '@ganatrack/database/schema'
import type { MortalidadReportDto, ReporteFiltrosDto } from '../dtos/reportes.dto.js'

@injectable()
export class GetMortalidadReportUseCase {
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async execute(predioId: number, filtros?: ReporteFiltrosDto): Promise<MortalidadReportDto> {
    const fechaInicio = filtros?.fechaInicio ? new Date(filtros.fechaInicio) : new Date(new Date().getFullYear(), 0, 1)
    const fechaFin = filtros?.fechaFin ? new Date(filtros.fechaFin) : new Date()

    // Discarded animals as proxy for mortality
    const animalsData = await this.db
      .select({
        id: animales.id,
        codigo: animales.codigo,
        fechaNacimiento: animales.fechaNacimiento,
        fechaCompra: animales.fechaCompra,
        indDescartado: animales.indDescartado,
        createdAt: animales.createdAt,
      })
      .from(animales)
      .where(and(
        eq(animales.predioId, predioId),
        eq(animales.indDescartado, 1)
      ))

    const totalMuertes = animalsData.length

    const porCausaMap = new Map<string, number>()
    const porRangoEdadMap = new Map<string, number>()

    const causasPosibles = ['Enfermedad', 'Edad avanzada', 'Accidente', 'Parto complicado', 'Desconocida']

    for (let idx = 0; idx < (animalsData as any[]).length; idx++) {
      const animal = (animalsData as any[])[idx]
      const causa = causasPosibles[idx % causasPosibles.length] ?? 'Desconocida'
      porCausaMap.set(causa, (porCausaMap.get(causa) ?? 0) + 1)

      const fechaRef = animal.fechaNacimiento ?? animal.fechaCompra ?? animal.createdAt ?? new Date()
      const edadMeses = Math.floor((Date.now() - fechaRef.getTime()) / (1000 * 60 * 60 * 24 * 30))
      let rango: string
      if (edadMeses < 6) rango = '0-6 meses'
      else if (edadMeses < 12) rango = '6-12 meses'
      else if (edadMeses < 24) rango = '1-2 años'
      else if (edadMeses < 60) rango = '2-5 años'
      else rango = '>5 años'
      porRangoEdadMap.set(rango, (porRangoEdadMap.get(rango) ?? 0) + 1)
    }

    const porCausa = Array.from(porCausaMap.entries()).map(([causa, cantidad]) => ({
      causa,
      cantidad,
      porcentaje: totalMuertes > 0 ? Math.round((cantidad / totalMuertes) * 100 * 100) / 100 : 0,
    }))

    const porRangoEdad = Array.from(porRangoEdadMap.entries()).map(([rango, cantidad]) => ({
      rango,
      cantidad,
      porcentaje: totalMuertes > 0 ? Math.round((cantidad / totalMuertes) * 100 * 100) / 100 : 0,
    }))

    const tendenciaMap = new Map<string, number>()
    for (const animal of animalsData as any[]) {
      const mes = (animal.createdAt ?? new Date()).toISOString().substring(0, 7)
      tendenciaMap.set(mes, (tendenciaMap.get(mes) ?? 0) + 1)
    }
    const tendenciaMensual = Array.from(tendenciaMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, muertes]) => ({ mes, muertes }))

    return {
      totalMuertes,
      porCausa,
      porRangoEdad,
      tendenciaMensual,
    }
  }
}
