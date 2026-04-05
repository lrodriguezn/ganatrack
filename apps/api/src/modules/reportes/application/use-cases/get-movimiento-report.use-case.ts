import { injectable } from 'tsyringe'
import { eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { animales } from '@ganatrack/database/schema'
import type { MovimientoReportDto, ReporteFiltrosDto } from '../dtos/reportes.dto.js'

@injectable()
export class GetMovimientoReportUseCase {
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async execute(predioId: number, filtros?: ReporteFiltrosDto): Promise<MovimientoReportDto> {
    const fechaInicio = filtros?.fechaInicio ? new Date(filtros.fechaInicio) : new Date(new Date().getFullYear(), 0, 1)
    const fechaFin = filtros?.fechaFin ? new Date(filtros.fechaFin) : new Date()

    const animalsData = await this.db
      .select({
        id: animales.id,
        codigo: animales.codigo,
        fechaCompra: animales.fechaCompra,
        tipoIngresoId: animales.tipoIngresoId,
        precioCompra: animales.precioCompra,
        pesoCompra: animales.pesoCompra,
        indDescartado: animales.indDescartado,
        createdAt: animales.createdAt,
      })
      .from(animales)
      .where(eq(animales.predioId, predioId))

    // Purchases: animals with fechaCompra in range
    const compras = (animalsData as any[]).filter((a: any) =>
      a.fechaCompra &&
      a.fechaCompra >= fechaInicio &&
      a.fechaCompra <= fechaFin
    )

    // Sales: animals discarded (indDescartado === 1)
    const ventas = (animalsData as any[]).filter((a: any) =>
      (a.indDescartado === 1) &&
      a.createdAt &&
      a.createdAt >= fechaInicio &&
      a.createdAt <= fechaFin
    )

    const totalCompras = compras.reduce((sum: number, a: any) => sum + (a.precioCompra ?? 0), 0)
    const totalVentas = ventas.reduce((sum: number, a: any) => sum + (a.precioCompra ?? 0), 0)

    // Group by month
    const porMesMap = new Map<string, { compras: number; ventas: number; saldo: number }>()

    for (const compra of compras as any[]) {
      if (compra.fechaCompra) {
        const mes = compra.fechaCompra.toISOString().substring(0, 7)
        const current = porMesMap.get(mes) ?? { compras: 0, ventas: 0, saldo: 0 }
        current.compras += compra.precioCompra ?? 0
        current.saldo += compra.precioCompra ?? 0
        porMesMap.set(mes, current)
      }
    }

    for (const venta of ventas as any[]) {
      if (venta.createdAt) {
        const mes = venta.createdAt.toISOString().substring(0, 7)
        const current = porMesMap.get(mes) ?? { compras: 0, ventas: 0, saldo: 0 }
        current.ventas += venta.precioCompra ?? 0
        current.saldo -= venta.precioCompra ?? 0
        porMesMap.set(mes, current)
      }
    }

    const porMes = Array.from(porMesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, data]) => ({ mes, ...data }))

    const detalles = [
      ...(compras as any[]).map((c: any) => ({
        fecha: c.fechaCompra?.toISOString() ?? '',
        tipo: 'compra' as const,
        animalCodigo: c.codigo,
        precio: c.precioCompra ?? 0,
        peso: c.pesoCompra ?? 0,
      })),
      ...(ventas as any[]).map((v: any) => ({
        fecha: v.createdAt?.toISOString() ?? '',
        tipo: 'venta' as const,
        animalCodigo: v.codigo,
        precio: v.precioCompra ?? 0,
        peso: v.pesoCompra ?? 0,
      })),
    ].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 100)

    return {
      totalCompras,
      totalVentas,
      saldoNeto: totalCompras - totalVentas,
      porMes,
      detalles,
    }
  }
}
