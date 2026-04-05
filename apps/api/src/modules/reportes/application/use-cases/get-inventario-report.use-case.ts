import { injectable } from 'tsyringe'
import { and, eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { animales, configRazas, potreros } from '@ganatrack/database/schema'
import type { InventarioReportDto, ReporteFiltrosDto } from '../dtos/reportes.dto.js'

@injectable()
export class GetInventarioReportUseCase {
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async execute(predioId: number, filtros?: ReporteFiltrosDto): Promise<InventarioReportDto> {
    const conditions = [eq(animales.predioId, predioId), eq(animales.activo, 1)]
    if (filtros?.potreroId) {
      conditions.push(eq(animales.potreroId, filtros.potreroId))
    }
    if (filtros?.razaId) {
      conditions.push(eq(animales.configRazasId, filtros.razaId))
    }

    const animalsData = await this.db
      .select({
        id: animales.id,
        codigo: animales.codigo,
        nombre: animales.nombre,
        estadoAnimalKey: animales.estadoAnimalKey,
        potreroId: animales.potreroId,
        configRazasId: animales.configRazasId,
      })
      .from(animales)
      .where(and(...conditions))

    const potrerosData = await this.db
      .select({ id: potreros.id, nombre: potreros.nombre })
      .from(potreros)
      .where(eq(potreros.predioId, predioId))
    const potreroMap = new Map(potrerosData.map((p: any) => [p.id, p.nombre as string]))

    const razasData = await this.db
      .select({ id: configRazas.id, nombre: configRazas.nombre })
      .from(configRazas)
    const razaMap = new Map(razasData.map((r: any) => [r.id, r.nombre as string]))

    const porCategoriaMap = new Map<number, number>()
    const porRazaMap = new Map<number, number>()
    const porPotreroMap = new Map<number, number>()

    for (const animal of animalsData as any[]) {
      const estadoKey = animal.estadoAnimalKey ?? 0
      porCategoriaMap.set(estadoKey, (porCategoriaMap.get(estadoKey) ?? 0) + 1)
      if (animal.configRazasId) {
        porRazaMap.set(animal.configRazasId, (porRazaMap.get(animal.configRazasId) ?? 0) + 1)
      }
      if (animal.potreroId) {
        porPotreroMap.set(animal.potreroId, (porPotreroMap.get(animal.potreroId) ?? 0) + 1)
      }
    }

    const estadoLabels: Record<number, string> = {
      0: 'Activo',
      1: 'En producción',
      2: 'Seco',
      3: 'En crecimiento',
      4: 'Descartado',
    }

    const resumen = {
      totalAnimales: animalsData.length,
      porCategoria: Array.from(porCategoriaMap.entries()).map(([key, cantidad]) => ({
        categoria: estadoLabels[key] ?? `Estado ${key}`,
        cantidad,
      })),
      porRaza: Array.from(porRazaMap.entries()).map(([id, cantidad]) => ({
        raza: (razaMap.get(id) ?? `Raza ${id}`) as string,
        cantidad,
      })),
      porPotrero: Array.from(porPotreroMap.entries()).map(([id, cantidad]) => ({
        potrero: (potreroMap.get(id) ?? `Potrero ${id}`) as string,
        cantidad,
      })),
    }

    const detalle = (animalsData as any[]).map((animal: any) => ({
      animalId: animal.id,
      codigo: animal.codigo,
      nombre: (animal.nombre ?? '') as string,
      categoria: estadoLabels[animal.estadoAnimalKey ?? 0] ?? `Estado ${animal.estadoAnimalKey}`,
      raza: (animal.configRazasId ? (razaMap.get(animal.configRazasId) ?? 'Sin raza') : 'Sin raza') as string,
      potrero: (animal.potreroId ? (potreroMap.get(animal.potreroId) ?? 'Sin potrero') : 'Sin potrero') as string,
      estado: animal.estadoAnimalKey === 0 ? 'Activo' : 'Inactivo',
    }))

    return { resumen, detalle }
  }
}
