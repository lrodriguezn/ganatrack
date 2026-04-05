import { injectable } from 'tsyringe'
import { and, eq, gte, lte } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { animales, serviciosVeterinariosAnimales, serviciosVeterinariosProductos } from '@ganatrack/database/schema'
import type { ReporteFiltrosDto, SanitarioReportDto } from '../dtos/reportes.dto.js'

@injectable()
export class GetSanitarioReportUseCase {
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async execute(predioId: number, filtros?: ReporteFiltrosDto): Promise<SanitarioReportDto> {
    const fechaInicio = filtros?.fechaInicio ? new Date(filtros.fechaInicio) : new Date(new Date().getFullYear(), 0, 1)
    const fechaFin = filtros?.fechaFin ? new Date(filtros.fechaFin) : new Date()

    // Get servicios veterinarios via grupal join
    const servicios = await this.db
      .select({
        id: serviciosVeterinariosAnimales.id,
        fecha: serviciosVeterinariosAnimales.fecha,
        animalId: serviciosVeterinariosAnimales.animalId,
        diagnosticoId: serviciosVeterinariosAnimales.diagnosticoId,
        tratamiento: serviciosVeterinariosAnimales.tratamiento,
        medicamentos: serviciosVeterinariosAnimales.medicamentos,
      })
      .from(serviciosVeterinariosAnimales)
      .innerJoin(
        serviciosVeterinariosProductos,
        eq(serviciosVeterinariosProductos.servicioAnimalId, serviciosVeterinariosAnimales.id)
      )
      .where(
        and(
          gte(serviciosVeterinariosAnimales.fecha, fechaInicio),
          lte(serviciosVeterinariosAnimales.fecha, fechaFin)
        )
      )

    // Get animal codes
    const animalIds = [...new Set(servicios.map((s: any) => s.animalId).filter(Boolean) as number[])]
    const animalsMap = new Map<number, string>()
    if (animalIds.length > 0) {
      const animalsData = await this.db
        .select({ id: animales.id, codigo: animales.codigo })
        .from(animales)
        .where(eq(animales.predioId, predioId))
      animalsData.forEach((a: any) => animalsMap.set(a.id, a.codigo))
    }

    // Group by event type (using diagnosticoId as proxy)
    const eventosPorTipoMap = new Map<string, number>()
    for (const servicio of servicios as any[]) {
      const nombre = servicio.diagnosticoId
        ? `Diagnóstico ${servicio.diagnosticoId}`
        : 'Tratamiento general'
      eventosPorTipoMap.set(nombre, (eventosPorTipoMap.get(nombre) ?? 0) + 1)
    }

    const eventosPorTipo = Array.from(eventosPorTipoMap.entries())
      .map(([tipo, cantidad]) => ({ tipo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    const vacunacionesPendientes: SanitarioReportDto['vacunacionesPendientes'] = []

    const tratamientosAplicados = (servicios as any[]).slice(0, 100).map((s: any) => ({
      fecha: s.fecha.toISOString(),
      animalCodigo: s.animalId ? (animalsMap.get(s.animalId) ?? `Animal ${s.animalId}`) : 'N/A',
      diagnostico: s.diagnosticoId ? `Diagnóstico ${s.diagnosticoId}` : 'Sin diagnóstico',
      tratamiento: s.tratamiento ?? 'Tratamiento aplicado',
      producto: s.medicamentos ?? 'Medicamento',
    }))

    return {
      eventosPorTipo,
      vacunacionesPendientes,
      tratamientosAplicados,
    }
  }
}
